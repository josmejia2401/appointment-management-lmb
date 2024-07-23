
const servicesData = require('../data/services.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { successResponse } = require('../lib/response-handler');
const { getTraceID } = require('../lib/util');
const logger = require('../lib/logger');
const { JWT } = require('../lib/jwt');

exports.doAction = async function (event, _context) {
    const traceID = getTraceID(event.headers || {});
    try {
        logger.info({ message: JSON.stringify(event), requestId: traceID });
        //queryStringParameters
        if (event.queryStringParameters !== undefined && event.queryStringParameters !== null) {
            const queryStringParameters = event.queryStringParameters;

            const authorization = event.headers?.Authorization || event.headers?.authorization;
            const tokenDecoded = JWT.decodeToken(authorization);

            const options = {
                requestId: traceID
            };

            let filterExpression = '#userId=:userId';

            const expressionAttributeValues = {
                ":userId": {
                    "S": `${tokenDecoded?.keyid}`
                }
            };

            const expressionAttributeNames = {
                "#userId": "userId"
            };

            if (queryStringParameters.name) {
                expressionAttributeValues[":name"] = {
                    "S": queryStringParameters.name
                };
                expressionAttributeNames["#name"] = "name";
                filterExpression = `${filterExpression} AND contains(#name,:name)`;
            }
            if (queryStringParameters.description) {
                expressionAttributeValues[":description"] = {
                    "S": queryStringParameters.description
                };
                expressionAttributeNames["#description"] = "description";
                filterExpression = `${filterExpression} AND contains(#description,:description)`;
            }
            if (queryStringParameters.recordStatus) {
                expressionAttributeValues[":recordStatus"] = {
                    "N": `${queryStringParameters.recordStatus}`
                };
                expressionAttributeNames["#recordStatus"] = "recordStatus";
                filterExpression = `${filterExpression} AND #recordStatus=:recordStatus`;
            }


            let lastEvaluatedKey = undefined;
            // solo se usan para la siguiente llave
            if (queryStringParameters.userId && queryStringParameters.id) {
                lastEvaluatedKey = {
                    userId: {
                        S: queryStringParameters.userId
                    },
                    id: {
                        S: queryStringParameters.id
                    }
                }
            }

            const response = await servicesData.scan({
                expressionAttributeValues: expressionAttributeValues,
                expressionAttributeNames: expressionAttributeNames,
                projectionExpression: undefined,
                filterExpression: filterExpression,
                limit: 10,
                lastEvaluatedKey: lastEvaluatedKey
            }, options);
            return successResponse(response);
        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}