/*
 Model class for location (characters, traps...)
 */
var Event = require('./EventEnum');
var Vec2 = require("./Vector2");

var Location = function (self) {
	this.PF = require("pathfinding");
	this.pathfinder = new this.PF.AStarFinder();
	this.characters = [];
	this.lastTime = new Date().getTime() / 1000;
	this.map = self.map;
	this.io = self.io;
	this.matchID = self.matchID;
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
		var time = new Date().getTime() / 1000; // todo rotation
		for (var key in this.characters) {
			var character = this.characters[key];
			if (!this.characters.hasOwnProperty(key)) return;
			var path = character.path;
			if (path == null || path == undefined || path.length == 0) continue;
			// Disable pathfinding if character is channelling
			if (character.channelling != false || character.stunned()) {
				character.path = null;
				continue;
			}

			var prevLocation = character.position;
			var speed = character.speed * (time - this.lastTime);
			var distanceTravelled = 0.0;
			var destination = {
				x: path[0][0],
				y: path[0][1]
			};

			while (distanceTravelled < speed && path.length > 0) {
				// Change rotation prior to position
				console.log("A: " + character.rotation.toString());
				character.rotation = Vec2.lerp(character.rotation, Vec2.normalise(Vec2.sub(destination, prevLocation)), (time - this.lastTime) * 4);
				console.log("B: " + character.rotation.toString());

				var prevLocation = character.position;
				var distanceToPoint = Vec2.distanceTo(destination, prevLocation);
				// Handle speed Limits
				if (distanceToPoint > speed) {
					// If character is moving to fast, move it at maximum speed to destination
					prevLocation = Vec2.add(prevLocation, Vec2.setLength(Vec2.sub(destination, prevLocation), speed - distanceTravelled));
					//console.log("Character: " + this.characters[key].id + " going to fast. Reverting to location: " +
					//	destination.x.toString() + " " + destination.y.toString());
					// Finish loop
					distanceTravelled += speed;
				} else {
					// Change rotation prior to position
					character.rotation = Vec2.lerp(character.rotation, Vec2.normalise(Vec2.sub(destination, prevLocation)), (time - this.lastTime) * 4);
					console.log(character.rotation);

					prevLocation = destination;
					distanceTravelled += speed;
					// Remove element from path
					path.shift();
				}
			}
			/*for (var i = 0; i < map.geometry.length; i++) {
			 var p = map.geometry[i];
			 // Broad Phase
			 if (Vector2.distanceTo(destination, {x: p[0] , y : p[1]}) > speed) {
			 continue;
			 }
			 // Narrow Phase
			 if (Vector2.pointCollision(destination, prevLocation, {x: p[0] , y : p[1]})) {
			 // Collision occurred, revert to prev position (generous, the bounds of model aren't tested)
			 destination = Vector2.sub(destination, Vector2.setLength(Vector2.sub(destination, prevLocation), 0.2));
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
			this.io.to(this.matchID).emit(Event.output.CHAR_LOCATIONS, {"d": data});
		}
	}
};

module.exports = Location;