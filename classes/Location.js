/*
	Model class for location (characters, traps...)
*/
var v3 = require('./Vector3');

var Location = function(io, room) {

    var characters = {};
    var characterIndex = {};

    this.UpdateCharacterLocation = function(character, vector) {
        // TODO: Implement Collision
        character.location = vector;
        if (characterIndex.indexOf(character.id) != -1) {
            characters.push(character);
            characterIndex.push(character.id);
        }
        else {
            characters.splice(characterIndex.indexOf(character.id), 1);
            characters.push(character);
        }
    };

    this.SendCharacterLocations = function() {
        var data = {};
        characters.forEach(function (character) {
            var info = {
                id: character.id,
                location: character.location
            };
            data.push(info);
        });
        io.to(room).emit(Event.output.CHAR_LOCATIONS, data);
    };

};

module.exports = Location;