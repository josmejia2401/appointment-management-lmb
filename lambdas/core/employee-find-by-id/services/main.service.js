
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

            const options = {
                requestId: traceID
            };
            const response = await mainData.getItem({
                key: {
                    id: {
                        S: `${pathParameters.id}`
                    },
                    userId: {
                        S: `${tokenDecoded?.keyid}`
                    }
                },
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