
const servicesData = require('../data/services.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { getTraceID } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');
const { JWT } = require('../lib/jwt');

exports.doAction = async function (event, _context) {
    const traceID = getTraceID(event.headers || {});
    try {
        logger.info({ message: JSON.stringify(event), requestId: traceID });
        //queryStringParameters
        if (event.pathParameters !== undefined && event.pathParameters !== null) {
            const pathParameters = event.pathParameters;
            const body = JSON.parse(event.body);

            const authorization = event.headers?.Authorization || event.headers?.authorization;
            const tokenDecoded = JWT.decodeToken(authorization);

            const options = {
                requestId: traceID
            };
            const payload = {
                name: body.name || "",
                description: body.description || "",
                duration: Number(body.duration || 0),
                recordStatus: findStatusById(body.recordStatus)?.id
            };

            const errorBadRequest = validatePayload(payload);
            if (errorBadRequest) {
                return errorBadRequest;
            }
            await servicesData.updateItem({
                key: {
                    id: {
                        S: `${pathParameters.id}`
                    },
                    userId: {
                        S: `${tokenDecoded?.keyid}`
                    }
                },
                expressionAttributeNames: {
                    "#name": "name",
                    "#description": "description",
                    "#duration": "duration",
                    "#recordStatus": "recordStatus",
                },
                expressionAttributeValues: {
                    ":name": {
                        "S": payload.name
                    },
                    ":description": {
                        "S": payload.description
                    },
                    ":duration": {
                        "N": `${payload.duration}`
                    },
                    ":recordStatus": {
                        "N": `${payload.recordStatus}`
                    },
                },
                updateExpression: "SET #name=:name, #description=:description, #duration=:duration, #recordStatus=:recordStatus",
                conditionExpression: undefined,
                filterExpression: "attribute_exists(userId)"
            }, options);
            return successResponse(body);
        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}