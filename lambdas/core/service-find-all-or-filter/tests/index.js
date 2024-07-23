const { handler } = require('../index');
async function test() {
    const event = {
        queryStringParameters: {
            name: "nameservicio 1"
        }
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();