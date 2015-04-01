/*
	Model class for players.
*/

// TODO : add sessionId parameter
var Player = function(socketId, username) {
	
	this.socketId = socketID;
	this.username = username;

    // TODO: Add UUID for username identification
};

Player.prototype.joinRoom = function(room) {
	room.players.push(this);
};

module.exports = Player;