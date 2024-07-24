exports.getTraceID = function (headers) {
    return headers["x-amzn-trace-id"] || headers["X-Amzn-Trace-Id"] || "unset";
}
