const {
    DynamoDBClient,
    DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");


const constants = require('../lib/constants');
const logger = require('../lib/logger');

const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });
const tableName = `tbl-${constants.constants.APP_NAME}-customers-${constants.constants.ENVIRONMENT}`;

async function deleteItem(payload = {
    key: {
        id: {
            S: ''
        },
        userId: {
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
    deleteItem: deleteItem,
}