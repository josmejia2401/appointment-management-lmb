const tokenData = require('../data/token.data');
const { JWT } = require('../lib/jwt');
const logger = require('../lib/logger');

const generatePolicy = function (principalId, effect, resource) {
    const authResponse = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "isAuthorized": effect === "Allow",
    };
    return authResponse;
}

exports.doAction = async function (event, context) {
    try {
        const headers = event.headers;
        const authorization = headers?.Authorization || headers?.authorization || event.authorizationToken;
        if (!authorization) {
            //return generatePolicy("guest", "Deny", event.routeArn); // se debe usar cuando no tiene acceso a un recurso, es decir, path
            return "Unauthorized";
        }
        if (!JWT.isValidToken(authorization)) {
            //return generatePolicy(tokenData.sub, "Deny", event.routeArn);
            return "Unauthorized";
        }

        const tokenDecoded = JWT.decodeToken(authorization);
        const options = {
            requestId: event.requestContext?.requestId
        };
        const resultData = await tokenData.getItem({
            key: {
                id: {
                    S: `${tokenDecoded.jti}`
                }
            },
            projectionExpression: 'id, accessToken, userId, createdAt',
        }, options);


        if (!resultData) {
            return "Unauthorized";
        } else {
            const tokenSelected = resultData;
            if (tokenDecoded.keyid !== tokenSelected.userId ||
                !JWT.isValidToken(tokenSelected.accessToken) ||
                tokenSelected.accessToken !== JWT.getOnlyToken(authorization)) {
                await tokenData.deleteItem({
                    key: {
                        id: {
                            S: resultData.id
                        }
                    }
                }, options);
                return "Unauthorized";
            }
            return generatePolicy(tokenDecoded.sub, "Allow", event.routeArn);
        }
    } catch (err) {
        logger.error({ message: err, requestId: event.requestContext?.requestId });
        return "Error: Invalid token";
    }
}