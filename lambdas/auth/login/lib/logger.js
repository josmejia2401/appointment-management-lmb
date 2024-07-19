import constants from "./constants";

export function info(payload = { requestId: null, message: null }) {
    if (["INFO", "ERROR"].includes(constants.LOGGER_LEVEL)) {
        console.info({
            "timestamp": new Date().toISOString(),
            "level": 'INFO',
            "requestId": payload.requestId,
            "message": payload.message
        });
    }
}

export function log(payload = { requestId: null, message: null }) {
    if (["INFO", "ERROR", "DEBUG", "WARN"].includes(constants.LOGGER_LEVEL)) {
        console.log({
            "timestamp": new Date().toISOString(),
            "level": 'LOG',
            "requestId": payload.requestId,
            "message": payload.message
        });
    }
}


/**
 * {
 *   "timestamp": "2023-12-08T23:21:04.632Z",
 *   "level": "INFO",
 *   "requestId": "405a4537-9226-4216-ac59-64381ec8654a",
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
export function error(payload = { requestId: null, message: null }) {
    if (["INFO", "ERROR"].includes(constants.LOGGER_LEVEL)) {
        console.error({
            "timestamp": new Date().toISOString(),
            "level": "ERROR",
            "requestId": payload.requestId,
            "message": payload.message
        });
    }
}

export function warn(payload = { requestId: null, message: null }) {
    if (["WARN", "ERROR", "INFO"].includes(constants.LOGGER_LEVEL)) {
        console.warn({
            "timestamp": new Date().toISOString(),
            "level": "WARN",
            "requestId": payload.requestId,
            "message": payload.message
        });
    }
}

export function debug(payload = { requestId: null, message: null }) {
    if (["DEBUG", "ERROR"].includes(constants.LOGGER_LEVEL)) {
        console.debug({
            "timestamp": new Date().toISOString(),
            "level": "DEBUG",
            "requestId": payload.requestId,
            "message": payload.message
        });
    }
}
