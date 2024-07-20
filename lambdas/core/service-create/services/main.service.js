
const servicesData = require('../data/services.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById, findDocumentTypeById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { buildUuid } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');
const { JWT } = require('../lib/jwt');

exports.doAction = async function (event, context) {
    try {
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);
            const headers = event.headers;

            const authorization = headers?.Authorization || headers?.authorization || event.authorizationToken;
            const tokenDecoded = JWT.decodeToken(authorization);

            const options = {
                requestId: context.awsRequestId
            };
            const userId = buildUuid();
            const payload = {
                id: buildUuid(),
                userId: userId,
                userId: tokenDecoded?.keyid,
                name: body.name,
                description: body.description,
                duration: Number(body.duration),
                password: body.password,
                recordStatus: findStatusById(1)?.id,
                createdAt: new Date().toISOString()
            };

            const errorBadRequest = validatePayload(payload);
            if (errorBadRequest) {
                return errorBadRequest;
            }

            await servicesData.putItem(payload, options);
            return successResponse(payload);
        } else {
            return buildBadRequestError('Error al registrar usuario; Verifique la información suministrada.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: '' });
        return buildInternalError("¡Ups! Hemos tenido problemas para continuar con el proceso.")
    }
}