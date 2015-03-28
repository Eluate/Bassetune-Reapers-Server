/*
	Simple chat system
*/
var Event = require('./EventEnum');

var Chat = function(io,room) {
	
	//this.stack = [];
	
	// closure
	this.addMsg = function(player, msg) {
	
		var entry = {
			username: player.username,
			msg: msg
		};
		
		//this.stack.push(entry);
		io.to(room).emit(Event.output.NEW_CHAT_MSG, entry);
	
	}
};

/*Chat.prototype.getStack = function() {
	return this.stack;
};

Chat.prototype.clear = function() {
	this.stack = [];
	count = 0;
};*/

module.exports = Chat;