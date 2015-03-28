var Room = function(io,socket,game_uuid,config)
{
	var	Event = require('./EventEnum');
    var Chat = require('./Chat');
    var Gamestate = require('./Gamestate');
    var Player = require('./Player');
    var roomID = game_uuid;
    var socket = socket;
    var config = config;
    var players = {};

	chat = new Chat(io,game_uuid);
	gamestate = new Gamestate(io,game_uuid);

    /*
        Listeners: Input from the player
    */
    socket.in(game_uuid).on('disconnect', function ()
    {
        var disconnect = require('./Disconnect').disconnect(socket.id);
    });
    socket.in(game_uuid).on(Event.input.TALK, function (data)
    {
        chat.addMsg(players[socket.id].username,data.message);
    });
    socket.in(game_uuid).on(Event.input.MOVE, function (data)
    {
        gamestate.updateCharacterLocation(data);
    });
    socket.in(game_uuid).on(Event.input.LEAVE, function() {
        // TODO: Secure leave
    });
    socket.in(game_uuid).on(Event.input.knight.CHANGE_WEAPON, function(data) {
        // TODO: Access changing weapons
    });
    socket.in(game_uuid).on(Event.input.knight.CHANGE_ARMOR, function(data) {
        // TODO: Access changing armor
    });

    // Quick Game Loop, 12 Updates per second
    setTimeout(gamestate.broadcast, 83);
    // Slow Game Loop, 6 Updates per second
};

Room.prototype.stop = function()
{
// TODO : disconnect players, close socket, update redis, shutdown room
};



module.exports = Room;