const Joi = require('joi');
const { buildBadRequestError } = require('./global-exception-handler');

const schema = Joi.object({

    firstName: Joi.string()
        .max(100)
        .required(),

    lastName: Joi.string()
        .max(100)
        .required(),


    email: Joi.string()
        .email().allow('').optional(),

    phoneNumber: Joi.string()
        .max(15)
        .allow('').optional(),

    documentType: Joi.number().allow('').optional(),

    documentNumber: Joi.number().allow('').optional(),

    birthday: Joi.date().allow('').optional(),


    gender: Joi.number()
        .required(),

    recordStatus: Joi.number()
        .required(),

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