const uuid = require("uuid");

exports.buildUuid = function () {
    return uuid.v4();
}