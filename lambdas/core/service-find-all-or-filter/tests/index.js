const { handler } = require('../index');
async function test() {
    const event = {
        "version": "1.0",
        "resource": "/api/core/services",
        "path": "/dev/api/core/services",
        "httpMethod": "GET",
        "headers": {
            "Content-Length": "0", "Host": "1xfslfeqxf.execute-api.us-east-1.amazonaws.com", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36", "X-Amzn-Trace-Id": "Root=1-66abaa79-20e2acd0599ba1fe21814507", "X-Forwarded-For": "186.84.22.90", "X-Forwarded-Port": "443", "X-Forwarded-Proto": "https", "accept": "application/json, text/plain, */*", "accept-encoding": "gzip, deflate, br, zstd", "accept-language": "es-US,es;q=0.9,en-US;q=0.8,en;q=0.7", "access-control-allow-origin": "*",
            "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lMTIzIiwia2V5aWQiOiJmMWUwOWU4YS03MzdiLTQwZDEtYWJhZS1hMGY1Njk4MDZiMjgiLCJpYXQiOjE3MjI1MjQwNDUsImV4cCI6MTc1NDA2MDA0NSwiYXVkIjoiYXBwbWEiLCJpc3MiOiJKT1NFIiwic3ViIjoidXNlcm5hbWUxMjMiLCJqdGkiOiI4NjBmZDExZS05MDFlLTQ4NDctOGVhNS1hYWQ0YmRjOTY2ZGUifQ.UBLI7OuRXRn7hWfrzttzkbsmMHK07FRixqcHEr-2oK0", "origin": "http://localhost:3000", "priority": "u=1, i"
        },
        "multiValueHeaders": { "Content-Length": ["0"], "Host": ["1xfslfeqxf.execute-api.us-east-1.amazonaws.com"], "User-Agent": ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"], "X-Amzn-Trace-Id": ["Root=1-66abaa79-20e2acd0599ba1fe21814507"], "X-Forwarded-For": ["186.84.22.90"], "X-Forwarded-Port": ["443"], "X-Forwarded-Proto": ["https"], "accept": ["application/json, text/plain, */*"], "accept-encoding": ["gzip, deflate, br, zstd"], "accept-language": ["es-US,es;q=0.9,en-US;q=0.8,en;q=0.7"], "access-control-allow-origin": ["*"], "authorization": ["Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lMTIzIiwia2V5aWQiOiJmMWUwOWU4YS03MzdiLTQwZDEtYWJhZS1hMGY1Njk4MDZiMjgiLCJpYXQiOjE3MjI1MjQwNDUsImV4cCI6MTc1NDA2MDA0NSwiYXVkIjoiYXBwbWEiLCJpc3MiOiJKT1NFIiwic3ViIjoidXNlcm5hbWUxMjMiLCJqdGkiOiI4NjBmZDExZS05MDFlLTQ4NDctOGVhNS1hYWQ0YmRjOTY2ZGUifQ.UBLI7OuRXRn7hWfrzttzkbsmMHK07FRixqcHEr-2oK0"], "origin": ["http://localhost:3000"], "priority": ["u=1, i"], "referer": ["http://localhost:3000/"] },
        "queryStringParameters": { "name": "" }, "multiValueQueryStringParameters": { "name": [""] }, "requestContext": { "accountId": "233925838033", "apiId": "1xfslfeqxf", "authorizer": { "claims": null, "scopes": null, "traceID": "Root=1-66abaa79-20e2acd0599ba1fe21814507" }, "domainName": "1xfslfeqxf.execute-api.us-east-1.amazonaws.com", "domainPrefix": "1xfslfeqxf", "extendedRequestId": "b1eTFgYfIAMEcKg=", "httpMethod": "GET", "identity": { "accessKey": null, "accountId": null, "caller": null, "cognitoAmr": null, "cognitoAuthenticationProvider": null, "cognitoAuthenticationType": null, "cognitoIdentityId": null, "cognitoIdentityPoolId": null, "principalOrgId": null, "sourceIp": "186.84.22.90", "user": null, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36", "userArn": null }, "path": "/dev/api/core/services", "protocol": "HTTP/1.1", "requestId": "b1eTFgYfIAMEcKg=", "requestTime": "01/Aug/2024:15:32:09 +0000", "requestTimeEpoch": 1722526329808, "resourceId": "GET /api/core/services", "resourcePath": "/api/core/services", "stage": "dev" }, "pathParameters": null, "stageVariables": null, "body": null, "isBase64Encoded": false
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();