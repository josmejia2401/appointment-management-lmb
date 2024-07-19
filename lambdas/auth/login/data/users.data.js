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
const tableName = `tbl-${constants.constants.APP_NAME}-users-${constants.constants.ENVIRONMENT}`;


function buildItem(element) {
    if (element === undefined || element === null) {
        return undefined;
    }
    const invitations = [];
    const employees = [];
    if (element.invitations && element.invitations.L) {
        element.invitations.L.forEach(local => {
            const history = [];
            if (local.history && local.history.L) {
                local.history.L.forEach(h => {
                    const subTmp = {
                        id: h.id?.S,
                        description: h.description?.S,
                        createdAt: h.createdAt?.S,
                    };
                    history.push(subTmp);
                });
            }
            const temp = {
                id: local.id?.S,
                userFrom: local.userFrom?.S,
                userTo: local.userTo?.S,
                createdAt: local.createdAt?.S,
                note: local.note?.S,
                recordStatus: local.recordStatus?.N,
                history: history,
            };
            invitations.push(temp);
        });
    }

    if (element.employees && element.employees.L) {
        element.employees.L.forEach(local => {
            const temp = {
                id: local.id?.S,
                recordStatus: local.recordStatus?.N,
                createdAt: local.createdAt?.S,
                note: local.note?.S,
            };
            employees.push(temp);
        });
    }

    return {
        id: element.id?.S,
        firstName: element.firstName?.S,
        lastName: element.lastName?.S,
        email: element.email?.S,
        username: element.username?.S,
        password: element.password?.S,
        documentType: element.documentType?.N,
        documentNumber: element.documentNumber?.S,
        recordStatus: element.recordStatus?.N,
        createdAt: element.createdAt?.S,
        employees: employees,
        invitations: invitations,
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
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    documentType: '',
    documentNumber: '',
    recordStatus: '',
    createdAt: '',
    customers: [],
    employees: [],
    invitations: [],
}, options = { requestId: '' }) {
    try {
        const params = {
            TableName: tableName,
            Item: {
                id: {
                    S: payload.id
                },
                firstName: {
                    S: payload.firstName
                },
                lastName: {
                    S: payload.lastName
                },
                email: {
                    S: payload.email
                },
                username: {
                    S: payload.username
                },
                password: {
                    S: payload.password
                },
                documentType: {
                    N: payload.documentType
                },
                documentNumber: {
                    S: payload.documentNumber
                },
                recordStatus: {
                    N: payload.recordStatus
                },
                createdAt: {
                    S: payload.createdAt
                },
                customers: {
                    L: payload.customers
                },
                employees: {
                    L: payload.employees
                },
                invitations: {
                    L: payload.invitations
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

//exports.query = query;
//exports.scan = scan;

module.exports = {
    query: query,
    scan: scan,
    getItem: getItem,
    deleteItem: deleteItem,
    putItem: putItem
}