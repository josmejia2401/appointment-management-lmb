const Joi = require('joi');
const { buildBadRequestError } = require('./global-exception-handler');

const schema = Joi.object({

    name: Joi.string().max(50).required(),

    description: Joi.string().max(150).allow('').optional(),

    duration: Joi.number(),

    pricing: Joi.number(),

    recordStatus: Joi.number().required(),

    createdAt: Joi.date().required()

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