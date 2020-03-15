var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redisClient = require('./modules/redisHandler').redisClient;
var eventEnum = require('./modules/eventEnum');
var request = require('request');

// Tracking variables
var gameServers = [];
var playersSearching = {};
var pendingMatches = {};

// Config variables
var validMatchTypes = ["normal", "ranked"];
var validMatches = ["3v1", "1v1"];
var validRegions = ["us-east-1", "us-west-1"];
// TODO: Initialize servers in the regions
var maxGamesPerServer = 20;

io.on('connection', function (socket) {
    console.log("Client connected: " + socket.id);

    socket.on(eventEnum.input.FIND, function (data) {
        var userData = {};
        userData.matchType = data.matchType;
        userData.matchPlayers = data.matchPlayers;
        userData.side = data.side;
        userData.uuid = data.uuid;
        userData.partyID = data.partyID;
        userData.region = data.region;
        userData.socket = socket;
        // Check if data is valid
        if (!isDataValid(userData.matchType, userData.matchPlayers, userData.uuid, userData.side, userData.region)) {
            return;
        }
        // Get accountID
        redisClient.hget(userData.uuid, "accountID").then(function (user) {
            if (!user) {
                return;
            }
            userData.accountID = user;
            // Get level data/elo data
            if (userData.matchType === "normal") {
                if (userData.side === "knight") {
                    redisClient.hget(userData.uuid, "knightLevel").then(function (levelData) {
                        userData.level = parseInt(levelData);
                        if (!findNormalMatch(userData)) {
                            // Push user data if a match isn't found
                            playersSearching[socket.id] = userData;
                            socket.emit(eventEnum.output.SEARCHING);
                        }
                    });
                } else {
                    redisClient.hget(userData.uuid, "lordLevel").then(function (levelData) {
                        userData.level = parseInt(levelData);
                        if (!findNormalMatch(userData)) {
                            // Push user data if a match isn't found
                            playersSearching[socket.id] = userData;
                            socket.emit(eventEnum.output.SEARCHING);
                        }
                    });
                }
            } else if (userData.matchType === "ranked") {
                if (userData.side === "knight") {
                    redisClient.hget(userData.uuid, "knightElo").then(function (levelData) {
                        userData.level = parseInt(levelData);
                        if (!findRankedMatch(userData)) {
                            // Push user data if a match isn't found
                            playersSearching[socket.id] = userData;
                            socket.emit(eventEnum.output.SEARCHING);
                        }
                    });
                } else {
                    redisClient.hget(userData.uuid, "bossElo").then(function (levelData) {
                        userData.level = parseInt(levelData);
                        if (!findRankedMatch(userData)) {
                            // Push user data if a match isn't found
                            playersSearching[socket.id] = userData;
                            socket.emit(eventEnum.output.SEARCHING);
                        }
                    });
                }
            }
        });
    });

    socket.on(eventEnum.input.ACCEPT, function (data) {
        // Find match socket is in
        var match = null;
        for (var key in pendingMatches) {
            if (pendingMatches.hasOwnProperty(key)) {
                pendingMatches[key].forEach(function (player) {
                    if (player.socket.id === socket.id) {
                        match = pendingMatches[key];
                    }
                });
                if (match) {
                    break;
                }
            }
        }
        if (!match) {
            return;
        }
        for (var i = 0; i < match.length; i++) {
            var player = match[i];
            if (socket.id === player.socket.id) {
                if (!player.accepted) {
                    player.accepted = true;
                    match.forEach(function (user) {
                        user.socket.emit(eventEnum.output.ACCEPTED);
                    });
                    // Start a match server if that player was the final player to accept
                    if (match.every(function (elem) {
                        if (elem.accepted) {
                            return true;
                        }
                        return false;
                    })) {
                        var matchId = Math.floor(Math.random() * 100000);
                        findServer(match, matchId, io);
                    }
                }
                i = match.length;
            }
        }
    });

    socket.on(eventEnum.input.DECLINE, function (data) {
        // TODO: Make a timeout for accepting/declining the game
        // Find match socket is in
        var match = null;
        var matchKey = null;
        for (var key in pendingMatches) {
            if (pendingMatches.hasOwnProperty(key)) {
                pendingMatches[key].forEach(function (player) {
                    if (player.socket.id === socket.id) {
                        match = pendingMatches[key];
                        matchKey = key;
                    }
                });
                if (match) {
                    break;
                }
            }
        }
        if (!match) {
            return;
        }
        // TODO: Make timeout so that player cant rejoin matchmaking for a while (60 secs)
        for (var i = 0; i < match.length; i++) {
            var player = match[i];
            if (player.socket.id === socket.id) {
                // TODO: Send cooldown until next search
            } else {
                player.socket.emit(eventEnum.output.INTERRUPTED);
                if (player.matchType === "normal") {
                    findNormalMatch(player);
                } else {
                    findRankedMatch(player);
                }
            }
        }
        // Splice match
        delete pendingMatches[matchKey];
    });

    socket.on(eventEnum.input.CANCEL, function (data) {
        // Remove the player from searching
        delete playersSearching[socket.id];
    });

    socket.on('disconnect', function () {
        delete playersSearching[socket.id];
    });
});

// Loop through to see if a match is found
var findNormalMatch = function (userData) {
    var matchKnights = parseInt(userData.matchPlayers[0]);
    var matchBosses = parseInt(userData.matchPlayers[2]);
    // Gather players (Search for in between 5 levels)
    var rangeMin = 0;
    var rangeMax = 5;
    if (userData.level === 50) {
        rangeMin = -5;
        rangeMax = 0;
    }
    // Get any members in a party first
    var matchedPlayers = getPartyPlayers(userData);
    var partyLevel = getPartyLevel(matchedPlayers);

    while (rangeMax >= 0) {
        var knightCount = 0;
        var bossCount = 0;
        for (var key in playersSearching) {
            if (!playersSearching.hasOwnProperty(key)) {
                continue;
            }
            var player = playersSearching[key];
            if (userData.region === player.region) {
                if (userData.partyID === 0 && player.partyID === 0 || player.partyID !== userData.partyID) {
                    if (player.matchType === userData.matchType && player.matchPlayers === userData.matchPlayers) {
                        if (player.level >= partyLevel + rangeMin && player.level <= partyLevel + rangeMax) {
                            if (player.side === "knight" && knightCount < matchKnights) {
                                matchedPlayers.push(player);
                                knightCount++;
                            }
                            else if (player.side === "boss" && bossCount < matchBosses) {
                                matchedPlayers.push(player);
                                bossCount++;
                            }
                            else if (matchedPlayers.length === matchKnights + matchBosses) {
                                rangeMax = -1;
                            }
                        }
                    }
                }
            }
        }
        rangeMin--;
        rangeMax--;
    }
    if (matchedPlayers.length !== matchKnights + matchBosses) {
        return false;
    }
    var matchId = Math.floor(Math.random() * 1000000);
    matchedPlayers.forEach(function (player) {
        player.socket.emit(eventEnum.output.FOUND);
        // Splice the player from the search
        delete playersSearching[player.socket.id];
    });
    pendingMatches[matchId] = match;
    return true;
};

var findRankedMatch = function (userData) {
    var matchKnights = parseInt(userData.matchPlayers[0]);
    var matchBosses = parseInt(userData.matchPlayers[2]);
    // Gather players (Search for in between 80 elo points + (0.1 * elo))
    var rangeMin = 0;
    var rangeMax = 80 + (0.1 * userData.level);
    // Get party members first
    var matchedPlayers = getPartyPlayers(userData);
    var partyLevel = getPartyLevel(matchedPlayers);

    while (rangeMax >= 0) {
        var knightCount = 0;
        var bossCount = 0;
        for (var key in playersSearching) {
            if (!playersSearching.hasOwnProperty(key)) {
                continue;
            }
            var player = playersSearching[key];
            if (userData.region === player.region) {
                if (userData.partyID === 0 && player.partyID === 0 || player.partyID !== userData.partyID) {
                    if (player.matchType === userData.matchType && player.matchPlayers === userData.matchPlayers) {
                        if (player.level >= partyLevel + rangeMin && player.level <= partyLevel + rangeMax) {
                            if (player.side === "knight" && knightCount < matchKnights) {
                                matchedPlayers.push(player);
                                knightCount++;
                            }
                            else if (player.side === "boss" && bossCount < matchBosses) {
                                matchedPlayers.push(player);
                                bossCount++;
                            }
                            else if (matchedPlayers.length >= matchKnights + matchBosses) {
                                rangeMax = -1;
                            }
                        }
                    }
                }
            }
        }
        rangeMin -= 40;
        rangeMax -= 40;
    }

    if (matchedPlayers.length !== matchKnights + matchBosses) {
        return false;
    }
    var matchId = Math.floor(Math.random() * 1000000);
    matchedPlayers.forEach(function (player) {
        player.socket.emit(eventEnum.output.FOUND);
    });
    pendingMatches[matchId] = match;
    return true;
};

var findServer = function (match, matchId, io) {
    var region = match[0].region;
    // Retrieve game server IDs
    redisClient.lrange("gameServerInstances", 0, -1).then(function (serverIds) {
        // Loop through server IDs
        // TODO: Make it so that this loops sequentially until a valid server has been found
        var found = false;
        serverIds.forEach(function (serverId) {
            // Get info about the server from their IDs
            redisClient.hgetall(serverId).then(function (data) {
                if (found) {
                    return;
                } else {
                    found = true;
                }
                if (data.region === match[0].region && data.numberGames <= maxGamesPerServer) {
                    // TODO: Create another server if maxGamesPerServer is about 75% full depending on max size (3 mins boot time)
                    var serverIp = data.ip;
                    var serverPort = data.port;
                    var knights = [];
                    var bosses = [];
                    match.forEach(function (player) {
                        if (player.side === "knight") {
                            knights.push(player.accountID);
                        } else {
                            bosses.push(player.accountID);
                        }
                    });
                    var matchData = {
                        matchPlayers: match[0].matchPlayers,
                        matchType: match[0].matchType,
                        bosses: bosses,
                        knights: knights
                    };
                    request.post("http://" + "localhost" /* Replace with serverIP*/ + ":" + serverPort + "/createRoom",
                        { form: { auth: "45X%Dg@}R`d-E])x9d", match: matchData, id: matchId } },
                        function (error, response, body) {
                            if (!error && response.statusCode === 200) {
                                // Send server ip to players after 5 seconds to allow the match to load properly
                                setTimeout(function () {
                                    match.forEach(function (player) {
                                        player.socket.emit(eventEnum.output.MATCH_CREATION, { "ip": serverIp.toString(), "port": serverPort.toString(), "id": matchId.toString() });
                                    });
                                }, 5000);
                                // Remove match from matchmaking
                                delete pendingMatches[matchId];
                            } else {
                                return;
                            }
                        }
                    );
                }
            });
        });
    });
};

var createServer = function (region) {
    var aws = require('aws-sdk');
    aws.config.region = region;
    // Set parameters
    var params = {
        ImageId: 'ami-1624987f', // TODO: Implement right image id for game server
        InstanceType: 't2.micro',
        MinCount: 1, MaxCount: 1
    };
    // TODO: Add credentials
    // AWS.config.update({accessKeyId: 'akid', secretAccessKey: 'secret'});

    // Create the instance
    var ec2 = new aws.EC2();
    ec2.runInstances(params, function (err, data) {
        if (err) { console.log("Could not create instance", err); return; }

        var instanceId = data.Instances[0].InstanceId;
        console.log("Created instance: ", instanceId);

        // Add tags to the instance
        params = {
            Resources: [instanceId], Tags: [
                { Key: 'GameServer', Value: region }
            ]
        };
        ec2.createTags(params, function (err) {
            console.log("Tagging instance", err ? "failure" : "success");
        });
    });
};

// Check if data provided is valid
var isDataValid = function (matchType, matchPlayers, uuid, side, region) {
    if (side !== "boss" && side !== "knight") {
        return false;
    }
    if (!validMatches.some(function (val) {
        return val === matchPlayers;
    })) {
        return false;
    }
    if (!validMatchTypes.some(function (val) {
        return val === matchType;
    })) {
        return false;
    }
    if (!validRegions.some(function (val) {
        return val === region;
    })) {
        return false;
    }
    var isValid = true;
    for (var key in playersSearching) {
        if (playersSearching[key].uuid === uuid) {
            isValid = false;
        }
    }
    if (!isValid) {
        return false;
    }
    return true;
};

var getPartyPlayers = function (userData) {
    var partyPlayers = [userData];
    if (partyPlayers[0].side === "knight") {
        knightCount++;
    } else {
        bossCount++;
    }
    if (userData.partyID !== 0) {
        for (var key in playersSearching) {
            if (!playersSearching.hasOwnProperty(key)) {
                continue;
            }
            var player = playersSearching[key];
            if (player.partyID === userData.partyID) {
                if (userData.side === "knight" && knightCount < matchKnights) {
                    player.side = "knight";
                    partyPlayers.push(player);
                    knightCount++;
                } else if (userData.side === "boss" && bossCount < matchBosses) {
                    player.side = "boss";
                    partyPlayers.push(player);
                    bossCount++;
                }
            }
        }
    }
    return partyPlayers;    
};

var getPartyLevel = function(partyPlayers) {
    var totalLevel = 0;
    if (partyPlayers.length > 1) {
        partyPlayers.forEach(function(player) {
            totalLevel += player.level;
        });
    }
    return totalLevel / partyPlayers.length;
};

http.listen(3009, function () {
    console.log('Matchmaker started on *:3009');
});

module.exports = app;
