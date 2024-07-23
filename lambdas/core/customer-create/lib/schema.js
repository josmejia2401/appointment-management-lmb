const Joi = require('joi');
const { buildBadRequestError } = require('./global-exception-handler');

const schema = Joi.object({
    id: Joi.string()
        .required(),

    userId: Joi.string()
        .required(),

    firstName: Joi.string()
        .max(100)
        .required(),

    lastName: Joi.string()
        .max(100)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    phoneNumber: Joi.string()
        .max(15)
        .required(),

    documentType: Joi.number()
        .required(),

    documentNumber: Joi.number()
        .required(),

    birthday: Joi.date()
        .required(),

    gender: Joi.number()
        .required(),

    recordStatus: Joi.number()
        .required(),

    createdAt: Joi.date()
        .required()

});

exports.validatePayload = function (payload) {
    const result = schema.validate(payload, {
        allowUnknown: true
    });
    if (result.error) {
        let errors = result.error.details.map(p => ({
            message: p.message.replace('\"', "").replace('\"', ""),
            type: p.type
        }));
        return buildBadRequestError(
            message = '¡Ups! Error en la solicitud.',
            stackTrace = [],
            errors = errors
        );
    }
    return null;
}