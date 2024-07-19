export function successResponse(payload) {
    return {
        statusCode: 200,
        isBase64Encoded: false,
        headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(payload),
    };
}