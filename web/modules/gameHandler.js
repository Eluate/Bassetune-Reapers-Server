var redisClient = require('./RedisHandler').redisClient;
var mysqlConnection = require('./MySQLHandler').connection;
/*
 game : will be stored on redis. this object format is mostly for use in backendGame
 {
 game_uuid: someuuid ,
 players: [{ pUuid : somePUuid , inventory : {}  }],
 state: somestring, (possible states: lookingForPlayers, waitingForPlayers, SyncronizingPlayers, preGame , loadingGame , inProgress),
 type : somestring,
 region : somestring,
 winners : [puuids] , (may be empty)
 startTime : time , (may be empty)
 endTime : time , (may be empty)
 //may be empty stuff is for persistance only
 }
 */

//public functions

var joinGame = function (argument) {
    // body...
};

var quitGame = function (argument) {
    // body...
};


//private functions

var newGame = function (argument) {
    // body...
};

var destroyGame = function (argument) {
    // body...
};

var setGameState = function (argument) {
    // body...
};

var getGameState = function (argument) {
    // body...
};

var getOpenGames = function (argument) {
    // body...
};

var getClosedGames = function (argument) {
    // body...
};

var addPlayerToGame = function (argument) {
    // body...
};

var removePlayerFromGame = function (argument) {
    // body...
};

var getGameNumberPlayers = function (argument) {
    // body...
};

var getGamePlayers = function (argument) {
    // body...
};

var setGameRegion = function (argument) {
    // body...
};

var getGameRegion = function (argument) {
    // body...
};


var getGameType = function (argument) {
    // body...
};

var setGameType = function (argument) {
    // body...
};

var setGameStartTime = function (argument) {
    // body...
};

var setGameEndTime = function (argument) {
    // body...
};

var getGameStartTime = function (argument) {
    // body...
};

var getGameEndTime = function (argument) {
    // body...
};

var setGameWinners = function (argument) {
    // body...
};

var getGameWinners = function (argument) {
    // body...
};