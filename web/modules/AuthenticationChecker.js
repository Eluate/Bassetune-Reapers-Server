var redisClient = require("../../global/redisHandler").redisClient;

var checkAuth = function (req, res, next) {
    console.log("Checking Authentication --> Session id: " + req.body.uuid);
    if (req.body.uuid == undefined) {
        res.send("unauthorized");
        return;
    }
    redisClient.exists(req.body.uuid).then(function (exists) {
        if (exists) {
            redisClient.expire(req.body.session, 3600);
            next();
        } else {
            res.send("unauthorized");
        }
    });
};

module.exports = checkAuth;