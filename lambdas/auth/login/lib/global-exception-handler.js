export function buildInternalError(message, stackTrace = [], errors = []) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: message,
            status: 500,
            stackTrace: stackTrace,
            errors: errors//[{ field: '', message: '' }]
        }),
    };
}

export function buildUnauthorized(message, stackTrace = [], errors = []) {
    return {
        statusCode: 401,
        body: JSON.stringify({
            message: message,
            status: 401,
            stackTrace: stackTrace,
            errors: errors//[{ field: '', message: '' }]
        }),
    };
}

