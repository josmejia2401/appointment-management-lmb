const registerService = require("./services/register.service");
exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return registerService.doAction(event, context);
}