const {
    DynamoDBClient,
    ScanCommand,
    QueryCommand,
    PutItemCommand,
    GetItemCommand,
    DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");


const constants = require('../lib/constants');
const logger = require('../lib/logger');

const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });
const tableName = `tbl-${constants.constants.APP_NAME}-services-${constants.constants.ENVIRONMENT}`;


function buildItem(element) {
    if (element === undefined || element === null) {
        return undefined;
    }
    return {
        id: element.id?.S,
        userId: element.userId?.S,
        name: element.name?.S,
        description: element.description?.S,
        duration: Number(element.duration?.N),
        recordStatus: Number(element.recordStatus?.N),
        createdAt: element.createdAt?.S,
    };
}


/**
 * 
 * @param {*} payload 
 */
async function query(payload = {
    expressionAttributeValues: {},
    keyConditionExpression: '',
    projectionExpression: undefined,
    filterExpression: undefined,
}, options = { requestId: '' }) {
    try {
        const params = {
            ExpressionAttributeValues: payload.expressionAttributeValues,
            KeyConditionExpression: payload.keyConditionExpression,
            ProjectionExpression: payload.projectionExpression,
            FilterExpression: payload.filterExpression,
            TableName: tableName,
        };

        logger.debug({
            requestId: options.requestId,
            message: params
        });

        const results = [];
        const resultData = await client.send(new QueryCommand(params));

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
    userId: '',
    name: '',
    description: '',
    duration: 0,
    recordStatus: '',
    createdAt: ''
}, options = { requestId: '' }) {
    try {
        const params = {
            TableName: tableName,
            Item: {
                id: {
                    S: `${payload.id}`
                },
                userId: {
                    S: `${payload.userId}`
                },
                name: {
                    S: `${payload.name}`
                },
                description: {
                    S: `${payload.description}`
                },
                duration: {
                    N: `${payload.duration}`
                },
                recordStatus: {
                    N: `${payload.recordStatus}`
                },
                createdAt: {
                    S: payload.createdAt
                },
            },
        };

        logger.debug({
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



async function getItem(payload = {
    key: {
        id: {
            S: ''
        }
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



async function deleteItem(payload = {
    key: {
        id: {
            S: ''
        }
    },
}, options = { requestId: '' }) {
    try {
        const params = {
            TableName: tableName,
            Key: payload.key,
        };

        logger.debug({
            requestId: options.requestId,
            message: params
        });

        const resultData = await client.send(new DeleteItemCommand(params));

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

module.exports = {
    query: query,
    scan: scan,
    getItem: getItem,
    deleteItem: deleteItem,
    putItem: putItem
}