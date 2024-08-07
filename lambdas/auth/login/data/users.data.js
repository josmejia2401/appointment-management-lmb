const {
    DynamoDBClient,
    ScanCommand,
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
            const temp = {
                id: local.id?.S,
                userFrom: local.userFrom?.S,
                userTo: local.userTo?.S,
                recordStatus: Number(local.recordStatus?.N),
                createdAt: local.createdAt?.S,
            };
            invitations.push(temp);
        });
    }

    if (element.employees && element.employees.L) {
        element.employees.L.forEach(local => {
            const temp = {
                userId: local.userId?.S,
                recordStatus: Number(local.recordStatus?.N),
                createdAt: local.createdAt?.S,
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
        documentType: Number(element.documentType?.N),
        documentNumber: element.documentNumber?.S,
        recordStatus: Number(element.recordStatus?.N),
        createdAt: element.createdAt?.S,
        employees: employees,
        invitations: invitations,
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
            } while (typeof items.LastEvaluatedKey !== "undefined" && resultData.results.length < payload.limit);
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

module.exports = {
    scan: scan,
}