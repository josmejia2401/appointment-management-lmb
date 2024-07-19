const loginService = require("./services/login.service");
exports.handler = async (event, context) => {
    return loginService.doAction(event, context);
}