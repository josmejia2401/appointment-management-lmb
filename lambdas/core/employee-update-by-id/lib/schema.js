const Joi = require('joi');
const { buildBadRequestError } = require('./global-exception-handler');

const schema = Joi.object({

    firstName: Joi.string().max(100).required(),

    lastName: Joi.string().max(100).required(),

    email: Joi.string().email().allow('').optional(),

    phoneNumber: Joi.string().max(15).allow('').optional(),

    documentType: Joi.number().allow('').optional(),

    documentNumber: Joi.number().allow('').optional(),

    birthday: Joi.date().allow('').optional(),

    gender: Joi.number(),

    maritalStatus: Joi.number(),

    occupation: Joi.string().allow('').max(75).required(),

    address: Joi.string().allow('').max(100).required(),

    notes: Joi.string().allow('').max(150).required(),


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