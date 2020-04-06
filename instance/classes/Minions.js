/*
 Minions data
 */
var Ability = require('./Ability');
var Vector2 = require('./Vector2');

var Minions = [];

var Creature1 = function () {
    this.hp = 700;
    this.base_damage = 60;
    this.armor = 0;
    this.armorPercent = 0.1;
    this.base_range = 2;
    this.speed = 3;
};

Minions.push(Creature1);

module.exports.Minions = Minions;