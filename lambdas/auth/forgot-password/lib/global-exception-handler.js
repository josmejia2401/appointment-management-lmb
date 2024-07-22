exports.buildInternalError = function (message, stackTrace = [], errors = []) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: message,
            status: 500,
            stackTrace: stackTrace,
            errors: errors//[{ field: '', message: '' }]
        }),
        headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    };
}

exports.buildUnauthorized = function (message, stackTrace = [], errors = []) {
    return {
        statusCode: 401,
        body: JSON.stringify({
            message: message,
            status: 401,
            stackTrace: stackTrace,
            errors: errors//[{ field: '', message: '' }]
        }),
        headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    };
}


exports.buildBadRequestError = function (message, stackTrace = [], errors = []) {
    return {
        statusCode: 400,
        body: JSON.stringify({
            message: message,
            status: 400,
            stackTrace: stackTrace,
            errors: errors//[{ field: '', message: '' }]
        }),
        headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    };
}

exports.buildServiceUnavailableError = function () {
    return {
        statusCode: 503,
        body: JSON.stringify({
            message: 'No te preocupes.',
            error: 'Estamos realizando mejoras. En un momento estaremos al 100%.',
            status: 503,
            stackTrace: [],
            errors: []
        }),
        headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    };
}
