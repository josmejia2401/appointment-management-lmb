console.log(">>>>>>>>>>>>>>>>1");
const { constants } = require("./lib/constants");
const { buildServiceUnavailableError } = require("./lib/global-exception-handler");
const mainService = require("./services/main.service");
console.log(">>>>>>>>>>>>>>>>2");
exports.handler = async (event, context) => {
    console.log(">>>>>>>>>>>>>>>>3");
    context.callbackWaitsForEmptyEventLoop = false;
    console.log(">>>>>>>>>>>>>>>>4");
    if (constants.SERVICE_UNAVAILABLE === '1') {
        console.log(">>>>>>>>>>>>>>>>5");
        return buildServiceUnavailableError();
    }
    console.log(">>>>>>>>>>>>>>>>6");
    return mainService.doAction(event, context);
}