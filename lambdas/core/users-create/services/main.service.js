
const mainData = require('../data/main.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { buildUuid, getTraceID } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');

exports.doAction = async function (event, context) {
    const traceID = getTraceID(event.headers || {});
    try {
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);

            const options = {
                requestId: context.awsRequestId
            };
            const id = buildUuid();
            const payload = {
                id: id,
                username: body.username,
                password: body.password,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email || "",
                phoneNumber: body.phoneNumber || "",
                recordStatus: findStatusById(1)?.id || 0,
                createdAt: new Date().toISOString(),

                documentType: 0,
                documentNumber: '',
                employees: [],
                invitations: []
            };

            const errorBadRequest = validatePayload(payload);
            if (errorBadRequest) {
                return errorBadRequest;
            }

            const userFounded = await mainData.scan({
                expressionAttributeValues: {
                    ":username": {
                        S: `${payload.username}`
                    }
                },
                filterExpression: 'username=:username',
                projectionExpression: 'username',
                limit: 1
            }, options);

            if (userFounded.results.length > 0) {
                return buildBadRequestError('Al parecer el usuario ya existe. Verifica los datos, por favor.');
            }

            await mainData.putItem(payload, options);
            return successResponse(payload);
        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}