const uuid = require("uuid");

exports.buildUuid = function () {
    return uuid.v4();
}

exports.getTraceID = function (headers) {
    return headers["x-amzn-trace-id"] || headers["X-Amzn-Trace-Id"] || "unset";
}
