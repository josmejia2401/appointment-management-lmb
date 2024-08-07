const userData = require('../data/users.data');
const tokenData = require('../data/token.data');
const { buildInternalError, buildUnauthorized } = require('../lib/global-exception-handler');
const { findStatusById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { buildUuid } = require('../lib/util');
const { JWT } = require('../lib/jwt');
const logger = require('../lib/logger');

exports.doAction = async function (event, context) {
    try {
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);
            const payload = {
                expressionAttributeValues: {
                    ':username': {
                        'S': `${body.username}`
                    },
                    ':password': {
                        'S': `${body.password}`
                    },
                    ':recordStatus': {
                        'N': `${findStatusById(1).id}`
                    }
                },
                projectionExpression: 'id, firstName, lastName, email, username',
                filterExpression: 'username=:username AND password=:password AND recordStatus=:recordStatus',
                limit: 1
            };
            const options = {
                requestId: context.awsRequestId
            };
            const resultData = await userData.scan(payload, options);
            if (resultData.results.length === 0) {
                return buildUnauthorized('Error al iniciar sesión; ID de usuario o contraseña son incorrectos');
            } else {
                const payloadToken = {
                    expressionAttributeValues: {
                        ':userId': {
                            S: resultData.results[0].id
                        }
                    },
                    projectionExpression: undefined,
                    filterExpression: 'userId=:userId'
                };
                const tokens = await tokenData.scan(payloadToken, options);
                if (tokens.length > 0) {
                    const promises = tokens.map(token => tokenData.deleteItem({
                        key: {
                            id: {
                                S: token.id
                            }
                        }
                    }, options));
                    await Promise.all(promises);
                }
                const tokenId = buildUuid();

                const accessToken = JWT.sign({
                    username: resultData.results[0].username,
                    name: resultData.results[0].firstName,
                    tokenId: tokenId,
                    id: resultData.results[0].id
                });

                tokenData.putItem({
                    id: tokenId,
                    userId: resultData.results[0].id,
                    accessToken: accessToken,
                    createdAt: new Date().toISOString(),
                }, options);
                return successResponse({
                    accessToken: accessToken
                });
            }
        } else {
            return buildInternalError('Error al iniciar sesión; ID de usuario o contraseña no han sido proveídos');
        }
    } catch (err) {
        logger.error({ message: err, requestId: '' });
        return buildInternalError("Error al iniciar sesión; Error interno, intenta más tarde")
    }
}