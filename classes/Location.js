/*
 Model class for location (characters, traps...)
 */
var Event = require('./EventEnum');
var Vec2 = require("./Vector2");

var Location = function (io, room, map) {
  this.characters = [];
  this.characterIndex = [];
  this.charactersToUpdate = [];
  this.charactersToUpdateIndex = [];

  this.UpdateCharacterLocation = function (character, vector, speed) {
    vector[0] = parseFloat(vector[0].toFixed(1));
    vector[1] = parseFloat(vector[1].toFixed(1));
    vector = {y: vector[0], x: vector[1], c: character};
    if (this.characterIndex.indexOf(character) != -1) {
      var prevLocation = this.characters[this.characterIndex.indexOf(character)];
      // Handle Collisions and Speed Limits
      if (!Object.is(prevLocation, vector)) {
        if (Vec2.distanceTo(vector, prevLocation) > speed) {
          // If character is moving to fast, move it at maximum speed to destination
          vector = Vec2.add(prevLocation, Vec2.multiplyScalar(Vec2.normalise(Vec2.sub(vector, prevLocation)), speed));
          console.log("Character: " + character + " going to fast. Reverting to location: " +
                      vector.x.toString() + " " + vector.y.toString());
        }
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
      if (!Object.is(prevLocation, vector)) {
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
        i: character.c,
        l: character
      };
      data.push(info);
    });
    if (data.length > 0) {
      io.to(room).emit(Event.output.CHAR_LOCATIONS, {"d":data});
    }
    this.charactersToUpdate = [];
    this.charactersToUpdateIndex = [];
  };

  this.GetCharacterLocation = function(characterID) {
    if (this.characterIndex.indexOf(characterID) != -1) {
      return this.characters[characterID];
    }
  };
};

module.exports = Location;