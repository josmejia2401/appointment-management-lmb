const { handler } = require('../index');
async function test() {
    const event = {
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lMyIsImtleWlkIjoiOTBjZjhmMDUtY2Q5Ny00NDkyLWFiYTktNDg2ZDI2ZGE5NDJhIiwiaWF0IjoxNzIxNzU0MjU0LCJleHAiOjE3NTMyOTAyNTQsImF1ZCI6ImFwcG1hIiwiaXNzIjoiZmlyc3ROYW1lIiwic3ViIjoidXNlcm5hbWUzIiwianRpIjoiNTY2OTQxZDktZTMxNi00ZjNlLWJmZTgtNDkzNDE0ZmY5MWI4In0.L7BwzwEMsRUkiaNNSZ57WByhUb8Ztbi3hGylUKjAi78"
        },
        body: JSON.stringify({
            id: 1,
            username:'username',
            password:'password',
            firstName: 'nombre de la empresa o administrador',
            lastName: 'lastName',
            email: 'email@email.com',
            phoneNumber: '3105397699',
            documentType: '1',
            documentNumber: '111',
            birthday: new Date().toISOString(),
            gender: 1,
            status: 1,
            createdAt: new Date(),
        })
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();