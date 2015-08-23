
var cluster = require('cluster');

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
    redisClient.lrem("gameServerInstances", workers[worker.id].workerID);
    redisClient.del(workers[worker.id].workerID);
    // Create new worker
    var workerID = uuid.v1(); // Assign a new id
    var w = cluster.fork({port: workers[worker.id].port, workerID: workerID});
    workers[w.id] = {worker: w, port: workerPort, workerID: workerID};
  });

  console.log("Master finished processing initial statements.");
}

else 
{


  var ip = require('external-ip')()(function(err, ip) {
    // Check if failed
    if (err || !ip) {
      console.log("Worker ID: " + process.env.workerID + " - couldn't retrieve IP.");
      process.exit();
    }
    else
    {
      console.log(" worker : " + process.env.workerID + " ip : " + ip);
    }
    // Otherwise continue
    var redisClient = require('./modules/redisHandler').redisClient;
    var app = require('express')();
    var http = require("http").Server(app);
    var Room = require("./classes/Room");
    var rooms = {};

    app.set('port', process.env.port);
    // Listen for create room calls
    app.use('/createRoom', function (req, res) {
      // Check authentication
      if (data.auth != "45X%Dg@}R`d-E])x9d" || !data.matchID || !data.players) {
        return;
      }
      // Parse data
      var players = JSON.parse(req.match);
      var matchID = parseInt(req.matchID, 10);
      var config = {"knightCount":players[0].matchPlayers[0], "bossCount:":players[0].matchPlayers[2]};
      // Create room using data
      var room = new Room(io, matchID, config);
      rooms[matchID] = room;
      // Update redis
      redisClient.hincrby(process.env.workerID, "numberGames", 1);
      // Reply
      res.send('created');
    });

    app.listen(app.get("port"));
    console.log('Worker ID ' + process.env.workerID + ' listening at ' + ip + ' on port: ' + app.get("port"));

    // Get region
    var request = require('request');
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
            numberGames: 0, // Incremented every time a new game instance is created
            region: region
          });
        console.log("Worker ID: " + process.env.workerID + " - Updated Redis.");
      } else {
        console.log("Worker ID: " + process.env.workerID + " - couldn't get region.");
        process.exit(0);
      }
    });

    // Start SocketIO
    var io = require('socket.io')({transports: ['websocket']});
    io.listen(http);
    if (io) {
      console.log("Worker ID: " + process.env.workerID + " - Socket.IO running and accepting connections.");
    }

    io.on('connection', function (socket) {
      var socketID = socket.id;
      var clientIP = socket.request.connection.remoteAddress;
      console.log(cluster.worker.id + ': ' + clientIP + " just connected.");
      socket.emit('ok');

      socket.on('joinRoom', function (data) {
        console.log(data);
        socket.join(data.game_uuid);
        socket.emit('ok');
        //starting now, rest of communication is with Room
      });
    });
  });
}