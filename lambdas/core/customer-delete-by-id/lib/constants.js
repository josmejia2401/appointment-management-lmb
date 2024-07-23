exports.constants = Object.freeze({
    ENVIRONMENT: `${process.env.ENVIRONMENT || 'dev'}`,
    LOGGER_LEVEL: `${process.env.LOGGER_LEVEL || "INFO"}`,
    REGION: `${process.env.REGION || 'us-east-1'}`,
    APP_NAME: `${process.env.APP_NAME || 'appma'}`,
    SERVICE_UNAVAILABLE: `${process.env.SERVICE_UNAVAILABLE || '0'}`,
});