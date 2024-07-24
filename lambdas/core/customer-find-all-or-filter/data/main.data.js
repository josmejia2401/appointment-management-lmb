const {
    DynamoDBClient,
    ScanCommand,
} = require("@aws-sdk/client-dynamodb");


const constants = require('../lib/constants');
const logger = require('../lib/logger');

const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });
const tableName = `tbl-${constants.constants.APP_NAME}-customers-${constants.constants.ENVIRONMENT}`;

function buildItem(element) {
    if (element === undefined || element === null) {
        return undefined;
    }

    return {
        id: element.id?.S,
        userId: element.userId?.S,
        firstName: element.firstName?.S,
        lastName: element.lastName?.S,
        email: element.email?.S,
        phoneNumber: element.phoneNumber?.S,
        documentType: Number(element.documentType?.N),
        documentNumber: element.documentNumber?.S,
        birthday: element.birthday?.S,
        firstName: element.firstName?.S,
        gender: Number(element.gender?.N),
        recordStatus: Number(element.recordStatus?.N),
        createdAt: element.createdAt?.S,
    };
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
                userId: resultData.LastEvaluatedKey.userId.S,
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
    scan: scan,
}