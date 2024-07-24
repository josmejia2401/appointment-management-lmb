const {
    DynamoDBClient,
    PutItemCommand,
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



module.exports = {
    putItem: putItem
}