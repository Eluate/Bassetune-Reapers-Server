/*
	Model class for players.
*/

// TODO : add sessionId parameter
var Player = function(socketId, username) {
	
	this.socketId = socketId;
	this.username = username;
};

Player.prototype.joinRoom = function(room) {
	room.players.push(this);
};

module.exports = Player;