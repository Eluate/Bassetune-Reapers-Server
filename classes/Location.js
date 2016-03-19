/*
 Model class for location (characters, traps...)
 */
var Event = require('./EventEnum');
var Vec2 = require("./Vector2");

var Location = function (io, room, map) {
  this.characters = [];
  this.lastTime = new Date().getTime() / 1000;
  this.map = map;
  this.io = io;
  this.room = room;
};

Location.prototype = {
  UpdateDestination: function (character, vector) {
    var vector = {
      x: parseInt(vector[0]),
      y: parseInt(vector[1])
    };
    if (vector.x > 0 && vector.y > 0 && this.map.borderedMap.length > vector.x && this.map.borderedMap[0].length > vector.y) {
      character.path = vector;
    } else {
      character.path = null;
    }
  },

  UpdateCharacterPositions: function () {
    var time = new Date().getTime() / 1000;
    for (var key in this.characters) {
      if (!this.characters.hasOwnProperty(key)) {
        continue;
      }
      var character = this.characters[key];
      var path = character.path;
      var prevLocation = character.position;
      if(path == null || path == undefined || path.length == 0) {
        continue;
      }
      var speed = character.speed * (time - this.lastTime);
      var vector = {
        x: path.x,
        y: path.y
      };
      var distanceToPoint = Vec2.distanceTo(vector, prevLocation);
      // Handle speed Limits
      if (distanceToPoint > speed) {
        // If character is moving to fast, move it at maximum speed to destination
        var newLocation = Vec2.add(prevLocation, Vec2.setLength(Vec2.sub(vector, prevLocation), speed));
        if (this.isCollisionHandled(newLocation, character)) {
          // Collision occurred, location and path updated accordingly
          continue;
        }
        character.position = newLocation;
        console.log("Character: " + character.id + " going to fast. Reverting to location: " +
          newLocation.x.toString() + " " + newLocation.y.toString());
      } else {
        if (this.isCollisionHandled(vector, character)) {
          // Collision occurred, location and path updated accordingly
          continue;
        }
        // Path complete
        character.path = null;
        // Update location
        character.position = vector;
      }
    }
  },

  UpdateTime: function () {
    this.lastTime = new Date().getTime() / 1000;
  },

  SendCharacterLocations: function () {
    // TODO: Make it so that it only sends locations in a certain area for knights
    var data = [];
    for (var key in this.characters) {
      if (!this.characters.hasOwnProperty(key)) {
        continue;
      }
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
      this.io.to(this.room).emit(Event.output.CHAR_LOCATIONS, {"d":data});
    }
  },

  isCollisionHandled: function(vector, character) {
    var prevLocation = character.position;
    var distance = parseInt(Vec2.distanceTo(vector, prevLocation)) + 1;
    for (var x = 0; x < this.map.borderedMap.length; x++) {
      for (var y = 0; y < this.map.borderedMap[x].length; y++) {
        var p = this.map.borderedMap[x][y];
        if (p == 0) {
          continue;
        }
        // Broad Phase
        if (Vec2.distanceTo(prevLocation, {x: x, y: y}) > distance) {
          continue;
        }
        // Narrow Phase
        if (Vec2.pointCollision(vector, prevLocation, {x: x, y: y})) {
          // Collision occurred, revert to 0.2 distance before collision point
          vector = Vec2.sub(prevLocation, Vec2.setLength(Vec2.sub(vector, prevLocation), 0.4));
          character.position = vector;
          character.path = null;
          //console.log("Character: " + character + " collided with a wall at " + x.toString() + ", " + y.toString());
          console.log(vector);
          return true;
        }
      }
    }
    // No collision occurred
    return false;
  }
};

module.exports = Location;