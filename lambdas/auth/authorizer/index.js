const tokenData = require('./data/token.data');
const { JWT } = require('./lib/jwt');
const logger = require('./lib/logger');
const { getTraceID } = require('./lib/util');

exports.handler = async (event) => {
    const traceId = getTraceID(event.headers || {});
    const response = {
        "isAuthorized": false,
        "context": {
            "traceID": traceId
        }
    };
    logger.info({ traceID: traceId, message: JSON.stringify(event) });
    try {
        const headers = event.headers;
        const authorization = headers?.Authorization || headers?.authorization || event.authorizationToken;
        if (authorization && JWT.isValidToken(authorization)) {
            const tokenDecoded = JWT.decodeToken(authorization);
            const options = {
                requestId: traceId
            };
            const resultData = await tokenData.getItem({
                key: {
                    id: {
                        S: `${tokenDecoded.jti}`
                    }
                }, projectionExpression: 'id, accessToken, userId, createdAt',
            }, options);

            if (resultData && tokenDecoded.keyid === resultData.userId && resultData.accessToken === JWT.getOnlyToken(authorization)) {
                response.isAuthorized = true;
            } else if (resultData && resultData.id) {
                await tokenData.deleteItem({
                    key: {
                        id: {
                            S: resultData.id
                        }
                    }
                }, options);
            }
        }
    } catch (err) {
        logger.error({ message: err, traceId: traceId });
    }
    logger.info({ traceID: traceId, message: JSON.stringify({ response: response }) });
    return response;
};