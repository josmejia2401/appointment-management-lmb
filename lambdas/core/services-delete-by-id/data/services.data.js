const {
    DynamoDBClient,
    UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");


const constants = require('../lib/constants');
const logger = require('../lib/logger');

const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });
const tableName = `tbl-${constants.constants.APP_NAME}-services-${constants.constants.ENVIRONMENT}`;


async function updateItem(payload = {
    key: {
        id: {
            S: ''
        },
        userId: {
            S: ''
        }
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
}