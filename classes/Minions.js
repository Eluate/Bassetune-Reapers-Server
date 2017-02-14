/*
 Minions data
 */
var Ability = require('./Ability');
var Vector2 = require('./Vector2');

var Minions = [];

var Creature1 = function (level) {
	this.hp = 14 * level;
	this.base_damage = 1.2 * level;
	this.armor = 1.2 * level;
	this.base_range = 2;
	this.speed = 3;
};

Minions.push(Creature1);

module.exports.Minions = Minions;