const Joi = require('joi');
const { buildBadRequestError } = require('./global-exception-handler');

const schema = Joi.object({

    firstName: Joi.string()
        .max(75)
        .required(),

    lastName: Joi.string()
        .max(75)
        .required(),

    email: Joi.string()
        .email().required(),

    username: Joi.string()
        .min(3)
        .max(12)
        .required(),

    password: Joi.string()
        .required(),

    documentType: Joi.number()
        .required(),

    documentNumber: Joi.string()
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