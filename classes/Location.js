/*
 Model class for location (characters, traps...)
 */
var THREE = require('three');
var Event = require('./EventEnum');

var Location = function (io, room, map) {
  this.characters = [];
  this.characterIndex = [];
  this.charactersToUpdate = [];
  this.charactersToUpdateIndex = [];

  this.UpdateCharacterLocation = function (character, vector, speed) {
    vector[0] = parseFloat(vector[0].toFixed(1));
    vector[1] = parseFloat(vector[1].toFixed(1));
    vector = new THREE.Vector2(vector[0], vector[1]);
    if (this.characterIndex.indexOf(character) != -1) {
      var prevLocation = this.characters[this.characterIndex.indexOf(character)];
      // Handle Collisions and Speed Limits
      if (prevLocation.x.toString() + prevLocation.y.toString() != vector.x.toString() + vector.y.toString()) {
        //if (prevLocation.distanceTo(vector) > speed) {
        //  // If character is moving to fast, move it at maximum speed to destination
        //  vector = prevLocation.clone().add(vector.clone().sub(prevLocation)).normalize().multiplyScalar(speed);
        //  vector.x = parseFloat(vector.x.toFixed(1));
        //  vector.y = parseFloat(vector.y.toFixed(1));
        //  //console.log("Character: " + character + " going to fast. Reverting to location: " +
        //  //            vector.x.toString() + " " + vector.y.toString());
        //}
        for (var i = 0; i < map.geom.length; i++) {
          var p = map.geom[i];
          if ((prevLocation.x >= p.x && p.x >= vector.x || vector.x >= p.x && p.x >= prevLocation.x) &&
            (prevLocation.y >= p.y && p.y >= vector.y || vector.y >= p.y && p.y >= prevLocation.y)) {
            // Collision occurred, revert to prev position (generous, the bounds of model aren't tested)
            vector = prevLocation;
            console.log("Character: " + character + " collided with a wall at " + p.x + "," + p.y);
          }
        }
      }
      // Check whether location needs updating
      if (prevLocation.x.toString() + prevLocation.y.toString() != vector.x.toString() + vector.y.toString()) {
        this.charactersToUpdate.push(vector);
        this.charactersToUpdateIndex.push(character);
        this.characters.splice(this.characterIndex.indexOf(character), 1);
        this.characters.push(vector);
        this.characterIndex.push(character);
      }
    } else {
      this.characters.push(vector);
      this.characterIndex.push(character);
    }
  };

  this.SendCharacterLocations = function () {
  // TODO: Make it so that it only sends locations in a certain area for knights
    var data = [];
    this.charactersToUpdate.forEach(function (character) {
      var info = {
        i: character,
        l: character.location
      };
      data.push(info);
    });
    if (data.length > 0) {
      io.to(room).emit(Event.output.CHAR_LOCATIONS, {"d":data});
    }
    this.charactersToUpdate = [];
  };
};

module.exports = Location;