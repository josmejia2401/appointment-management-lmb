const {
    DynamoDBClient,
    ScanCommand,
    PutItemCommand,
} = require("@aws-sdk/client-dynamodb");


const constants = require('../lib/constants');
const logger = require('../lib/logger');

const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });
const tableName = `tbl-${constants.constants.APP_NAME}-customers-${constants.constants.ENVIRONMENT}`;


function buildItem(element) {
    if (element === undefined || element === null) {
        return undefined;
    }

    return {
        id: element.id?.S,
        userId: element.userId?.S,
        firstName: element.firstName?.S,
        lastName: element.lastName?.S,
        email: element.email?.S,
        phoneNumber: element.phoneNumber?.S,
        documentType: Number(element.documentType?.N),
        documentNumber: element.documentNumber?.S,
        birthday: element.birthday?.S,
        firstName: element.firstName?.S,
        gender: Number(element.gender?.N),
        recordStatus: Number(element.recordStatus?.N),

        maritalStatus: Number(element.maritalStatus?.N),
        occupation: element.occupation?.S,
        address: element.address?.S,
        notes: element.notes?.S,

        createdAt: element.createdAt?.S,
    };
}


async function putItem(payload = {
    id: '',
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    documentType: 0,
    documentNumber: '',
    birthday: '',
    gender: 0,

    maritalStatus: 0,
    occupation: '',
    address: '',
    notes: '',

    recordStatus: 1,
    createdAt: '',
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
                documentType: {
                    N: `${payload.documentType}`
                },
                documentNumber: {
                    S: `${payload.documentNumber}`
                },
                birthday: {
                    S: `${payload.birthday}`
                },
                gender: {
                    N: `${payload.gender}`
                },

                recordStatus: {
                    N: `${payload.recordStatus}`
                },

                maritalStatus: {
                    N: `${payload.recordStatus}`
                },
                occupation: {
                    S: payload.occupation
                },
                address: {
                    S: payload.address
                },
                notes: {
                    S: payload.notes
                },


                createdAt: {
                    S: payload.createdAt
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
    putItem: putItem
}