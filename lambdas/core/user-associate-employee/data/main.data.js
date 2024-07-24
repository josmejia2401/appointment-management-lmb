const {
    DynamoDBClient,
    UpdateItemCommand,
    GetItemCommand
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

    if (element.employees && element.employees.L && element.employees.L.length > 0) {
        element.employees.L.forEach(local => {
            const temp = local.M;
            const employee = {
                userId: temp.userId.S,
                recordStatus: Number(temp.recordStatus.N),
                createdAt: temp.createdAt.S,
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
        documentType: Number(element.documentType?.N),
        documentNumber: element.documentNumber?.S,
        recordStatus: Number(element.recordStatus?.N),
        createdAt: element.createdAt?.S,
        employees: employees
    };
}

async function getItem(payload = {
    key: {
        id: {
            S: ''
        },
    },
    projectionExpression: ''
}, options = { requestId: '' }) {
    try {
        const params = {
            TableName: tableName,
            Key: payload.key,
            ProjectionExpression: payload.projectionExpression,
        };

        logger.debug({
            requestId: options.requestId,
            message: params
        });

        const resultData = await client.send(new GetItemCommand(params));

        logger.info({
            requestId: options.requestId,
            message: resultData.Item !== undefined
        });

        return buildItem(resultData.Item);
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}


async function updateItem(payload = {
    key: {
        id: {
            S: ''
        },
    },
    updateExpression: '',
    expressionAttributeNames: {},
    expressionAttributeValues: {},
    conditionExpression: '',
    filterExpression: ''
}, options = { requestId: '' }) {
    try {
        const params = {
            TableName: tableName,
            Key: payload.key,
            UpdateExpression: payload.updateExpression,
            ExpressionAttributeNames: payload.expressionAttributeNames,
            ExpressionAttributeValues: payload.expressionAttributeValues,
            ConditionExpression: payload.conditionExpression,
            FilterExpression: payload.filterExpression,
            ReturnValues: "ALL_NEW"
        };

        logger.info({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });

        const resultData = await client.send(new UpdateItemCommand(params));

        logger.info({
            requestId: options.requestId,
            message: resultData
        });

        return resultData;
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}


module.exports = {
    updateItem: updateItem,
    getItem: getItem
}