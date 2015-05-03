/**
 * Server for testing parts without face
 */
var Room = require('./classes/Room');
var app = require('express')();
app.set('port', process.env.newPort );
var http = require("http").Server(app);
console.log("newPort : " + process.env.newPort );
var server = app.listen(app.get('port'), function()
{
  console.log('Worker Game Express server listening on address : ' + server.address().address + ' on port ' + server.address().port);

  var io = require('socket.io')({transports: ['websocket']});
  io.listen(server);

  var rooms = {};

  if(io) console.log("socket io running and accepting connections.");

  io.on('connection', function (socket)
  {
    console.log("connection");
    var clientIp = socket.request.connection.remoteAddress;
    console.log("game" + ' : ' + clientIp + " just connected.");
    socket.emit('connected');
    //this should be received after player connects, client supposed to send this msg with room name being the game_uuid
    socket.on('joinRoom', function (data)
    {
      console.log(data);
      socket.join("placeholder");
      socket.emit('joined room');
      //starting now, rest of communication is with Room
    });

    //get game config data from redis, using game_uuid, then put in config var
    //var config = ...
    socket.on('createRoom',function (data) {
      var room = new Room(io, socket, "placeholder", "placeholder");
      rooms["placeholder"] = room;
    });
  });

});