const redis = require('then-redis');
const config = require('config');

const redisUri = config.get('Redis.connectionUri');
const redisClient = redis.createClient(redisUri, function () {
    console.log("redisHandler connection success.");
});

// Client closed
redisClient.on('close', function (error) {
    console.log("RedisHandler error : " + error)
});

// Non-fatal error response when callback omitted
redisClient.on('call-error', function (error) {
    console.log("RedisHandler error : " + call - error)
});

// Fatal client error
redisClient.on('error', function (error) {
    console.log("RedisHandler error : " + error)
});

/*

 RedisClient options

 port
 Type: number
 Default: 6379
 host
 Type: string
 Default: 127.0.0.1
 path
 Type: string // unix domain socket
 db
 Type: number
 Default: 0
 maxCallbackDepth
 Type: number
 Default: 256

 */

module.exports.redisClient = redisClient;