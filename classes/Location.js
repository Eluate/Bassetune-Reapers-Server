/*
 Model class for location (characters, traps...)
 */
var Event = require('./EventEnum');
var Vec2 = require("./Vector2");

var Location = function (io, room, map) {
	this.PF = require("pathfinding");
	this.pathfinder = new this.PF.AStarFinder();
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
		if (vector.x < this.map.pfGrid.width && vector.y < this.map.pfGrid.height) {
			var grid = this.map.pfGrid.clone();
			var path = this.pathfinder.findPath(parseInt(character.position.x), parseInt(character.position.y), vector.x, vector.y, grid);
			path = this.PF.Util.compressPath(path);
			character.path = path;
			console.log("Updated path");
			console.log(character.path)
		} else {
			character.path = null;
		}
	},

	UpdateCharacterPositions: function () {
		var time = new Date().getTime() / 1000;
		for (var key in this.characters) {
			if (!this.characters.hasOwnProperty(key)) return;
			var path = this.characters[key].path;
			if (path == null || path == undefined || path.length == 0) continue;
			var speed = this.characters[key].speed * (time - this.lastTime);
			var prevLocation = this.characters[key].position;
			var distanceTravelled = 0.0;
			while (distanceTravelled < speed && path.length > 0) {
				var vector = {
					x: path[0][0],
					y: path[0][1]
				};
				var distanceToPoint = Vec2.distanceTo(vector, prevLocation);
				// Handle speed Limits
				if (distanceToPoint > speed) {
					// If character is moving to fast, move it at maximum speed to destination
					prevLocation = Vec2.add(prevLocation, Vec2.setLength(Vec2.sub(vector, prevLocation), speed - distanceTravelled));
					console.log("Character: " + this.characters[key].id + " going to fast. Reverting to location: " +
						vector.x.toString() + " " + vector.y.toString());
					// Finish loop
					distanceTravelled += speed;
				} else {
					prevLocation = vector;
					distanceTravelled += speed;
					// Remove element from path
					path.shift();
				}
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
			this.characters[key].position = prevLocation;
		}
	},

	UpdateTime: function () {
		this.lastTime = new Date().getTime() / 1000;
	},

	SendCharacterLocations: function () {
		// TODO: Make it so that it only sends locations in a certain area for knights
		var data = [];
		for (var key in this.characters) {
			var character = this.characters[key];
			if (character.prevPosition != character.position) {
				var info = {
					i: character.id,
					l: [0, 0]
				};
				info.l[0] = character.position.x;
				info.l[1] = character.position.y;
				data.push(info);
				character.prevPosition = character.position;
			}
		}
		if (data.length > 0) {
			this.io.to(this.room).emit(Event.output.CHAR_LOCATIONS, {"d": data});
		}
	}
};

module.exports = Location;