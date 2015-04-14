/*
 Class for the abilities and weapon usage
 */

var Ability = function (entityID) {
  var abilities = require('./resources/abilities');
  var store = abilities[entityID];
  this.id = entityID;
  this.damage = store.damage;
  this.type = store.type;
  this.reqType = store.required_type;
  this.aoeSize = store.aoe_size;
  this.special = store.special;
  this.ranged = store.ranged;
  this.range = store.range;
  this.description = store.description;
  this.cooldown = store.cool_down;
  this.castTime = store.cast_time;
  this.duration = store.duration;
  this.curCooldown = 0;

  this.UseKnightAbility = function (weapon, knight, target) {
    if (!weapon.busy) {
      if (new Date().getTime() - this.curCoolDown >= this.cooldown * 1000) {
        weapon.busy = true;
        setTimeout(function() {
          weapon.busy = false;
          /*
            Handle Different Ability Types
           */
          if (this.type == Ability.AbilityType.OFFENSIVE) {
            // Damage taken by must be at least 1 and most 18000
            target.hp == target.hp - Math.max(1, Math.min(this.damage * weapon.damage - target.blockArmor, 18000))

            if (this.special.toString() == "true") {
              // TODO: Eval Ability
            }
          }
          else if (this.type == Ability.AbilityType.DEFENSIVE) {
            // Add to blocking power (damage is added as armor)
            target.blockArmor += this.damage;

            setTimeout(function() {
              target.blockArmor -= this.damage;
            }, this.duration * 1000);

            if (this.special.toString() == "true") {
              // TODO: Eval Ability
            }
          }
          else {
            if (this.special.toString() == "true") {
              // TODO: Eval Ability
            }
          }
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