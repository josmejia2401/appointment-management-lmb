const registerService = require("./services/register.service");
exports.handler = async (event, context) => {
    return registerService.doAction(event, context);
}