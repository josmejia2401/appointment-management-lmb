
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
        if (event.pathParameters !== undefined && event.pathParameters !== null) {
            const pathParameters = event.pathParameters;

            const authorization = event.headers?.Authorization || event.headers?.authorization;
            const tokenDecoded = JWT.decodeToken(authorization);

            if (pathParameters.id !== tokenDecoded?.keyid) {
                return buildBadRequestError('Al parecer la solicitud no está permitida.');
            }

            const options = {
                requestId: traceID
            };
            const response = await mainData.getItem({
                key: {
                    id: {
                        S: `${pathParameters.id}`
                    },
                },
                projectionExpression: 'employees'
            }, options);

            let employees = [];
            if (response && response.employees && response.employees.length > 0) {
                employees = await mainData.batchGetItem({
                    keys: response.employees.map(item => ({ id: { S: item.userId } })),
                    projectionExpression: 'id, username, firstName, lastName, email, phoneNumber, recordStatus, createdAt'
                });

                employees.forEach(p => {
                    const realStatus = response.employees.filter(x => x.userId === p.id)[0];
                    p.recordStatus = realStatus.recordStatus;
                });
            }

            return successResponse(response);
        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}