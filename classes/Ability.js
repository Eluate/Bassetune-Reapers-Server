/*
 Class for the abilities and weapon usage
 */
var THREE = require('three');

var Ability = function (entityID) {
  var abilities = require('./resources/abilities');
  var store = abilities[entityID];
  this.id = entityID;

  // Store all variables
  this.StoreAbilityInfo(this, store);

  // The current cooldown
  this.curCoolDown = 0;
};

Abilty.prototype.AbilityState = {
  IDLE: "idle",
  PREPARE: "prepare",
  CAST: "cast",
  COOLDOWN: "cooldown"
};

Ability.prototype.StoreAbilityInfo = function (ability, abilityInfo) {
  ability.reqType = abilityInfo.required_type;
  ability.aoeSize = abilityInfo.aoe_size;
  ability.range = abilityInfo.range;
  ability.coolDown = abilityInfo.cool_down;
  ability.castTime = abilityInfo.cast_time;
  ability.type = abilityInfo.type;
  ability.duration = abilityInfo.duration;
  ability.numProjectiles = abilityInfo.projectiles;
  ability.skewer = abilityInfo.skewer;
  ability.damage = abilityInfo.damage;
  ability.armor = abilityInfo.armor;
  ability.damageModifier = abilityInfo.damage_modifier;
  ability.projSpeed = abilityInfo.projectile_speed;
  ability.piercing = abilityInfo.piercing;
  ability.rangeDamageModifier = abilityInfo.range_damage_modifier;
  ability.moveDistance = abilityInfo.move_distance;
  ability.moveAxis = abilityInfo.move_axis;
};

Ability.prototype.AbilityType = {
  OFFENSIVE: "offensive",
  DEFENSIVE: "defensive",
  SPECIAL: "special"
};

Ability.GetWeaponInfo = function (entityID) {
  var weapons = require('./resources/weapons');
  var weapon = weapons[entityID];

  var store = {};
  store.weaponType = weapon.weapon_type;
  store.damage = weapon.damage;
  store.description = weapon.description;
  store.busy = false;
  return store;
};

Ability.UseKnightAbility = function (ability, weapon, knight, target, location) {
  // Check if weapon matches the required weapon
  if (weapon.type != ability.req_type || ability.req_type == null) {
    return;
  }
  // Check if weapon is busy
  if (weapon.busy) {
    return;
  }
  // Check is cooldown has finished
  if (new Date().getTime() - ability.curCoolDown < ability.coolDown * 1000) {
    return;
  }
  // Make it so that the weapon can't be used while casting
  weapon.busy = true;
  // Wait until the cast time is up
  setTimeout(function() {
    // Allow the weapon to be used again
    weapon.busy = false;
    // Handle different ability types
    // For offence, target is another character (can't target knights) and/or position
    if (ability.type == Ability.AbilityType.OFFENSIVE && target.type != "knight") {
      // Damage
      if (ability.hasOwnProperty("damage")) {
        // Damage taken by must be at least 1 and most 18000
        target.hp -= Math.max(1, Math.min(this.damage * weapon.damage - target.blockArmor, 18000));
      }
    }
    // For defence, target is the position and/or another knight
    else if (ability.type == Ability.AbilityType.DEFENSIVE) {
      // Increase armor
      if (ability.hasOwnProperty("armor")) {
        // Add to blocking power
        target.blockArmor += ability.armor;
        // Remove armor after duration finishes
        setTimeout(function() {
          target.blockArmor -= ability.armor;
        }, this.duration * 1000);
      }
      // Dodge
      if (ability.hasOwnProperty("moveDistance") && target.hasOwnProperty("x") && target.hasOwnProperty("y")) {
        var characterLocation = location.characters[knight.character.id].location;
        var newLocation = characterLocation.add(new THREE.Vector2(target.x, target.y).setLength(ability.moveDistance));
        // Update new location
        location.characters[location.characterIndex.indexOf(knight.character.id)].location = newLocation;
        location.charactersToUpdate[location.charactersToUpdateIndex.indexOf(knight.character.id)].location = newLocation;
      }
    }
    // Set the new cooldown
    this.curCoolDown = new Date().getTime();
  }, this.castTime * 1000);
};


module.exports = Ability;