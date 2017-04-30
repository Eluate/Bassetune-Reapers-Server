/*
 Model class for location (characters, traps...)
 */
var Event = require('./EventEnum');
var Item = require('./Item');
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
			x: Number(vector[0]).toFixed(2),
			y: Number(vector[1]).toFixed(2)
		};

		if (isNaN(vector.x) || isNaN(vector.y)) return;

		// Check if character is player controlled
		if (Item.ItemType.isKnight(character.entity) || Item.ItemType.isLord(character.entity) || Item.ItemType.isLesserLord(character.entity)) {
			character.path = [[vector.x, vector.y]];
		}
		// Otherwise use pathfinding for AI
		else if (vector.x < this.map.pfGrid.width && vector.y < this.map.pfGrid.height) {
			var grid = this.map.pfGrid.clone();
			var path = this.pathfinder.findPath(parseInt(character.position.x), parseInt(character.position.y), parseInt(vector.x), parseInt(vector.y), grid);
			path = this.PF.Util.compressPath(path);
			character.path = path;
			console.log("Updated path");
			console.log(character.path)
		} else {
			character.path = null;
		}
		character.channelling = false;
	},

	UpdateCharacterPositions: function () {
		var time = new Date().getTime() / 1000; // todo rotation
		for (var key in this.characters) {
			var character = this.characters[key];
			if (!this.characters.hasOwnProperty(key)) return;
			if (character.path == null || character.path == undefined || character.path.length == 0) continue;
			// Disable pathfinding if character starts channelling
			if (character.channelling != false || character.stunned()) {
				character.path = null;
				continue;
			}

			var prevPosition = character.position;
			var speed = character.speed * (time - this.lastTime);
			var distanceTravelled = 0.0;
			var destination = {
				x: Number(character.path[0][0]),
				y: Number(character.path[0][1])
			};

			while (distanceTravelled < speed && character.path && character.path.length > 0) {
				// Change rotation prior to position
				character.rotation = Vec2.lerp(character.rotation, Vec2.normalise(Vec2.sub(destination, prevPosition)), (time - this.lastTime) * 16);
				var prevPosition = character.position;
				var distanceToPoint = Vec2.distanceTo(destination, prevPosition);
				// Handle speed Limits
				if (distanceToPoint > speed) {
					// If character is moving to fast, move it at maximum speed to destination
					var newPosition = Vec2.add(prevPosition, Vec2.setLength(Vec2.sub(destination, prevPosition), speed - distanceTravelled));
					if (this.CheckCollision(prevPosition, newPosition, speed)) {
						character.path = null;
						continue;
					} else {
						prevPosition = newPosition;
						distanceTravelled += speed;
					}
				} else {
					if (this.CheckCollision(prevPosition, destination, speed)) {
						character.path = null;
						continue;
					} else {
						// Change rotation prior to position
						character.rotation = Vec2.lerp(character.rotation, Vec2.normalise(Vec2.sub(destination, prevPosition)), (time - this.lastTime) * 4);

						prevPosition = destination;
						distanceTravelled += speed;
						// Remove element from path
						character.path.shift();
					}
				}
			}
			// Update location
			this.characters[key].position = prevPosition;
		}
	},
	CheckCollision: function (prevPosition, destination) {
		var playerToDestinationRawDistance = Vec2.rawDistanceTo(prevPosition, destination) * 0.75;
		for (var i = 0; i < this.map.grid.length; i++) {
			for (var j = 0; j < this.map.grid[0].length; j++) {
				if (this.map.grid[i][j] == 0) continue;
				// Broad Phase
				if (Vec2.rawDistanceTo(prevPosition, {x: i, y: j}) <= playerToDestinationRawDistance) {
					continue;
				}
				// Narrow Phase
				var wall = {
					x: i,
					y: j,
					r: 0.1
				};
				if (Vec2.circleToCircleProjectionCollision({x: prevPosition.x, y: prevPosition.y, r: 0.5}, wall, destination, prevPosition)) {
					return true;
				}
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