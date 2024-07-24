const {
    DynamoDBClient,
    ScanCommand,
    PutItemCommand,
} = require("@aws-sdk/client-dynamodb");


const constants = require('../lib/constants');
const logger = require('../lib/logger');

const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });
const tableName = `tbl-${constants.constants.APP_NAME}-users-${constants.constants.ENVIRONMENT}`;


function buildItem(element) {
    if (element === undefined || element === null) {
        return undefined;
    }

    const employees = [];

    if (element.employees && element.employees.L) {
        element.employees.L.forEach(local => {
            const employee = {
                userId: local.userId.S,
                recordStatus: Number(local.recordStatus.N),
                createdAt: local.createdAt.S,
            };
            employees.push(employee);
        });
    }

    return {
        id: element.id?.S,
        username: element.username?.S,
        firstName: element.firstName?.S,
        lastName: element.lastName?.S,
        email: element.email?.S,
        phoneNumber: element.phoneNumber?.S,
        recordStatus: Number(element.recordStatus?.N),
        createdAt: element.createdAt?.S,
        employees: employees
    };
}

async function scan(payload = {
    expressionAttributeValues: {},
    projectionExpression: undefined,
    filterExpression: undefined,
    limit: undefined
}, options = { requestId: '' }) {
    try {
        const params = {
            ExpressionAttributeValues: payload.expressionAttributeValues,
            ProjectionExpression: payload.projectionExpression,
            FilterExpression: payload.filterExpression,
            TableName: tableName,
            Limit: payload.limit
        };

        logger.debug({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });

        const results = [];
        const resultData = await client.send(new ScanCommand(params));

        logger.info({
            requestId: options.requestId,
            message: resultData.Items?.length
        });

        if (resultData.Items && resultData.Items.length > 0) {
            resultData.Items.forEach(element => {
                const item = buildItem(element);
                results.push(item);
            });
        }

        return results;
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}


async function putItem(payload = {
    id: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    recordStatus: 1,
    createdAt: '',
    employees: []
}, options = { requestId: '' }) {
    try {
        const params = {
            TableName: tableName,
            Item: {
                id: {
                    S: `${payload.id}`
                },
                username: {
                    S: `${payload.username}`
                },
                password: {
                    S: `${payload.password}`
                },
                firstName: {
                    S: `${payload.firstName}`
                },
                lastName: {
                    S: `${payload.lastName}`
                },
                email: {
                    S: `${payload.email}`
                },

                phoneNumber: {
                    S: `${payload.phoneNumber}`
                },

                recordStatus: {
                    N: `${payload.recordStatus}`
                },
                createdAt: {
                    S: payload.createdAt
                },
                employees: {
                    L: payload.employees
                },
            },
        };

        logger.info({
            requestId: options.requestId,
            message: params
        });

        const resultData = await client.send(new PutItemCommand(params));

        logger.info({
            requestId: options.requestId,
            message: resultData
        });

        return buildItem(params.Item);
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}


module.exports = {
    scan: scan,
    putItem: putItem
}