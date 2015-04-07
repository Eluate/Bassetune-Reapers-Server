/*
 Model class for location (characters, traps...)
 */
var THREE = require('three');

var Location = function (io, room) {
  var characters = [];
  var characterIndex = [];
  var charactersToUpdate = [];

  this.UpdateCharacterLocation = function (character, vector) {
    // TODO: Implement Collision
    // TIP: Speed can be calculated/measured by normalizing the vector3, multiply by speed and add it to location
    var characterLocation = {
      id: character.id,
      location: vector
    };
    if (characterIndex.indexOf(characterLocation.id) == -1) {
      characters.push(characterLocation);
      characterIndex.push(characterLocation.id);
    }
    else {
      if (characters[characterIndex.indexOf(characterLocation.id)].prevLocation != characterLocation.location) {
        charactersToUpdate.push(characterLocation);
        characterLocation.prevLocation = characters[characterIndex.indexOf(characterLocation.id)].location;
        characters.splice(characterIndex.indexOf(characterLocation.id), 1);
        characters.push(characterLocation);
      }
    }
  };

  this.SendCharacterLocations = function () {
    var data = [];
    charactersToUpdate.forEach(function (character) {
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