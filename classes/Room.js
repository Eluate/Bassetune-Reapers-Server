var Room = function(io,socket,game_uuid,config)
{

	var	Event = require('./EventEnum'),
		Chat = require('./Chat'),
		Gamestate = require('./Gamestate'),
		Player = require('./Player'),
		roomID = game_uuid;
		socket = socket;
		config = config;
		players = {};
		//get players data from redis in put in player object
		chat = new Chat(io,game_uuid);
		gamestate = new Gamestate(io,game_uuid);
	};


	Room.prototype.stop = function() 
	{
	// TODO : disconnect players, close socket, update redis, shutdown room
	};
		
		
	//events sent by player in this game session
	socket.in(game_uuid).on(Event.input.TALK, function (data)
	{
		chat.addMsg(players[socket.id].username,data.message);
	});
	socket.in(game_uuid).on(Event.input.MOVE, function (data)
	{
		gamestate.updateCharacterLocation(data);
	});
	//rest to be implemented
		

	//quick game loop, every 60ms
	setTimeout(gamestate.broadcast,60);
	//slow game loop
	
		

};



module.exports = Room;