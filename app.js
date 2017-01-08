var cluster = require('cluster');
var exitHandler = require('./modules/appExitHandler').cleanup();
if(cluster.isMaster) {
  //master should communicate with face instances using http on startPort
  var startPort = process.env.PORT || 3000;//startPort is reserved for http server to communicate with backendFace
  var redisClient = require('./modules/redisHandler').redisClient;
  var uuid = require('node-uuid');

  // Count the machine's CPUs
  var cpuCount = require('os').cpus().length;
  var workers = [];

  // Create worker children
  for (var i = 1; i < cpuCount + 1; i++) {
    var workerPort = startPort + i;
    var workerID = uuid.v1();
    var w = cluster.fork({port: workerPort, workerID: workerID});
    var workerHandler = {worker: w, port: workerPort, workerID: workerID};
    workers[w.id] = workerHandler;
  }

  // Listen for dying workers
  cluster.on('exit', function (worker) {
    // Replace the dead worker, we're not sentimental
    console.log('Worker ' + worker.id + ' died.');
    redisClient.lrem("gameServerInstances", -1, workers[worker.id].workerID);
    redisClient.del(workers[worker.id].workerID);
    // Create new worker
    var workerID = uuid.v1(); // Assign a new id
    var w = cluster.fork({port: workers[worker.id].port, workerID: workerID});
    workers[w.id] = {worker: w, port: workerPort, workerID: workerID};
  });

  console.log("Master finished processing initial statements.");
}

if (cluster.isWorker)
{
  var ip = require('external-ip')()(function(err, ip) {
    // Check if failed
    if (err || !ip) {
      console.log("Worker ID: " + process.env.workerID + " - couldn't retrieve IP.");
      process.exit();
    }
    // Otherwise continue
    var Event = require('./classes/EventEnum');
    var redisClient = require('./modules/redisHandler').redisClient;
    var app = require('express')();
    var bodyParser = require('body-parser');
    
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    var http = require("http").Server(app);
    var Room = require("./classes/Room");
    var rooms = {};

    // Listen for create room calls
    app.post('/createRoom', function (req, res)
    {
      console.log("Create Room request: " + JSON.stringify(req.body, null, 2));
      // Check authentication
      if (req.body.auth != "45X%Dg@}R`d-E])x9d") 
      {
        return;
      }
      var match = req.body.match;
      var matchID = req.body.id;
      var config = {
        matchType: match.matchType,
        matchPlayers: match.matchPlayers,
        bosses: match.bosses,
        knights: match.knights
      };
      // Create room using data
      var room = new Room(io, matchID, config);
      rooms[matchID] = room;
      // Update redis
      redisClient.hincrby(process.env.workerID, "numberGames", 1);
      //Reply
      console.log("Match:", matchID, "created.");
      res.send(matchID);
    });

    app.set('port', process.env.port);
    console.log('Worker ID: ' + process.env.workerID + ' listening at ' + ip + ' on port ' + app.get("port"));

    // Get region
    /*var request = require('request');
    request('http://169.254.169.254/latest/meta-data/placement/availability-zone', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // Update redis
        var regions = ["us-east-1", "us-west-1", "us-west-2", "sa-east-1", "eu-west-1", "eu-central-1", "ap-southeast-2",
                      "ap-southeast-1", "ap-northeast-1"];
        var region = regions[0];
        regions.forEach(function(regionName) {
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
        console.log("Worker ID: " + process.env.workerID + " - Updated Redis.");
      } else {*/
        console.log("Worker ID: " + process.env.workerID + " - couldn't get region.");
        //process.exit(0);
        //THIS STUFF IS TO BE DELETED
        redisClient.lpush("gameServerInstances", process.env.workerID);
        redisClient.hmset(process.env.workerID,
          {
            ip: ip,
            port: process.env.port,
            numberGames: 0,
            region: "us-east-1"
          });
      //}
    //});

    // Set up servers
    var io = require('socket.io')(http);

    if (io) {
      console.log("Worker ID: " + process.env.workerID + " - Socket.IO running and accepting connections.");
    }

    http.listen(app.get('port'), function(){
      // Listening
    });

    io.on('connection', function (socket) 
    {
      var socketID = socket.id;
      var clientIP = socket.request.connection.remoteAddress;
      console.log("WorkerID: " + process.env.workerID + ': ' + clientIP + " just connected.");

      socket.on('join', function (data) {
        if (Object.keys(rooms).indexOf(data.matchID) > -1) {
          console.log(socket.id + " joined room: " + data.matchID);
          socket.join(data.matchID);
          // Further communication is with the room
          socket.roomInstance = rooms[data.matchID];
          socket.roomInstance.onRegister(socket, data);
        }
      });

      // The GameUUID that the socket belongs to is in socket.rooms[1]
      socket.on('disconnect', function () 
      {
        if (socket.roomInstance)
          socket.roomInstance.onDisconnect(socket);
      });

      socket.on(Event.input.TALK, function (data) 
      {
        if (socket.roomInstance)
          socket.roomInstance.onTalk(socket,data);
      });

      socket.on(Event.input.MOVE, function (data) 
      {
        if (socket.roomInstance)
          socket.roomInstance.onMove(socket,data);
      });

      socket.on(Event.input.LEAVE, function ()
      {
        if (socket.roomInstance)
          socket.roomInstance.onLeave(socket);
      });
      
      socket.on(Event.input.knight.CHANGE_EQUIPPED, function (data) 
      {
        if (socket.roomInstance)
          socket.roomInstance.onKnightChangeEquipped(socket,data);
      });

      socket.on(Event.input.knight.ABILITY_START, function (data) 
      {
        if (socket.roomInstance)
          socket.roomInstance.onKnightAbilityStart(socket,data);
      });

      socket.on(Event.input.knight.USE_ITEM_START, function (data) 
      {
        if (socket.roomInstance)
          socket.roomInstance.onKnightUseItemStart(socket,data);
      });

      socket.on(Event.input.boss.PUT_TRAP, function (data) 
      {
        if (socket.roomInstance)
          socket.roomInstance.onBossPutTrap(socket,data);
      });

      socket.on(Event.input.boss.ABILITY_START, function (data) 
      {
        if (socket.roomInstance)
          socket.roomInstance.onBossAbilityStart(socket,data);
      });
    });
  });
}