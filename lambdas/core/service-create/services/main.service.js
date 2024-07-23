
const servicesData = require('../data/services.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { buildUuid, getTraceID } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');
const { JWT } = require('../lib/jwt');

exports.doAction = async function (event, context) {
    const traceID = getTraceID(event.headers || {});
    try {
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);
            const headers = event.headers;

            const authorization = headers?.Authorization || headers?.authorization || event.authorizationToken;
            const tokenDecoded = JWT.decodeToken(authorization);

            const options = {
                requestId: context.awsRequestId
            };
            const id = buildUuid();
            const payload = {
                id: id,
                userId: tokenDecoded?.keyid || "",
                name: body.name || "",
                description: body.description || "",
                duration: Number(body.duration || 0),
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
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}