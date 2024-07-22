const loginService = require("./services/authorizer.service");
exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return loginService.doAction(event, context);
}