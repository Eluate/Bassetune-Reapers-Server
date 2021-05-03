const cluster = require('cluster');
const config = require('config');
require('../global/appExitHandler').cleanup();

if (cluster.isMaster) {
    //master should communicate with face instances using http on startPort
    let startPort = config.get('Server.port'); //startPort is reserved for http server to communicate with backendFace
    let redisClient = require('../global/redisHandler').redisClient;
    let uuid = require('node-uuid');

    // Count the machine's CPUs
    let cpuCount = require('os').cpus().length;
    let workers = [];

    // Create worker children
    for (let i = 1; i < cpuCount + 1; i++) {
        let workerPort = startPort + i;
        let workerId = uuid.v1();
        let w = cluster.fork({port: workerPort, workerID: workerId});
        let workerHandler = {worker: w, port: workerPort, workerID: workerId};
        workers[w.id] = workerHandler;
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died.');
        redisClient.lrem("gameServerInstances", -1, workers[worker.id].workerID);
        redisClient.del(workers[worker.id].workerID);
        // Create new worker
        let workerId = uuid.v1(); // Assign a new id
        let w = cluster.fork({port: workers[worker.id].port, workerID: workerId});
        workers[w.id] = {worker: w, port: workers[worker.id].port, workerID: workerId};
    });

    console.log("Master finished processing initial statements.");
    return;
}

if (!cluster.isWorker) return;

const request = require('request');
const event = require('./classes/EventEnum');
const room = require("./classes/Room");
const bodyParser = require('body-parser');
const app = require('express')();
const redisClient = require('../global/redisHandler').redisClient;
const getExternalIp = require('external-ip')();

getExternalIp(function (err, ip) {
    handleIpError(err, ip);
    setUpWorker(ip);
});

let setUpWorker = function(ip) {
    let rooms = {};

    app.set('port', process.env.port);
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

    // Set up servers
    let server = app.listen(app.get('port'));
    let io = require('socket.io')(server, {
        serveClient: false,
        // below are engine.IO options
        pingInterval: 30000,
        pingTimeout: 5000,
        cookie: false,
        transports: ["websocket"]
    });
    console.log('Worker ID: ' + process.env.workerID + ' listening at ' + ip + ' on port ' + app.get("port"));

    // Listen for create matchID calls
    listenForRoomCreation(io, rooms);

    // Get region
    request('http://169.254.169.254/latest/meta-data/placement/availability-zone', function (error, response, body) {
        if (!error && response.statusCode !== 200) {
            // Update redis
            let regions = ["us-east-1", "us-west-1", "us-west-2", "sa-east-1", "eu-west-1", "eu-central-1", "ap-southeast-2",
                "ap-southeast-1", "ap-northeast-1"];
            let region = regions[0];
            regions.forEach(function (regionName) {
                if (body.toLowerCase().indexOf(regionName) != -1) {
                    region = regionName;
                }
            });
            redisClient.lpush("gameServerInstances", process.env.workerID);
            redisClient.hmset(process.env.workerID,
                {
                    ip: ip,
                    port: process.env.port,
                    numberGames: 0,
                    region: region
                });
            console.log("Worker ID: " + process.env.workerID + " - updated redis.");
        } else {
            if (config.get('Environment') !== "default") {
                console.log("Worker ID: " + process.env.workerID + " - couldn't get region - exiting.");
                process.exit(0);
            }
            // Below lines are kept for test locally
            redisClient.lpush("gameServerInstances", process.env.workerID);
            redisClient.hmset(process.env.workerID,
                {
                    ip: ip,
                    port: process.env.port,
                    numberGames: 0,
                    region: "us-east-1"
                });
            console.log("Worker ID: " + process.env.workerID + " - couldn't get region - updated redis.");
        }

        handleConnectionEvents(io, rooms);
    });
};

let listenForRoomCreation = function (io, rooms) {
    app.post('/createRoom', function (req, res) {
        console.log("Create Room request: " + JSON.stringify(req.body, null, 2));
        // Check authentication
        if (req.body.auth !== config.get('Server.auth')) {
            return;
        }
        let match = req.body.match;
        let matchID = req.body.id;
        let matchConfig = {
            matchType: match.matchType,
            matchPlayers: match.matchPlayers,
            bosses: match.bosses,
            knights: match.knights
        };
        // Create matchID using data
        let newRoom = new room(io, matchID, matchConfig);
        rooms[matchID] = newRoom;
        // Update redis
        redisClient.hincrby(process.env.workerID, "numberGames", 1);
        //Reply
        res.send(matchID);
        console.log("Match:", matchID, "created.");
    });
};

let handleConnectionEvents = function (io, rooms) {
    if (io) {
        console.log("Worker ID: " + process.env.workerID + " - Socket.IO running and accepting connections.");
    }

    io.on('connection', function (socket) {
        let clientIP = socket.request.connection.remoteAddress;
        console.log("WorkerID: " + process.env.workerID + ': ' + clientIP + " just connected.");

        socket.on('join', function (data) {
            if (Object.keys(rooms).indexOf(data.matchID) > -1) {
                console.log(socket.id + " joined matchID: " + data.matchID);
                socket.join(data.matchID);
                // Further communication is with the matchID
                socket.roomInstance = rooms[data.matchID];
                socket.roomInstance.onRegister(socket, data);
            }
        });

        // The GameUUID that the socket belongs to is in socket.rooms[1]
        socket.on('disconnect', function () {
            if (socket.roomInstance)
                socket.roomInstance.onDisconnect(socket);
        });

        socket.on(event.input.TALK, function (data) {
            if (socket.roomInstance)
                socket.roomInstance.onTalk(socket, data);
        });

        socket.on(event.input.MOVE, function (data) {
            if (socket.roomInstance)
                socket.roomInstance.onMove(socket, data);
        });

        socket.on(event.input.LEAVE, function () {
            if (socket.roomInstance)
                socket.roomInstance.onLeave(socket);
        });

        socket.on(event.input.knight.CHANGE_EQUIPPED, function (data) {
            if (socket.roomInstance)
                socket.roomInstance.onKnightChangeEquipped(socket, data);
        });

        socket.on(event.input.knight.ABILITY_START, function (data) {
            if (socket.roomInstance)
                socket.roomInstance.onKnightAbilityStart(socket, data);
        });

        socket.on(event.input.knight.USE_ITEM_START, function (data) {
            if (socket.roomInstance)
                socket.roomInstance.onKnightUseItemStart(socket, data);
        });

        socket.on(event.input.boss.PUT_TRAP, function (data) {
            if (socket.roomInstance)
                socket.roomInstance.onBossPutTrap(socket, data);
        });

        socket.on(event.input.boss.ABILITY_START, function (data) {
            if (socket.roomInstance)
                socket.roomInstance.onBossAbilityStart(socket, data);
        });
    });
};

let handleIpError = function (err, ip) {
    if (err || !ip) {
        console.log("Worker ID: " + process.env.workerID + " - couldn't retrieve IP.");
        process.exit();
    }
};