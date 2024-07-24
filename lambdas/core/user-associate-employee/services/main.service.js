
const mainData = require('../data/main.data');
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


            if (pathParameters.id !== tokenDecoded?.keyid) {
                return buildBadRequestError('Al parecer la solicitud no está permitida.');
            }

            const options = {
                requestId: traceID
            };

            const payload = {
                userId: body.userId || "",
                recordStatus: findStatusById(body.recordStatus)?.id,
                createdAt: new Date().toISOString()
            };

            const errorBadRequest = validatePayload(payload);
            if (errorBadRequest) {
                return errorBadRequest;
            }

            const response = await mainData.getItem({
                key: {
                    id: {
                        S: `${pathParameters.id}`
                    },
                },
                projectionExpression: 'employees'
            }, options);

            const index = response.employees.findIndex(p => p.userId === payload.userId);
            if (index !== -1) {
                const exists = response.employees[index];
                if (exists.recordStatus === payload.recordStatus) {
                    return buildBadRequestError('El empleado ya fue asociado.');
                }
                // from: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
                await mainData.updateItem({
                    key: {
                        id: {
                            S: `${pathParameters.id}`
                        },
                    },
                    expressionAttributeNames: {
                        "#employees": "employees",
                    },
                    expressionAttributeValues: {
                        ":recordStatusValue": {
                            L: [
                                {
                                    M: {
                                        recordStatus: {
                                            N: `${payload.recordStatus}`
                                        },
                                        userId: {
                                            S: `${exists.userId}`
                                        },
                                        createdAt: {
                                            S: `${exists.createdAt}`
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    updateExpression: `SET #employees[${index}] = :recordStatusValue`,
                    conditionExpression: undefined,
                    filterExpression: "attribute_exists(username)"
                }, options);

            } else {
                await mainData.updateItem({
                    key: {
                        id: {
                            S: `${pathParameters.id}`
                        },
                    },
                    expressionAttributeNames: {
                        "#employees": "employees"
                    },
                    expressionAttributeValues: {
                        ":employees": {
                            L: [
                                {
                                    M: {
                                        userId: {
                                            S: payload.userId
                                        },
                                        recordStatus: {
                                            N: `${payload.recordStatus}`
                                        },
                                        createdAt: {
                                            S: payload.createdAt
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    updateExpression: "SET #employees = list_append(#employees, :employees)",
                    conditionExpression: undefined,
                    filterExpression: "attribute_exists(username)"
                }, options);
            }
            return successResponse(body);
        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}