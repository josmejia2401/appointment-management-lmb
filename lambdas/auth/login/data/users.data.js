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
const tableName = `apma_users_${constants.ENVIRONMENT}`;


function buildItem(element) {
    if (element === undefined || element === null) {
        return undefined;
    }
    const invitations = [];
    const customers = [];
    const employees = [];
    if (element.invitations.L) {
        element.invitations.L.forEach(local => {
            const history = [];
            if (local.history.L) {
                local.history.L.forEach(h => {
                    const subTmp = {
                        id: h.id.S,
                        description: h.description.S,
                        createdAt: h.createdAt.S,
                    };
                    history.push(subTmp);
                });
            }
            const temp = {
                id: local.id.S,
                userFrom: local.userFrom.S,
                userTo: local.userTo.S,
                createdAt: local.createdAt.S,
                note: local.note.S,
                status: local.status.N,
                history: history,
            };
            invitations.push(temp);
        });
    }
    if (element.customers.L) {
        element.customers.L.forEach(local => {
            const notes = [];
            if (local.notes.L) {
                local.notes.L.forEach(h => {
                    const subTmp = {
                        id: h.id.S,
                        description: h.description.S,
                        createdAt: h.createdAt.S,
                        userId: h.userId.S,
                    };
                    notes.push(subTmp);
                });
            }
            const temp = {
                id: local.id.S,
                firstName: local.firstName.S,
                lastName: local.lastName.S,
                email: local.email.S,
                phoneNumber: local.phoneNumber.S,
                documentType: local.documentType.N,
                documentNumber: local.documentNumber.S,
                birthday: local.birthday.S,
                gender: local.gender.N,
                status: local.status.N,
                createdAt: local.createdAt.S,
                notes: notes,
            };
            customers.push(temp);
        });
    }

    if (element.employees.L) {
        element.employees.L.forEach(local => {
            const temp = {
                id: local.id.S,
                status: local.status.N,
                createdAt: local.createdAt.S,
                note: local.note.S,
            };
            employees.push(temp);
        });
    }

    return {
        id: element.id.S,
        firstName: element.firstName.S,
        lastName: element.lastName.S,
        email: element.email.S,
        username: element.username.S,
        password: element.password.S,
        documentType: element.documentType.N,
        documentNumber: element.documentNumber.S,
        status: element.status.N,
        createdAt: element.createdAt.S,
        customers: customers,
        employees: employees,
        invitations: invitations,
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
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    documentType: '',
    documentNumber: '',
    status: '',
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
                status: {
                    N: payload.status
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
