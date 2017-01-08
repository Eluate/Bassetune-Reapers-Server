/**
 * Model class for Traps
 */

/*
 * Adding only the detection system first.
 */

var Location = require('./Location');
var Vec2 = require('./Vector2');
var Traps = require('./resources/traps');

var Trap = function (id, loc, map) {
	var trap = Traps[id];

	this.width = trap['width'];
	this.height = trap['height'];
	this.damage = trap['damage'];

	this.position = {
		x: loc.x,
		y: loc.y
	};
	this.trapBottomRight = {
		x: this.position.x + this.width,
		y: this.position.y + this.height
	};
};

Trap.prototype = {
	// Check if a specific trap has been triggered by a movement of a knight character
	isTriggered: function (character) {
		var position = character.position;
		if (Vec2.pointCollision(this.position, this.trapBottomRight, position)) {
			console.log("Trap triggered!");
		}
	}
};

module.exports = Traps;