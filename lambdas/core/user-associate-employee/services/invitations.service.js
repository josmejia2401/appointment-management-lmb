
const mainData = require('../data/main.data');
const { buildInternalError } = require('../lib/global-exception-handler');
const { successResponse } = require('../lib/response-handler');
const logger = require('../lib/logger');

/**
 * 
 * @param { Empleado al cual se le envía la invitación } employee 
 * @param { Empresa que realiza la invitación } userId 
 * @param { Estado de la invitación } recordStatus 
 * @param {*} traceID 
 * @returns 
 */
exports.doInvite = async function (employee, userId, recordStatus, traceID) {
    try {
        logger.info({ message: employee, recordStatus: recordStatus, userId: userId, requestId: traceID });


        const options = {
            requestId: traceID
        };

        //validar existencia de la empresa que invita al empleado esta asociada, si esta o no asociado.
        const index = employee.invitations.findIndex(p => p.userId === userId);
        if (index !== -1) {
            const employeeFound = employee.invitations[index];
            // mismo estado, no hace nada.
            if (employeeFound.recordStatus === recordStatus) {
                return;
            }
            await mainData.updateItem({
                key: {
                    id: {
                        S: `${employee.id}`
                    },
                },
                expressionAttributeNames: {
                    "#invitations": "invitations",
                },
                expressionAttributeValues: {
                    ":recordStatusValue": {
                        M: {
                            recordStatus: {
                                N: `${recordStatus}`
                            },
                            userId: {
                                S: `${userId}`
                            },
                            createdAt: {
                                S: `${new Date().toISOString()}`
                            }
                        }
                    }
                },
                updateExpression: `SET #invitations[${index}] = :recordStatusValue`,
                conditionExpression: undefined,
                filterExpression: undefined,
            }, options);
            // from: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
        } else {
            await mainData.updateItem({
                key: {
                    id: {
                        S: `${employee.id}`
                    },
                },
                expressionAttributeNames: {
                    "#invitations": "invitations"
                },
                expressionAttributeValues: {
                    ":invitations": {
                        L: [
                            {
                                M: {
                                    userId: {
                                        S: userId
                                    },
                                    recordStatus: {
                                        N: '3' // por defecto es PENDIENTE
                                    },
                                    createdAt: {
                                        S: `${new Date().toISOString()}`
                                    }
                                }
                            }
                        ]
                    }
                },
                updateExpression: "SET #invitations = list_append(#invitations, :invitations)",
                conditionExpression: undefined,
                filterExpression: "attribute_exists(username)"
            }, options);
        }
        return successResponse(body);
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}