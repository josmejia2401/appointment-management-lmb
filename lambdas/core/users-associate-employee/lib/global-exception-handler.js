exports.buildInternalError = function (message, stackTrace = [], errors = []) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: message,
            error: '¡Ups! Algo salió mal.',
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
            error: '¡Ups! Al parecer no te reconocemos.',
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


exports.buildForbiddenError = function (message, stackTrace = [], errors = []) {
    return {
        statusCode: 403,
        body: JSON.stringify({
            message: message,
            error: '¡Ups! Estas intentando hacer una operación no permitida.',
            status: 403,
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
            error: '¡Ups! No se pudo continuar...',
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
