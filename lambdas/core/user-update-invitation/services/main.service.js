
const mainData = require('../data/main.data');
const { buildInternalError, buildBadRequestError, buildForbiddenError } = require('../lib/global-exception-handler');
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
                return buildForbiddenError('Al parecer la solicitud no está permitida.');
            }

            const options = {
                requestId: traceID
            };

            const payload = {
                username: body.username || "",
                recordStatus: findStatusById(body.recordStatus)?.id,
            };

            const errorBadRequest = validatePayload(payload);
            if (errorBadRequest) {
                return errorBadRequest;
            }

            const user = await mainData.getItem({
                key: {
                    id: {
                        S: `${pathParameters.id}`
                    },
                },
                projectionExpression: 'invitations'
            }, options);

            if (user.invitations.length === 0) {
                return buildBadRequestError('¡Ups! No tienes invitaciones disponibles.');
            }

            const clients = await mainData.scan({
                expressionAttributeNames: {
                    "#username": "username"
                },
                expressionAttributeValues: {
                    ":username": {
                        S: payload.username
                    }
                },
                filterExpression: "#username=:username",
                limit: 1,
                projectionExpression: 'id, username, employees'
            }, options);

            if (clients.results.length === 0) {
                return buildBadRequestError('¡Ups! El empleado no existe.');
            }

            const clientFound = clients.results[0];

            // se busca la invitación pendiente de aceptar o rechazar
            const index = user.invitations.findIndex(p => p.userId === clientFound.id && p.recordStatus === 3);
            if (index === -1) {
                return buildBadRequestError('¡Ups! La invitación no existe.');
            }

            // se busca la invitación pendiente de aceptar o rechazar en el cliente o usuario padre
            const indexClient = clientFound.employees.findIndex(p => p.userId === pathParameters.id && p.recordStatus === 3);
            if (indexClient === -1) {
                return buildBadRequestError('¡Ups! La invitación no existe en fuente.');
            }


            await mainData.updateItem({
                key: {
                    id: {
                        S: `${pathParameters.id}`
                    },
                },
                expressionAttributeNames: {
                    "#invitations": "invitations",
                },
                expressionAttributeValues: {
                    ":recordStatusValue": {
                        M: {
                            recordStatus: {
                                N: `${payload.recordStatus}`
                            },
                            userId: {
                                S: `${clientFound.id}`
                            },
                            createdAt: {
                                S: `${new Date().toISOString()}`
                            }
                        }
                    }
                },
                updateExpression: `SET #invitations[${index}] = :recordStatusValue`,
                conditionExpression: undefined,
                filterExpression: undefined
            }, options);


            await mainData.updateItem({
                key: {
                    id: {
                        S: `${clientFound.id}`
                    },
                },
                expressionAttributeNames: {
                    "#employees": "employees",
                },
                expressionAttributeValues: {
                    ":recordStatusValue": {
                        M: {
                            recordStatus: {
                                N: `${payload.recordStatus}`
                            },
                            userId: {
                                S: `${pathParameters.id}`
                            },
                            createdAt: {
                                S: `${new Date().toISOString()}`
                            }
                        }
                    }
                },
                updateExpression: `SET #employees[${indexClient}] = :recordStatusValue`,
                conditionExpression: undefined,
                filterExpression: undefined
            }, options);

            return successResponse({
                "message": "ok"
            });

        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}