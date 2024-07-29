const { handler } = require('../index');
async function test() {
    const event = {
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lMyIsImtleWlkIjoiOTBjZjhmMDUtY2Q5Ny00NDkyLWFiYTktNDg2ZDI2ZGE5NDJhIiwiaWF0IjoxNzIxNzU0MjU0LCJleHAiOjE3NTMyOTAyNTQsImF1ZCI6ImFwcG1hIiwiaXNzIjoiZmlyc3ROYW1lIiwic3ViIjoidXNlcm5hbWUzIiwianRpIjoiNTY2OTQxZDktZTMxNi00ZjNlLWJmZTgtNDkzNDE0ZmY5MWI4In0.L7BwzwEMsRUkiaNNSZ57WByhUb8Ztbi3hGylUKjAi78"
        },
        pathParameters: {
            id: "14e70f1d-4cf9-4e2d-bb89-e4716611b3ef"
        },
        body: JSON.stringify({
            userId: "14e70f1d-4cf9-4e2d-bb89-e4716611b3ef",
            recordStatus: 2,
        })
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();