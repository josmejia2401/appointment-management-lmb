
const mainData = require('../data/main.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById, findDocumentTypeById, findGenderById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { getTraceID } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');
const { JWT } = require('../lib/jwt');

exports.doAction = async function (event, _context) {
    const traceID = getTraceID(event.headers || {});
    try {
        logger.info({ message: JSON.stringify(event), requestId: traceID });
        //queryStringParameters
        if (event.pathParameters !== undefined && event.pathParameters !== null) {
            const pathParameters = event.pathParameters;
            const body = JSON.parse(event.body);

            const authorization = event.headers?.Authorization || event.headers?.authorization;
            const tokenDecoded = JWT.decodeToken(authorization);

            const options = {
                requestId: traceID
            };
            const payload = {
                firstName: body.firstName || "",
                lastName: body.lastName || "",

                email: body.email || "",
                phoneNumber: body.phoneNumber || "",

                documentType: findDocumentTypeById(body.documentType)?.id,
                documentNumber: body.documentNumber || "",

                birthday: body.birthday || "",
                gender: findGenderById(body.gender)?.id,


                recordStatus: findStatusById(1)?.id,
            };

            const errorBadRequest = validatePayload(payload);
            if (errorBadRequest) {
                return errorBadRequest;
            }
            await mainData.updateItem({
                key: {
                    id: {
                        S: `${pathParameters.id}`
                    },
                    userId: {
                        S: `${tokenDecoded?.keyid}`
                    }
                },
                expressionAttributeNames: {
                    "#firstName": "firstName",
                    "#lastName": "lastName",
                    "#email": "email",
                    "#phoneNumber": "phoneNumber",

                    "#documentType": "documentType",
                    "#documentNumber": "documentNumber",
                    "#birthday": "birthday",
                    "#gender": "gender",
                    "#recordStatus": "recordStatus",
                },
                expressionAttributeValues: {
                    ":firstName": {
                        "S": payload.firstName
                    },
                    ":lastName": {
                        "S": payload.lastName
                    },
                    ":email": {
                        "S": `${payload.email}`
                    },
                    ":phoneNumber": {
                        "S": `${payload.phoneNumber}`
                    },

                    ":documentType": {
                        "N": `${payload.documentType}`
                    },
                    ":documentNumber": {
                        "S": `${payload.documentNumber}`
                    },
                    ":birthday": {
                        "S": `${payload.birthday}`
                    },
                    ":gender": {
                        "N": `${payload.gender}`
                    },

                    ":recordStatus": {
                        "N": `${payload.recordStatus}`
                    },
                },
                updateExpression: "SET #firstName=:firstName, #lastName=:lastName, #email=:email, #phoneNumber=:phoneNumber, #documentType=:documentType, #documentNumber=:documentNumber, #birthday=:birthday, #gender=:gender, #recordStatus=:recordStatus",
                conditionExpression: undefined,
                filterExpression: "attribute_exists(userId)"
            }, options);
            return successResponse(body);
        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}