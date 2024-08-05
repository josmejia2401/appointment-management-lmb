
const mainData = require('../data/main.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById, findDocumentTypeById, findGenderById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { getTraceID } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');
const { JWT } = require('../lib/jwt');
const { findMaritalStatusById } = require('../../customer-create/lib/list_values');

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
                id: id,
                userId: tokenDecoded?.keyid || "",

                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email || "",
                phoneNumber: body.phoneNumber || "",
                documentType: findDocumentTypeById(body.documentType)?.id || 0,
                documentNumber: body.documentNumber || "",
                birthday: body.birthday || "",
                gender: findGenderById(body.gender)?.id || 0,

                maritalStatus: findMaritalStatusById(body.maritalStatus)?.id || 0,
                occupation: body.occupation || "",
                address: body.address || "",
                notes: body.notes || "",

                recordStatus: findStatusById(1)?.id,
                createdAt: new Date().toISOString()
            };

            const errorBadRequest = validatePayload(payload);
            if (errorBadRequest) {
                return errorBadRequest;
            }
            const expressionAttributeNames = {};
            const expressionAttributeValues = {};
            let updateExpression = "SET ";

            if (payload.firstName !== undefined && payload.firstName !== null) {
                expressionAttributeNames["#firstName"] = "firstName";
                expressionAttributeValues[":firstName"] = { "S": payload.firstName };
                updateExpression = `${updateExpression} #firstName=:firstName`;
            }
            if (payload.lastName !== undefined && payload.lastName !== null) {
                expressionAttributeNames["#lastName"] = "lastName";
                expressionAttributeValues[":lastName"] = { "S": payload.lastName };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #lastName=:lastName`;
            }
            if (payload.email !== undefined && payload.email !== null) {
                expressionAttributeNames["#email"] = "email";
                expressionAttributeValues[":email"] = { "S": payload.email };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #email=:email`;
            }
            if (payload.phoneNumber !== undefined && payload.phoneNumber !== null) {
                expressionAttributeNames["#phoneNumber"] = "phoneNumber";
                expressionAttributeValues[":phoneNumber"] = { "S": payload.phoneNumber };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #phoneNumber=:phoneNumber`;
            }
            if (payload.documentType !== undefined && payload.documentType !== null) {
                expressionAttributeNames["#documentType"] = "documentType";
                expressionAttributeValues[":documentType"] = { "N": `${payload.documentType}` };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #documentType=:documentType`;
            }
            if (payload.documentNumber !== undefined && payload.documentNumber !== null) {
                expressionAttributeNames["#documentNumber"] = "documentNumber";
                expressionAttributeValues[":documentNumber"] = { "S": payload.documentNumber };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #documentNumber=:documentNumber`;
            }
            if (payload.birthday !== undefined && payload.birthday !== null) {
                expressionAttributeNames["#birthday"] = "birthday";
                expressionAttributeValues[":birthday"] = { "S": payload.birthday };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #birthday=:birthday`;
            }
            if (payload.gender !== undefined && payload.gender !== null) {
                expressionAttributeNames["#gender"] = "gender";
                expressionAttributeValues[":gender"] = { "N": `${payload.gender}` };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #gender=:gender`;
            }
            if (payload.maritalStatus !== undefined && payload.maritalStatus !== null) {
                expressionAttributeNames["#maritalStatus"] = "maritalStatus";
                expressionAttributeValues[":maritalStatus"] = { "N": `${payload.maritalStatus}` };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #maritalStatus=:maritalStatus`;
            }
            if (payload.occupation !== undefined && payload.occupation !== null) {
                expressionAttributeNames["#occupation"] = "occupation";
                expressionAttributeValues[":occupation"] = { "S": payload.occupation };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #occupation=:occupation`;
            }
            if (payload.address !== undefined && payload.address !== null) {
                expressionAttributeNames["#address"] = "address";
                expressionAttributeValues[":address"] = { "S": payload.address };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #address=:address`;
            }
            if (payload.notes !== undefined && payload.notes !== null) {
                expressionAttributeNames["#notes"] = "notes";
                expressionAttributeValues[":notes"] = { "S": payload.notes };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #notes=:notes`;
            }
            if (payload.recordStatus !== undefined && payload.recordStatus !== null) {
                expressionAttributeNames["#recordStatus"] = "recordStatus";
                expressionAttributeValues[":recordStatus"] = { "N": `${payload.recordStatus}` };
                updateExpression = `${updateExpression} ${updateExpression.length > 4 ? ', ' : ' '} #recordStatus=:recordStatus`;
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
                expressionAttributeNames: expressionAttributeNames,
                expressionAttributeValues: expressionAttributeValues,
                updateExpression: updateExpression,
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