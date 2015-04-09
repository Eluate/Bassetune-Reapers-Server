/*
 Class for the abilities and weapon usage
 */

var Ability = function (entityID) {
  var abilities = require('./resources/abilities');
  var store = abilities[entityID];
  this.damage = store.damage;
  this.reqType = store.required_type;
  this.aoeSize = store.aoe_size;
  this.special = store.special;
  this.ranged = store.ranged;
  this.range = store.range;
  this.description = store.description;
};

Abilty.prototype.AbilityState = {
  IDLE: "idle",
  PREPARE: "prepare",
  CAST: "cast",
  COOLDOWN: "cooldown"
};

Abilty.prototype.AbilityType = {
  OFFENSIVE: "offensive",
  DEFENSIVE: "defensive",
  SPECIAL: "special"
};

Ability.prototype.GetWeaponInfo = function (entityID) {
  var weapons = require('./resources/weapons');
  var weapon = weapons[entityID];

  var store = {};
  store.weaponType = weapon.weapon_type;
  store.damage = weapon.damage;
  store.description = weapon.description;
  store.cooldown = weapon.cool_down;
  store.castTime = weapon.cast_time;
  return store;
};

module.exports = Ability;