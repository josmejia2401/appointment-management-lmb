class JWT {

    static decodeToken(token) {
        token = JWT.getOnlyToken(token);
        const base64Payload = token.split('.')[1];
        const payload = Buffer.from(base64Payload, 'base64');
        return JSON.parse(payload.toString());
    }

    static parseJwt(token) {
        token = JWT.getOnlyToken(token);
        return JSON.parse(atob(token.split('.')[1]));
    };

    static getOnlyToken(token) {
        return String(token).replace("Bearer ", "").replace("bearer ", "");
    }
}

exports.JWT = JWT; 