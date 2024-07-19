const registerService = require("./services/forgot-password.service");
exports.handler = async (event, context) => {
    return registerService.doAction(event, context);
}