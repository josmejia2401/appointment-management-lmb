const {
    DynamoDBClient,
    ScanCommand,
    PutItemCommand,
    GetItemCommand,
    DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");

const constants = require('../lib/constants');
const logger = require('../lib/logger');

const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });
const tableName = `tbl-${constants.constants.APP_NAME}-token-${constants.constants.ENVIRONMENT}`;


function buildItem(element) {
    if (element === undefined || element === null) {
        return undefined;
    }
    return {
        id: element.id.S,
        userId: element.userId.S,
        accessToken: element.accessToken.S,
        createdAt: element.createdAt.S,
    };
}


async function scan(payload = {
    expressionAttributeValues: {},
    projectionExpression: undefined,
    filterExpression: undefined,
    limit: 10
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

        const resultData = {
            results: [],
            lastEvaluatedKey: null
        };
        let items;
        if (payload.limit !== undefined && payload.limit !== null) {
            do {
                items = await client.send(new ScanCommand(params));
                if (items.Items && items.Items.length > 0) {
                    items.Items.forEach(item => resultData.results.push(buildItem(item)));
                }
                params.ExclusiveStartKey = items.LastEvaluatedKey;
            } while (typeof items.LastEvaluatedKey !== "undefined" || resultData.results.length >= payload.limit);
        } else {
            items = await client.send(new ScanCommand(params));
            if (items.Items && items.Items.length > 0) {
                items.Items.forEach(item => resultData.results.push(buildItem(item)));
            }
        }

        if (payload.limit !== undefined && payload.limit !== null && resultData.results.length > payload.limit) {
            /**
             * Si es mayor, siempre hay minimo un elemento por leer.
             */
            resultData.results = resultData.results.slice(0, payload.limit);
            const lastPos = resultData.results.length - 1;
            resultData.lastEvaluatedKey = {
                id: resultData.results[lastPos].id
            };
        } else {
            /**
             * Si es menor o igual y hay elementos en ExclusiveStartKey, se establecen.
             */
            if (params.ExclusiveStartKey !== undefined && params.ExclusiveStartKey !== null && Object.keys(params.ExclusiveStartKey).length > 0) {
                resultData.lastEvaluatedKey = {};
                Object.keys(params.ExclusiveStartKey).forEach(key => {
                    resultData.lastEvaluatedKey[key] = params.ExclusiveStartKey[key].S;
                });
            }
        }

        logger.info({
            requestId: options.requestId,
            message: {
                size: resultData.results.length,
                lastEvaluatedKey: resultData.lastEvaluatedKey,
            },
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


async function putItem(payload = {
    id: '',
    userId: '',
    accessToken: '',
    createdAt: '',
}, options = { requestId: '' }) {
    try {
        const params = {
            TableName: tableName,
            Item: {
                id: {
                    S: payload.id
                },
                userId: {
                    S: payload.userId
                },
                accessToken: {
                    S: payload.accessToken
                },
                createdAt: {
                    S: payload.createdAt
                },
            },
        };

        logger.debug({
            requestId: options.requestId,
            message: JSON.stringify(params)
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
    scan: scan,
    deleteItem: deleteItem,
    putItem: putItem
}