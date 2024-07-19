import { sign, decode, verify } from "jsonwebtoken";
import constants from './constants';
import { buildUuid } from "./util";

export class JWT {

    static getOnlyToken(token) {
        return token.replace("Bearer ", "").replace("bearer ", "");
    }

    static refreshToken(token) {
        const newToken = JWT.getOnlyToken(token);
        const decodedPayload = verify(newToken, constants.JWT.SECRET_VALUE, {
            audience: constants.APP_NAME,
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
            expiresIn: constants.JWT.TOKEN_LIFE,
            algorithm: 'HS256',
            audience: constants.APP_NAME,
            jwtid: buildUuid(),
            subject: value.username,
            keyid: "",
        };
        const accessToken = sign(value, constants.JWT.SECRET_VALUE, options);
        return accessToken;
    }

    static validateToken(token) {
        const newToken = JWT.getOnlyToken(token);
        verify(newToken, constants.JWT.SECRET_VALUE, {
            audience: constants.APP_NAME,
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