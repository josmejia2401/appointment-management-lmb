const { handler } = require('../index');
async function test() {
    const event = {
        body: JSON.stringify({
            name: 'nombre de la empresa o administrador',
            description: 'lastName',
            recordStatus: 1,
            duration: 30,
        }),
        pathParameters: {
            id: "3772832d-6ca0-4659-890e-fd55c3296cda"
        }
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();