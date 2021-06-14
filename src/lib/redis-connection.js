const Redis = require("ioredis");

const { REDIS_URL } = process.env;

const redisConnection = new Redis(REDIS_URL);

module.exports = redisConnection;
