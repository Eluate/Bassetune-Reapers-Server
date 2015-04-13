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
  this.cooldown = store.cool_down;
  this.castTime = store.cast_time;
  this.curCooldown = 0;

  this.UseAbility = function (weapon, target) {
    if (!weapon.busy) {
      if (new Date().getTime() - this.curCoolDown >= this.cooldown * 1000) {
        weapon.busy = true;
        setTimeout(function() {
          weapon.busy = false;
          // TODO: Effect HP
          this.curCoolDown = new Date().getTime();
        }, this.castTime * 1000);
      }
    }
  };
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
  store.busy = false;
  return store;
};

module.exports = Ability;