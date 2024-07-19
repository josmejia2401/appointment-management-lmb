export default Object.freeze({
    ENVIRONMENT: `${process.env.ENVIRONMENT}`,
    LOGGER_LEVEL: `${process.env.LOGGER_LEVEL}`,
    REGION: `${process.env.REGION}`,
    APP_NAME: `${process.env.APP_NAME}`,
    JWT: {
        SECRET_VALUE: `${process.env.JTW_SECRET_VALUE}`,
        TOKEN_LIFE: `${process.env.JWT_TOKEN_LIFE}`,
    },
    AWS: {
        DYNAMO_DB: {}
    }
});