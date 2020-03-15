var redis = require('then-redis');

//this instance is to set and get data
var redisClient = redis.createClient("tcp://127.0.0.1:6379", function () {
    //'tcp://rediscluster.htotck.0001.use1.cache.amazonaws.com:6379' TODO: Redis server IP as environment variable
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

module.exports.redisClient = redisClient;


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
