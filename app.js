var cluster = require('cluster');

if (cluster.isMaster) {
  //master should communicate with face instances using http on startPort
  var startPort = process.env.PORT || 3000;//startPort is reserved for http server to communicate with backendFace

  var redisClient = require('./modules/redisHandler').redisClient;
  redisClient.incr('numGameInstances');//HOLDS THE TOTAL NUMBER OF RUNNING BACKENDGAME INSTANCES (ec2 servers in short)


  // Count the machine's CPUs
  var cpuCount = require('os').cpus().length;

  var workers = {};

  var init = function () {
    //cluster starts with 0 games

    var address = server.address().address;
    var ipObject = {};
    ipObject["ip"] = address;//master ip
    ipObject["totalgames"] = 0;//total # games on ec2 instance
    //create worker for cpu and add it to the list of workers with its port
    for (var i = 1; i < cpuCount + 1; i += 1) {
      var nport = server.address().port + i;
      var w = cluster.fork({newPort: nport});
      var workerHandler = {worker: w, port: nport};
      workers[w.id] = workerHandler;
      ipObject[w.id] = nport;
    }
    //NEED TO CHANGE SOME STUFF IN THIS INIT FCT
    redisClient.multi();
    redisClient.hmset(app.ID, ipObject);
    redisClient.sadd("backendGameInstances", app.ID);
    redisClient.exec();
    console.log(app.ID);
  };

  init();


  // Listen for dying workers
  cluster.on('exit', function (worker) {
    // Replace the dead worker, we're not sentimental
    console.log('Worker ' + worker.id + ' died :(');
    //some code to respawn the new worker with the same port and update redis
    workers[worker.id] = undefined;
    //make new worker
  });
}
else//worker
{
  var redisClient = require('./modules/redisHandler').redisClient;
  var Room = require('./classes/Room');
  var app = require('express')();
  app.set('port', process.env.newPort);
  var http = require("http").Server(app);
  console.log("newPort : " + process.env.newPort);
  var server = app.listen(app.get('port'), function () {
    console.log('Worker Game Express server listening on address : ' + server.address().address + ' on port ' + server.address().port);

  });

  var io = require('socket.io')({transports: ['websocket']});
  io.listen(server);

  var rooms = {};

  if (io) console.log("socket io running and accepting connections.");

  io.on('connection', function (socket) {
    console.log("connection");
    var socketId = socket.id;
    var clientIp = socket.request.connection.remoteAddress;
    console.log(cluster.worker.id + ' : ' + clientIp + " just connected.");
    socket.emit('ok');
    //this should be received after player connects, client supposed to send this msg with room name being the game_uuid
    socket.on('joinRoom', function (data) {
      console.log(data);
      socket.join(data.game_uuid);
      socket.emit('ok');
      //starting now, rest of communication is with Room
    });
    //communication btween this worker and faces
    socket.on('createRoom', function (data) {
      //get game config data from redis, using game_uuid, then put in config var
      //var config = ...
      var room = new Room(io, socket, data.game_uuid, config);
      rooms[data.game_uuid] = room;
      socket.emit('ok');
    });
    //etc
  });

}


module.exports = app;
