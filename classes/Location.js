/*
 Model class for location (characters, traps...)
 */
var THREE = require('three');

var Location = function (io, room, map) {
  this.characters = [];
  this.characterIndex = [];
  this.charactersToUpdate = [];
  this.charactersToUpdateIndex = [];

  this.UpdateCharacterLocation = function (character, vector, speed) {
    vector = new THREE.Vector2(vector.x, vector.y);
    var prevLocation = this.characters[this.characterIndex.indexOf(characterLocation.id)].location;
    // Handle Collisions and Speed Limits
    if (prevLocation != vector && prevLocation.toString() != 'undefined') {
      if (prevLocation.distanceTo(vector) > speed) {
        // If character is moving to fast, move it at maximum speed to destination
        vector = prevLocation.add(vector.sub(prevLocation)).normalize().multiplyScalar(speed);
      }
      for (var i = 0; i < map.model.children.length; i++) {
        if (map.model.children[i].geometry) {
          var p = map.model.children[i].geometry.vertices;
          for (var j = 0; j < map.model.children[i].geometry.vertices.length; j++) {
            if ((prevLocation.x <= p[j].x && p[j].x <= vector.x || vector.x <= p[j].x && p[j].x <= prevLocation.x) &&
              (prevLocation.y <= p[j].y && p[j].y <= vector.y || vector.y <= p[j].y && p[j].y <= prevLocation.y)) {
              // Collision occurred, revert to prev position (generous, the bounds of model aren't tested)
              vector = prevLocation;
            }
          }
        }
      }
    }
    // Create characterLocation variable
    var characterLocation = {
      id: character.id,
      location: vector
    };

    // Check whether character exists yet in array
    if (this.characterIndex.indexOf(characterLocation.id) == -1) {
      this.characters.push(characterLocation);
      this.characterIndex.push(characterLocation.id);
    }
    else {
      // Check whether location needs updating
      if (prevLocation != characterLocation.location) {
        this.charactersToUpdate.push(characterLocation);
        this.charactersToUpdateIndex.push(characterLocation.id);
        characterLocation.prevLocation = prevLocation;
        this.characters.splice(this.characterIndex.indexOf(characterLocation.id), 1);
        this.characters.push(characterLocation);
      }
    }
  };

  this.SendCharacterLocations = function () {
    var data = [];
    this.charactersToUpdate.forEach(function (character) {
      var info = {
        id: character.id,
        location: character.location
      };
      data.push(info);
    });
    io.to(room).emit(Event.output.CHAR_LOCATIONS, data);
    this.charactersToUpdate = [];
  };
};

module.exports = Location;