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
  this.characterDestinations = [];
  this.characterDestinationsIndex = [];
  this.lastTime = new Date().getTime() / 1000;


  this.UpdateDestination = function (character, vector) {
    vector[0] = parseFloat(vector[0].toFixed(1));
    vector[1] = parseFloat(vector[1].toFixed(1));
    vector = {y: vector[0], x: vector[1], c: character};

    if (this.characterDestinationsIndex.indexOf(character) == -1) {
      this.characterDestinations.push(vector);
      this.characterDestinationsIndex.push(character);
    }
    else {
      this.characterDestinations.splice(this.characterDestinationsIndex.indexOf(character), 1);
      this.characterDestinationsIndex.splice(character, 1);
      this.characterDestinations.push(vector);
      this.characterDestinationsIndex.push(character);
    }
  };

  this.UpdateCharacterLocation = function (character, speed) {
    var time = new Date().getTime() / 1000;
    var vector = this.characterDestinations[this.characterDestinationsIndex.indexOf(character)];
    var prevLocation = this.characters[this.characterIndex.indexOf(character)];
    if (this.characterIndex.indexOf(character) != -1) {
      var prevLocation = this.characters[this.characterIndex.indexOf(character)];
      // Handle Collisions and Speed Limits
      if (Vec2.distanceTo(vector, prevLocation) > speed * (this.lastTime - time)) {
        // If character is moving to fast, move it at maximum speed to destination
        vector = Vec2.add(prevLocation,
                          Vec2.setLength(Vec2.sub(vector, prevLocation),
                                         speed * (this.lastTime - time)));
        console.log("Character: " + character + " going to fast. Reverting to location: " +
                    vector.x.toString() + " " + vector.y.toString());
      }
      for (var i = 0; i < map.geom.length; i++) {
        var p = map.geom[i];
        if ((prevLocation.x >= p.x && p.x >= vector.x || vector.x >= p.x && p.x >= prevLocation.x) &&
          (prevLocation.y >= p.y && p.y >= vector.y || vector.y >= p.y && p.y >= prevLocation.y)) {
          // Collision occurred, revert to prev position (generous, the bounds of model aren't tested)
          // TODO: Make it so that it goes close to the wall
          vector = prevLocation;
          console.log("Character: " + character + " collided with a wall at " + p.x + "," + p.y);
        }
      }
      // Update location
      this.charactersToUpdate.push(vector);
      this.charactersToUpdateIndex.push(character);
      this.characters.splice(this.characterIndex.indexOf(character), 1);
      this.characters.push(vector);
      this.characterIndex.push(character);
    } else {
      this.characters.push(vector);
      this.characterIndex.push(character);
    }
  };

  this.UpdateTime = function () {
    this.lastTime = new Date().getTime() / 1000;
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