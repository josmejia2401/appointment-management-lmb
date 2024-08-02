const {
    DynamoDBClient,
    GetItemCommand,
    BatchGetItemCommand
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
        invitations: invitations,
        documentType: Number(element.documentType?.N),
        documentNumber: element.documentNumber?.S,
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


async function batchGetItem(payload = {
    keys: [],
    projectionExpression: ''
}, options = { requestId: '' }) {
    try {
        const params = {};
        params[`${tableName}`] = {
            Keys: payload.keys,
            ProjectionExpression: payload.projectionExpression,
        };

        logger.info({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });

        const resultData = await client.send(new BatchGetItemCommand({ RequestItems: params }));

        logger.info({
            requestId: options.requestId,
            message: resultData.Responses !== undefined
        });

        const results = [];

        if (resultData.Responses) {
            resultData.Responses[`${tableName}`].forEach(element => {
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

module.exports = {
    getItem: getItem,
    batchGetItem: batchGetItem
}