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
        //statementOne.Resource = [resource, "*"];
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        isAuthorized: effect === "Allow",
    };

    console.log("authResponse", JSON.stringify(authResponse));
    return authResponse;
}

async function processTokenFounded(authorization, tokenDecoded, resultData, event, callback) {
    if (resultData) {
        if (tokenDecoded.keyid !== resultData.userId || !JWT.isValidToken(resultData.accessToken) || resultData.accessToken !== JWT.getOnlyToken(authorization)) {
            tokenData.deleteItem({
                key: {
                    id: {
                        S: resultData.id
                    }
                }
            }, options).then(r => {
                console.log("deleteItem", r);
                callback("Unauthorized");
            });
        } else {
            console.log("exitoso");
            //callback(null, generatePolicy(tokenDecoded.sub || "guest", "Allow", event.methodArn || event.routeArn));
            callback(null, generatePolicy(tokenDecoded.sub || "guest", "Allow", event.methodArn || event.routeArn));
        }
    } else {
        console.log("sin token encontrado");
        //callback("Unauthorized");
        callback(null, generatePolicy(tokenDecoded.sub|| "guest", "Deny", event.methodArn || event.routeArn));
    }
}

exports.doAction = (event, context, callback) => {
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        console.log(">>>>>>>>>>>>>>>>>>>>>>", JSON.stringify(event));
        const headers = event.headers;
        const authorization = headers?.Authorization || headers?.authorization || event.authorizationToken;
        if (authorization && JWT.isValidToken(authorization)) {
            const tokenDecoded = JWT.decodeToken(authorization);
            const options = {
                requestId: event.requestContext?.requestId
            };
            tokenData.getItem({
                key: {
                    id: {
                        S: `${tokenDecoded.jti}`
                    }
                }, projectionExpression: 'id, accessToken, userId, createdAt',
            }, options).then(resultData => processTokenFounded(authorization, tokenDecoded, resultData, event, callback));
        } else {
            console.log("sin cabecera");
            callback("Unauthorized");
        }
    } catch (err) {
        logger.error({ message: err, requestId: event.requestContext?.requestId });
        callback("Error: Invalid token");
        //throw err;
    }
}