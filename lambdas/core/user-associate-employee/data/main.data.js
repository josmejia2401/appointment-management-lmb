const {
    DynamoDBClient,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand
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
    const invitations = [];

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

    if (element.invitations && element.invitations.L && element.invitations.L.length > 0) {
        element.invitations.L.forEach(local => {
            const temp = local.M;
            const invitation = {
                userId: temp.userId.S,
                recordStatus: Number(temp.recordStatus.N),
                createdAt: temp.createdAt.S,
            };
            invitations.push(invitation);
        });
    }

    return {
        id: element.id?.S,
        username: element.username?.S,
        firstName: element.firstName?.S,
        lastName: element.lastName?.S,
        email: element.email?.S,
        phoneNumber: element.phoneNumber?.S,
        documentType: Number(element.documentType?.N || 0),
        documentNumber: element.documentNumber?.S,
        recordStatus: Number(element.recordStatus?.N),
        createdAt: element.createdAt?.S,
        employees: employees,
        invitations: invitations
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



async function scan(payload = {
    expressionAttributeValues: {},
    expressionAttributeNames: {},
    projectionExpression: undefined,
    filterExpression: undefined,
    limit: undefined,
    lastEvaluatedKey: undefined
}, options = { requestId: '' }) {
    try {

        const params = {
            ExpressionAttributeValues: payload.expressionAttributeValues,
            ExpressionAttributeNames: payload.expressionAttributeNames,
            ProjectionExpression: payload.projectionExpression,
            FilterExpression: payload.filterExpression,
            TableName: tableName,
            Limit: payload.limit,
            ExclusiveStartKey: payload.lastEvaluatedKey,
        };

        logger.info({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });

        const results = [];
        const outputData = {
            results: [],
            lastEvaluatedKey: undefined
        };
        const resultData = await client.send(new ScanCommand(params));

        logger.info({
            requestId: options.requestId,
            message: resultData.Items?.length
        });

        if (resultData.LastEvaluatedKey) {
            outputData.lastEvaluatedKey = {
                id: resultData.LastEvaluatedKey.id.S,
            };
        }

        if (resultData.Items && resultData.Items.length > 0) {
            resultData.Items.forEach(element => {
                const item = buildItem(element);
                results.push(item);
            });
        }

        outputData.results = results;

        return outputData;
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
    getItem: getItem,
    scan: scan
}