const constants = require("./constants");

exports.info = function (payload = { traceId: null, message: null }) {
    if (["INFO", "ERROR"].includes(constants.constants.LOGGER_LEVEL)) {
        console.info({
            "timestamp": new Date().toISOString(),
            "level": 'INFO',
            "traceId": payload.traceId,
            "message": payload.message
        });
    }
}

exports.log = function (payload = { traceId: null, message: null }) {
    if (["INFO", "ERROR", "DEBUG", "WARN"].includes(constants.constants.LOGGER_LEVEL)) {
        console.log({
            "timestamp": new Date().toISOString(),
            "level": 'LOG',
            "traceId": payload.traceId,
            "message": payload.message
        });
    }
}


/**
 * {
 *   "timestamp": "2023-12-08T23:21:04.632Z",
 *   "level": "INFO",
 *   "traceId": "405a4537-9226-4216-ac59-64381ec8654a",
 *   "message": {
 *        "errorType": "ReferenceError",
 *        "errorMessage": "some reference error",
 *        "stackTrace": [
 *            "ReferenceError: some reference error",
 *            "    at Runtime.handler (file:///var/task/index.mjs:3:12)",
 *            "    at Runtime.handleOnceNonStreaming (file:///var/runtime/index.mjs:1173:29)"
 *        ]
 *    }
 * }
 * @param {*} payload 
 */
exports.error = function (payload = { traceId: null, message: null }) {
    if (["INFO", "ERROR"].includes(constants.constants.LOGGER_LEVEL)) {
        console.error({
            "timestamp": new Date().toISOString(),
            "level": "ERROR",
            "traceId": payload.traceId,
            "message": payload.message
        });
    }
}

exports.warn = function (payload = { traceId: null, message: null }) {
    if (["WARN", "ERROR", "INFO"].includes(constants.constants.LOGGER_LEVEL)) {
        console.warn({
            "timestamp": new Date().toISOString(),
            "level": "WARN",
            "traceId": payload.traceId,
            "message": payload.message
        });
    }
}

exports.debug = function (payload = { traceId: null, message: null }) {
    if (["DEBUG", "ERROR", "INFO"].includes(constants.constants.LOGGER_LEVEL)) {
        console.debug({
            "timestamp": new Date().toISOString(),
            "level": "DEBUG",
            "traceId": payload.traceId,
            "message": payload.message
        });
    }
}
