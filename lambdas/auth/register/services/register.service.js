
const userData = require('../data/users.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById, findDocumentTypeById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { buildUuid } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');

exports.doAction = async function (event, context) {
    try {
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);

            const options = {
                requestId: context.awsRequestId
            };
            const userId = buildUuid();
            const payload = {
                id: userId,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                username: body.username,
                password: body.password,
                documentType: findDocumentTypeById(body.documentType)?.id,
                documentNumber: body.documentNumber,
                recordStatus: findStatusById(1)?.id,
                createdAt: new Date().toISOString(),
                employees: [],
                invitations: [],
            };

            const errorBadRequest = validatePayload(payload);
            if (errorBadRequest) {
                return errorBadRequest;
            }

            const userAlready = await userData.scan({
                expressionAttributeValues: {
                    ':username': {
                        'S': `${payload.username}`
                    }
                },
                projectionExpression: 'id, firstName, lastName, email, username',
                filterExpression: 'username=:username',
                limit: 1
            }, options);

            if (userAlready.length > 0) {
                return buildBadRequestError('¡Ups! Al parecer ya estas registrado.');
            }

            await userData.putItem(payload, options);
            return successResponse(payload);
        } else {
            return buildBadRequestError('Error al registrar usuario; Verifique la información suministrada.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: '' });
        return buildInternalError("¡Ups! Hemos tenido problemas para continuar con el proceso.")
    }
}