var Event = require('./EventEnum');

/*
	Model class for gamestates.
	TODO : intended to evolve, depending a lot of client architecture.
*/

var Gamestate = function(io,room) {
	
	this.characters = []; // TODO
	this.room = room;
	
	// closure
	this.broadcast = function() {
		console.log('broadcasting...');
		io.to(this.room).emit(Event.output.CHAR_LOCATIONS, this.getCharactersLocations());
	}
	
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

Gamestate.prototype.updateCharacterLocation = function(data) {
	// TODO
	console.log('updateCharacterLocation: x:'+data.x+', y:'+data.y+', z:'+data.z+', r:'+data.r);
};

// Useful for broadcasting characters movements to all clients
Gamestate.prototype.getCharactersLocations = function() {
	var locations = [];
	this.characters.forEach(function(character) {
		locations.push({
			id: character.id,
			location: character.location
		});
	});
	return locations;
};

module.exports = Gamestate;