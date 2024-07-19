const { handler } = require('../index');
async function test() {
    const event = {
        body: JSON.stringify({
            firstName: 'nombre de la empresa o administrador',
            lastName: 'lastName',
            email: 'email@email.com',
            username: 'username1',
            password: 'password',
            documentType: 1,
            documentNumber: '1234',
        })
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();