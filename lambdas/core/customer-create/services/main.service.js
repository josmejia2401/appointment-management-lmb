
const customersData = require('../data/customers.data');
const { buildInternalError, buildBadRequestError } = require('../lib/global-exception-handler');
const { findStatusById, findDocumentTypeById, findGenderById, findMaritalStatusById } = require('../lib/list_values');
const { successResponse } = require('../lib/response-handler');
const { buildUuid, getTraceID } = require('../lib/util');
const logger = require('../lib/logger');
const { validatePayload } = require('../lib/schema');
const { JWT } = require('../lib/jwt');

exports.doAction = async function (event, _context) {
    const traceID = getTraceID(event.headers || {});
    try {
        if (event.body !== undefined && event.body !== null) {
            const body = JSON.parse(event.body);
            const headers = event.headers;

            const authorization = headers?.Authorization || headers?.authorization || event.authorizationToken;
            const tokenDecoded = JWT.decodeToken(authorization);
            logger.info({
                requestId: traceID,
                message: JSON.stringify(tokenDecoded)
            });

            const options = {
                requestId: traceID
            };
            const id = buildUuid();

            logger.info({
                requestId: traceID,
                message: { id: id }
            });

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

            await customersData.putItem(payload, options);
            return successResponse(payload);
        } else {
            return buildBadRequestError('Al parecer la solicitud no es correcta. Intenta nuevamente, por favor.');
        }
    } catch (err) {
        logger.error({ message: err, requestId: traceID });
        return buildInternalError("No pudimos realizar la solicitud. Intenta más tarde, por favor.")
    }
}