const loginService = require("./services/authorizer.service");
exports.handler = async (event, context) => {
    return loginService.doAction(event, context);
}