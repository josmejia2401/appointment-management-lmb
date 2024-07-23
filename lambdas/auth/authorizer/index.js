const loginService = require("./services/authorizer.service");
exports.handler = async (event, context, callback) => loginService.doAction(event, context, callback);