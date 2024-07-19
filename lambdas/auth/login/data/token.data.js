import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    ScanCommand,
    QueryCommand,
    PutCommand,
    GetCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import constants from '../lib/constants';
import * as logger from '../lib/logger';

const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.REGION });
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = `apma_token_${constants.ENVIRONMENT}`;


function buildItem(element) {
    if (element === undefined || element === null) {
        return undefined;
    }
    return {
        id: element.id.S,
        userId: element.userId.S,
        token: element.token.S,
        createdAt: element.createdAt.S,
    };
}


/**
 * 
 * @param {*} payload 
 */
export async function query(payload = {
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
        const resultData = await dynamo.send(new QueryCommand(params));

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
    }
}


export async function scan(payload = {
    expressionAttributeValues: {},
    projectionExpression: undefined,
    filterExpression: undefined,
}, options = { requestId: '' }) {
    try {
        const params = {
            ExpressionAttributeValues: payload.expressionAttributeValues,
            ProjectionExpression: payload.projectionExpression,
            FilterExpression: payload.filterExpression,
            TableName: tableName,
        };

        logger.debug({
            requestId: options.requestId,
            message: params
        });

        const results = [];
        const resultData = await dynamo.send(new ScanCommand(params));

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
    }
}


export async function putItem(payload = {
    id: '',
    userId: '',
    token: '',
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
                token: {
                    S: payload.token
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

        const resultData = await dynamo.send(new PutCommand(params));

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
    }
}



export async function getItem(payload = {
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

        const resultData = await dynamo.send(new GetCommand(params));

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
    }
}



export async function deleteItem(payload = {
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

        const resultData = await dynamo.send(new DeleteCommand(params));

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
    }
}
