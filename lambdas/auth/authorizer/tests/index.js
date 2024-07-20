const { handler } = require('../index');
async function test() {
    const event = {
        "version": "2.0",
        "type": "REQUEST",
        "routeArn": "arn:aws:execute-api:us-east-1:123456789012:abcdef123/test/GET/request",
        "identitySource": ["user1", "123"],
        "routeKey": "$default",
        "rawPath": "/my/path",
        "rawQueryString": "parameter1=value1&parameter1=value2&parameter2=value",
        "cookies": ["cookie1", "cookie2"],
        "headers": {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwia2V5aWQiOiI0Y2YwMjM0My03MmM5LTQ5YzQtYjgyYS0xMjQxMDM2NzkyZjEiLCJpYXQiOjE3MjE0MzY4MzMsImV4cCI6MTc1Mjk3MjgzMywiYXVkIjoiYXBwbWEiLCJpc3MiOiJub21icmUgZGUgbGEgZW1wcmVzYSBvIGFkbWluaXN0cmFkb3IiLCJzdWIiOiJ1c2VybmFtZSIsImp0aSI6IjczYjNkMmRkLWRhNDItNDIyNy05NTM3LTgxNDBmMjAzZWU3NSJ9.gWDsdcNJzeRm9xOa7dPx55Q42Nv0witopYIpmwr0i_c",
            "header2": "value2"
        },
        "queryStringParameters": {
            "parameter1": "value1,value2",
            "parameter2": "value"
        },
        "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "authentication": {
                "clientCert": {
                    "clientCertPem": "CERT_CONTENT",
                    "subjectDN": "www.example.com",
                    "issuerDN": "Example issuer",
                    "serialNumber": "1",
                    "validity": {
                        "notBefore": "May 28 12:30:02 2019 GMT",
                        "notAfter": "Aug  5 09:36:04 2021 GMT"
                    }
                }
            },
            "domainName": "id.execute-api.us-east-1.amazonaws.com",
            "domainPrefix": "id",
            "http": {
                "method": "POST",
                "path": "/my/path",
                "protocol": "HTTP/1.1",
                "sourceIp": "IP",
                "userAgent": "agent"
            },
            "requestId": "id",
            "routeKey": "$default",
            "stage": "$default",
            "time": "12/Mar/2020:19:03:58 +0000",
            "timeEpoch": 1583348638390
        },
        "pathParameters": { "parameter1": "value1" },
        "stageVariables": { "stageVariable1": "value1", "stageVariable2": "value2" }
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();