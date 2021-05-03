const redis = require('then-redis');
const config = require('config');

const redisConfig = config.get('Redis');
const redisClient = redis.createClient({
    host: redisConfig.get('host'),
    port: redisConfig.get('port'),
    password: process.env.REDIS_PW
});

redisClient.on('connect', () => console.log("Redis client created: " + redisClient.host + ":" + redisConfig.port));
redisClient.on('close', (error) => console.error("Redis closing: " + error));
redisClient.on('end', (error) => console.error("Redis closed: " + error));
redisClient.on('error', (error) => console.error("Redis error: " + error));

module.exports.redisClient = redisClient;