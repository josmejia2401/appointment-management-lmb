
const mainData = require('../data/main.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { getTraceID } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');
const { JWT } = require('../lib/jwt');
const { doInvite } = require('./invitations.service');

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
                projectionExpression: 'employees'
            }, options);

            const employee = await mainData.scan({
                expressionAttributeNames: {
                    "#username": "username"
                },
                expressionAttributeValues: {
                    ":username": {
                        S: payload.username
                    }
                },
                filterExpression: "#username=:username",
                limit: undefined,
                projectionExpression: 'id, username, invitations'
            }, options);

            if (employee.results.length === 0) {
                return buildBadRequestError('¡Ups! El empleado no existe.');
            }

            //validar existencia del empleado a asociar, si esta o no asociado.
            const index = user.employees.findIndex(p => p.userId === employee.results[0].id);
            if (index !== -1) {
                const employeeFound = user.employees[index];
                // mismo estado, no hace nada.
                if (employeeFound.recordStatus === payload.recordStatus) {
                    return buildBadRequestError('¡Ups! El empleado ya fue asociado.');
                }

                // Si el usuario no pretende eliminar la asociación, entonces no se puede actualizar.
                if (employeeFound.recordStatus === 3 && payload.recordStatus !== 4) {
                    return buildBadRequestError('¡Ups! El usuario no ha aceptado la invitación, por lo tanto no puede cambiar de estado.');
                }
                // Solo puede pasar a activo, si:
                // 1. El estado actual es INACTIVO
                if (employeeFound.recordStatus !== 2 && payload.recordStatus === 1) {
                    return buildBadRequestError('¡Ups! Estás intentando realizar una operación no permitida.');
                }
                // si el estado actual es eliminado, solo puede pasar a PENDIENTE.
                if (employeeFound.recordStatus === 4 && payload.recordStatus !== 3) {
                    return buildBadRequestError('Solo puede pasar a estado PENDIENTE.');
                }
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
                            M: {
                                recordStatus: {
                                    N: `${payload.recordStatus}`
                                },
                                userId: {
                                    S: `${employee.results[0].id}`
                                },
                                createdAt: {
                                    S: `${new Date().toISOString()}`
                                }
                            }
                        }
                    },
                    updateExpression: `SET #employees[${index}] = :recordStatusValue`,
                    conditionExpression: undefined,
                    filterExpression: "attribute_exists(username)"
                }, options);
                // from: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
            } else {
                // se invita al empleado a formar parte del equipo.
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
                                            S: employee.results[0].id
                                        },
                                        recordStatus: {
                                            N: '3', //Por defecto el estado es PENDIENTE.
                                        },
                                        createdAt: {
                                            S: `${new Date().toISOString()}`
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

            //Actualiza la invitación: Activa, inactiva y elimina.
            return await doInvite(employee.results[0], pathParameters.id, payload.recordStatus, traceID);
        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}