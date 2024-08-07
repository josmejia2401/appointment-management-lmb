const {
    DynamoDBClient,
    ScanCommand,
    PutItemCommand,
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
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    recordStatus: 1,
    createdAt: '',

    documentType: 0,
    documentNumber: '',

    employees: [],
    invitations: []
}, options = { requestId: '' }) {
    try {
        const params = {
            TableName: tableName,
            Item: {
                id: {
                    S: `${payload.id}`
                },
                username: {
                    S: `${payload.username}`
                },
                password: {
                    S: `${payload.password}`
                },
                firstName: {
                    S: `${payload.firstName}`
                },
                lastName: {
                    S: `${payload.lastName}`
                },
                email: {
                    S: `${payload.email}`
                },

                phoneNumber: {
                    S: `${payload.phoneNumber}`
                },

                recordStatus: {
                    N: `${payload.recordStatus}`
                },
                createdAt: {
                    S: payload.createdAt
                },

                documentType: {
                    N: `${payload.documentType}`
                },
                documentNumber: {
                    S: payload.documentNumber
                },

                employees: {
                    L: payload.employees
                },
                invitations: {
                    L: payload.invitations
                },
            },
        };

        logger.info({
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
    scan: scan,
    putItem: putItem
}