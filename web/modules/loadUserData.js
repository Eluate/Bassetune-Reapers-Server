var mysqlConnection = require('./MySQLHandler').connection;
var redisClient = require('./RedisHandler').redisClient;
var uuid = require('node-uuid');

var loadUserData = function (req, res)//no next() called here, returns successful login to client
{
    // Generate a unique session id using UUID v1 (time-based)
    var redisSessionKey = uuid.v1();
    if (req.userData.last_uuid == undefined) {
        updateLastUui(redisSessionKey, req.userData.account_id);
        updateSession(req, redisSessionKey, res);
    } else {
        redisClient.exists(req.userData.last_uuid).then(function (exists) {
            // Exist returns 0 or 1 (false/true)
            if (!exists) {
                updateLastUui(redisSessionKey, req.userData.account_id);
                updateSession(req, redisSessionKey, res);
            } else {
                //session already existing
                redisSessionKey = req.userData.last_uuid;
                updateSession(req, redisSessionKey, res);
            }
        });
    }
};

function respond(res, userData) {
    var clientData = {
        "uuid": userData.last_uuid,
        "user": userData.username,
        "nick": userData.nickname
    };
    // Send the client the info stored of the client
    res.send(clientData);
}

function updateSession(req, redisSessionKey, res) {
    var playerData = {
        accountID: req.userData.account_id,
        nickname: req.userData.nickname,
        username: req.userData.username,
        gold: req.userData.gold,
        lordLevel: req.userData.lord_level,
        knightLevel: req.userData.knight_level,
        lordXP: req.userData.lord_xp,
        knightXP: req.userData.knight_xp,
        lordElo: req.userData.lord_elo,
        knightElo: req.userData.knight_elo,
        matchWins: req.userData.match_wins,
        matchLosses: req.userData.match_losses,
        unlockedDungeons: req.userData.unlocked_dungeons
    };

    // Update redis with session key if it exists
    redisClient.hget(redisSessionKey, "gameUuid").then(function (gameUuid) {
        // Set game uuid to old uuid if it exists otherwise use the newly generated one
        if (gameUuid != undefined) {
            req.userData.last_uuid = gameUuid;
        } else {
            req.userData.last_uuid = redisSessionKey;
        }
        playerData.uuid = req.userData.last_uuid;
        // Set or reset player data on redis
        redisClient.hmset(redisSessionKey, playerData);
        // Set or reset session expiration time
        redisClient.expire(redisSessionKey, 21600); // Session will last for 6 hours
        // Send uuid to client
        respond(res, req.userData);
    });
}

function updateLastUui(newUui, account_id) {
    mysqlConnection.query("UPDATE br_account SET last_uuid=? WHERE account_id=?", [newUui, account_id], function (err) {
        //if (!err) {
        //  console.log("Session was updated on the database.");
        //}
    });
}

module.exports = loadUserData;