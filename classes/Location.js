/*
 Model class for location (characters, traps...)
 */
var Event = require('./EventEnum');
var Vec2 = require("./Vector2");

var Location = function (io, room, map) {
  this.characters = [];
  this.charactersToUpdate = [];
  this.charactersToUpdateIndex = [];
  this.characterDestinations = [];
  this.characterDestinationsIndex = [];
  this.lastTime = new Date().getTime() / 1000;

  this.AddCharacter = function (character, vector)
  {
    character.position = vector;
  };

  this.UpdateDestination = function (character, vector) {
    vector[0] = parseFloat(vector[0].toFixed(1));
    vector[1] = parseFloat(vector[1].toFixed(1));
    character.destination = vector;
  };

  this.UpdateCharacterPositions = function () {
    var time = new Date().getTime() / 1000;
    for (var key in this.characters) {
      var vector = this.characters[key].destination;
      if(vector == null) return;
      var speed = this.characters[key].speed * (this.lastTime - time);
      var prevLocation = this.characters[key].location;
      // Handle Collisions and Speed Limits
      if (Vec2.distanceTo(vector, prevLocation) > speed) {
        // If character is moving to fast, move it at maximum speed to destination
        vector = Vec2.add(prevLocation,
          Vec2.setLength(Vec2.sub(vector, prevLocation),
            speed));
        vector.c = character;
        //console.log("Character: " + character + " going to fast. Reverting to location: " +
        //  vector.x.toString() + " " + vector.y.toString());
      }
      for (var i = 0; i < map.geom.length; i++) {
        var p = map.geom[i];
        // Broad Phase
        if (Vec2.distanceTo(vector, {x: p.x1 , y : p.y1}) > speed) {
          continue;
        }
        // Narrow Phase
        if (Vec2.wallCollision(vector, prevLocation, {x: p.x1 , y : p.y1})) {
          // Collision occurred, revert to prev position (generous, the bounds of model aren't tested)
          vector = Vec2.sub(vector, Vec2.setLength(Vec2.sub(vector, prevLocation), 0.2));
          console.log("Character: " + character + " collided with a wall at " + p.x1 + "," + p.y1);
        }
      }
      // Update location
      this.characters[key].position = vector;
    }
  };

  this.UpdateTime = function () {
    this.lastTime = new Date().getTime() / 1000;
  };

  this.SendCharacterLocations = function () {
    // TODO: Make it so that it only sends locations in a certain area for knights
    var data = [];
    for (var key in this.characters) {
      var character = this.characters[key];
      if (character.prevPosition != character.position) {
        var info = {
          i: character.id,
          l: character
        };
        data.push(info);
        character.prevPosition = character.position;
      }
    }
    if (data.length > 0) {
      io.to(room).emit(Event.output.CHAR_LOCATIONS, {"d":data});
    }
  };
};

module.exports = Location;