const mainService = require("./services/main.service");
exports.handler = async (event, context) => {
    return registerService.mainService(event, context);
}