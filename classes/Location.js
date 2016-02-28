/*
 Model class for location (characters, traps...)
 */
var Event = require('./EventEnum');
var Vec2 = require("./Vector2");
var PF = require("pathfinding");

var Location = function (io, room, map) {
  this.characters = [];
  this.charactersToUpdate = [];
  this.charactersToUpdateIndex = [];
  this.characterDestinations = [];
  this.characterDestinationsIndex = [];
  this.lastTime = new Date().getTime() / 1000;

  this.UpdateDestination = function (character, vector) {
    var vector = {
      x: parseFloat(vector[0].toFixed(1)),
      y: parseFloat(vector[1].toFixed(1))
    };
    character.destination = vector;
  };

  this.UpdateCharacterPositions = function () {
    var time = new Date().getTime() / 1000;
    for (var key in this.characters) {
      var vector = this.characters[key].destination;
      if(vector == null) return;
      var speed = this.characters[key].speed * (time - this.lastTime);
      var prevLocation = this.characters[key].position;
      // Handle Collisions and Speed Limits
      if (Vec2.distanceTo(vector, prevLocation) > speed) {
        // If character is moving to fast, move it at maximum speed to destination
        vector = Vec2.add(prevLocation, Vec2.setLength(Vec2.sub(vector, prevLocation), speed));
        console.log("Character: " + this.characters[key].id + " going to fast. Reverting to location: " +
          vector.x.toString() + " " + vector.y.toString());
      }
      /*for (var i = 0; i < map.geometry.length; i++) {
        var p = map.geometry[i];
        // Broad Phase
        if (Vec2.distanceTo(vector, {x: p[0] , y : p[1]}) > speed) {
          continue;
        }
        // Narrow Phase
        if (Vec2.pointCollision(vector, prevLocation, {x: p[0] , y : p[1]})) {
          // Collision occurred, revert to prev position (generous, the bounds of model aren't tested)
          vector = Vec2.sub(vector, Vec2.setLength(Vec2.sub(vector, prevLocation), 0.2));
          console.log("Character: " + character + " collided with a wall at " + p.x1 + "," + p.y1);
        }
      }*/
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
          l: [0,0]
        };
        info.l[0] = character.position.x;
        info.l[1] = character.position.y;
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