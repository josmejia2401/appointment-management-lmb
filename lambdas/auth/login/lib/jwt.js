const { sign, decode, verify } = require("jsonwebtoken");
const constants = require('./constants');
const { buildUuid } = require("./util");

exports.JWT = class {

    static getOnlyToken(token) {
        return token.replace("Bearer ", "").replace("bearer ", "");
    }

    static refreshToken(token) {
        const newToken = JWT.getOnlyToken(token);
        const decodedPayload = verify(newToken, constants.constants.JWT.SECRET_VALUE, {
            audience: constants.constants.APP_NAME,
            algorithms: ['HS256'],
        });
        const value = {
            username: decodedPayload.username,
            password: decodedPayload.password,
        };
        return this.sign(value);
    }


    static sign(value) {
        const options = {
            expiresIn: constants.constants.JWT.TOKEN_LIFE,
            algorithm: 'HS256',
            audience: constants.constants.APP_NAME,
            jwtid: buildUuid(),
            subject: value.username,
            jwtid: value.tokenId,
            issuer: value.name,
            keyid: value.id
        };
        const accessToken = sign(value, constants.constants.JWT.SECRET_VALUE, options);
        return accessToken;
    }

    static validateToken(token) {
        const newToken = JWT.getOnlyToken(token);
        verify(newToken, constants.constants.JWT.SECRET_VALUE, {
            audience: constants.constants.APP_NAME,
            algorithms: ['HS256'],
        });
    }

    static decodeToken(token) {
        const newToken = JWT.getOnlyToken(token);
        const dec = decode(newToken, {
            json: true
        });
        delete dec.username;
        delete dec.password;
        return dec;
    }

    static isValidToken(token) {
        try {
            const newToken = JWT.getOnlyToken(token);
            JWT.validateToken(newToken);
            return true;
        } catch (_) {
            return false;
        }
    }
}