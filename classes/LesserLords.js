/*
 Minions data
 */
var Ability = require('./Ability');
var Vector2 = require('./Vector2');

var LesserLords = [];

var LesserLord1 = function () {
    this.hp = 5000;
    this.base_damage = 120;
    this.armor = 0;
    this.armorPercent = 0.1;
    this.base_range = 2;
    this.speed = 3;
};

LesserLords.push(LesserLord1);

module.exports.LesserLords = LesserLords;