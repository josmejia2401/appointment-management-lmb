
const mainData = require('../data/main.data');
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

        if (queryStringParameters && queryStringParameters.firstName) {
            expressionAttributeValues[":firstName"] = {
                "S": queryStringParameters.firstName
            };
            expressionAttributeNames["#firstName"] = "firstName";
            filterExpression = `${filterExpression} AND contains(#firstName,:firstName)`;
        }

        if (queryStringParameters && queryStringParameters.lastName) {
            expressionAttributeValues[":lastName"] = {
                "S": queryStringParameters.lastName
            };
            expressionAttributeNames["#lastName"] = "lastName";
            filterExpression = `${filterExpression} AND contains(#lastName,:lastName)`;
        }

        if (queryStringParameters && queryStringParameters.recordStatus) {
            expressionAttributeValues[":recordStatus"] = {
                "N": `${queryStringParameters.recordStatus}`
            };
            expressionAttributeNames["#recordStatus"] = "recordStatus";
            filterExpression = `${filterExpression} AND #recordStatus=:recordStatus`;
        }


        if (queryStringParameters && queryStringParameters.documentType) {
            expressionAttributeValues[":documentType"] = {
                "N": `${queryStringParameters.documentType}`
            };
            expressionAttributeNames["#documentType"] = "documentType";
            filterExpression = `${filterExpression} AND #documentType=:documentType`;
        }

        if (queryStringParameters && queryStringParameters.documentNumber) {
            expressionAttributeValues[":documentNumber"] = {
                "S": `${queryStringParameters.documentNumber}`
            };
            expressionAttributeNames["#documentNumber"] = "documentNumber";
            filterExpression = `${filterExpression} AND #documentNumber=:documentNumber`;
        }

        let lastEvaluatedKey = undefined;
        // solo se usan para la siguiente llave
        if (queryStringParameters && queryStringParameters.userId && queryStringParameters.id) {
            lastEvaluatedKey = {
                userId: {
                    S: queryStringParameters.userId
                },
                id: {
                    S: queryStringParameters.id
                }
            }
        }

        const response = await mainData.scan({
            expressionAttributeValues: expressionAttributeValues,
            expressionAttributeNames: expressionAttributeNames,
            projectionExpression: undefined,
            filterExpression: filterExpression,
            limit: 10,
            lastEvaluatedKey: lastEvaluatedKey
        }, options);
        return successResponse(response);
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}