var Event = require('./EventEnum');

/*
	Model class for gamestates.
	TODO : intended to evolve, depending a lot of client architecture.
*/

var Gamestate = function(io,room) {
	
	this.characters = []; // TODO
	this.room = room;

	
};

// Add a character (playable character or enemy)
Gamestate.prototype.addNewCharacter = function(character) {
	this.characters.push(character);
};

// Return integral gamestate (useful for client first connection)
Gamestate.prototype.get = function() {
	return {
		characters: this.characters
	};
};

module.exports = Gamestate;