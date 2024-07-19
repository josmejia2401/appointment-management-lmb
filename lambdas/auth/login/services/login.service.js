import * as userData from '../data/users.data';
import * as tokenData from '../data/token.data';
import { buildInternalError, buildUnauthorized } from '../lib/global-exception-handler';
import { findStatusById } from '../lib/list_values';
import { successResponse } from '../lib/response-handler';
import { buildUuid } from '../lib/util';
import { JWT } from '../lib/jwt';
export async function doAction(event, context) {
    try {
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);
            const payload = {
                expressionAttributeValues: {
                    ':username': {
                        S: body.username
                    },
                    ':password': {
                        S: body.password
                    },
                    ':status': {
                        N: `${findStatusById(1).id}`
                    }
                },
                projectionExpression: 'id, firstName, lastName, email',
                filterExpression: 'username=:username AND password=:password AND status=:status'
            };
            const options = {
                requestId: context.awsRequestId
            };
            const resultData = await userData.scan(payload, options);
            if (resultData.length === 0) {
                return buildUnauthorized('Error al iniciar sesión; ID de usuario o contraseña son incorrectos');
            } else {
                const payloadToken = {
                    expressionAttributeValues: {
                        ':userId': {
                            S: resultData[0].id
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
                    username: resultData[0].username,
                    name: resultData[0].firstName,
                    t_hash: tokenId,
                    u_hash: resultData[0].id
                });
                tokenData.putItem({
                    id: tokenId,
                    userId: resultData[0].id,
                    token: accessToken,
                    createdAt: new Date().toISOString(),
                }, options);
                return successResponse({
                    accessToken: accessToken
                });
            }
        }
    } catch (err) {
        return buildInternalError("Error al iniciar sesión; Error interno, intenta más tarde")
    }
}