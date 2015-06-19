/*
 Class for the abilities and weapon usage
 */
var Vec2 = require("./Vector2");
var Event = require('./EventEnum');

var Ability = function (entityID) {
  var abilities = require('./resources/abilities');
  var store = abilities[entityID];
  this.id = entityID;

  // Store all variables
  this.StoreAbilityInfo(this, store);

  // The current cooldown
  this.curCoolDown = 0;
};

Ability.prototype.StoreAbilityInfo = function (ability, abilityInfo) {
  ability.id = abilityInfo.id;
  ability.reqType = abilityInfo.required_type;
  ability.aoeSize = abilityInfo.aoe_size;
  ability.range = abilityInfo.range;
  ability.coolDown = abilityInfo.cool_down;
  ability.castTime = abilityInfo.cast_time;
  ability.type = abilityInfo.type;
  ability.duration = abilityInfo.duration || 0;
  ability.numProjectiles = abilityInfo.projectiles || 0;
  ability.skewer = abilityInfo.skewer;
  ability.damage = abilityInfo.damage;
  ability.armor = abilityInfo.armor;
  ability.damageModifier = abilityInfo.damage_modifier || 1;
  ability.projSpeed = abilityInfo.projectile_speed || 2;
  ability.piercing = abilityInfo.piercing || false;
  ability.rangeDamageModifier = abilityInfo.range_damage_modifier || 0;
  ability.moveDistance = abilityInfo.move_distance;
  ability.moveAxis = abilityInfo.move_axis;
  ability.numAttacks = abilityInfo.multiple_attacks;
  ability.ignoreArmor = abilityInfo.ignore_armor;
  ability.bleed = abilityInfo.bleed || 0;
  ability.stun = abilityInfo.stun;
  ability.increaseRange = abilityInfo.increase_range;
  ability.decreaseRange = abilityInfo.decrease_range;
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
  store.busy = false;
  return store;
};

Ability.prototype.UseKnightAbility = function (weapon, character, target, location, characters, roomID, io) {
  var ability = this;
  // Check if weapon matches the required weapon
  if (ability.reqType != weapon.type && ability.reqType != null) {
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
  // Emit the use of the ability
  Ability.EmitUse(character.id, ability.id, roomID, io);
  // Wait until the cast time is up
  setTimeout(function() {
    // Return if stunned
    if (character.stunned) {
      return;
    }
    // Allow the weapon to be used again
    weapon.busy = false;
    // Handle different ability types
    // For offence, target is another character (can't target knights) and/or position
    if (ability.type == Ability.AbilityType.OFFENSIVE) {
      // Check if ability has collided with a wall
      var projectiles = [];
      // Multiple projectiles
      if (ability.numProjectiles > 1) {
        for (var i = 0; i < ability.numProjectiles; i++) {
          if (i > ability.numProjectiles / 2) {
            projectiles.push(Vec2.setLength({x: target.x + i, y: target.y + i}, ability.range + character.rangeModifier));
          }
          else if (i < ability.numProjectiles / 2) {
            projectiles.push(Vec2.setLength({x: target.x - i, y: target.y - i}, ability.range + character.rangeModifier));
          }
          else {
            projectiles.push(Vec2.setLength({x: target.x, y: target.y}, ability.range + character.rangeModifier));
          }
        }
      }
      else {
        projectiles.push(Vec2.setLength({x: target.x, y: target.y}, ability.range + character.rangeModifier));
      }
      projectiles.forEach(function (projectile) {
        // Check if the ability hits a wall (if its ranged)
        var collisionPoints = [];
        var prevLocation = location.characters[character.id].location;
        if (ability.numProjectiles > 1) {
          for (var i = 0; i < location.map.geom.length; i++) {
            var p = location.map.geom[i];
            if (Vec2.wallCollision(prevLocation, projectile, p)) {
              // Collision occurred
              collisionPoints.push(p);
            }
          }
        }
        // Check for target hits
        var hitTargets = [];
        for (var j = 0; j < location.character.length; j++) {
          var charLocation = location.character[j].location;
          if (Vec2.pointCollision(prevLocation, charLocation, projectile)) {
            // Collision occurred
            hitTargets.push(location.character[j]);
          }
        }
        // Check if any targets have been hit
        if (hitTargets.length < 1) {
          return;
        }
        // Check whether target it wall or target first
        var hitTarget = [];
        for (i = 0; i < hitTargets.length; i++) {
          for (j = 0; j < collisionPoints.length; i++) {
            if (collisionPoints[j].distanceTo(prevLocation) < hitTargets[i].location.distanceTo(prevLocation)) {
              if (hitTarget.indexOf(hitTargets[i]) == -1) {
                hitTarget.push(hitTargets[i]);
              }
            }
          }
          if (collisionPoints.length == 0) {
            hitTarget.push(hitTargets[i]);
          }
        }
        if (hitTarget.length > 0) {
          // Make sure target isnt a friendly
          for (var i = 0; i < hitTarget.length; i++) {
            if (hitTarget[i].character.type == "knight") {
              hitTarget.splice(i, 1);
            }
          }
        }
        // Only use one hitTarget if its not piercing
        if (!ability.piercing && hitTarget.length > 0) {
          // Only one target
          hitTarget.splice(1, 100);
        }
        // Apply offensive loop for hit targets
        for (i = 0; i < hitTarget.length; i++) {
          var hitCharacter;
          characters.forEach(function(character) {
            if (character.id == hitTarget[i].id && character.type != "knight") {
              hitCharacter = character;
            }
          });
          // Continue if no characters are found
          if (!hitCharacter) {
            continue;
          }
          // Damage
          if (ability.hasOwnProperty("damage")) {
            // Calculate range for range damage modifier
            var totalRange = location.characters[location.characterIndex.indexOf(character.id)].location.distanceTo(
              hitTarget[i].location);
            // Check if ability should ignore armor
            var totalDamage = ability.damage * weapon.damage * ability.damageModifier + (this.rangeDamageModifier * totalRange);
            if (!ability.ignoreArmor) {
              totalDamage -= hitCharacter.blockArmor;
            }
            // Damage taken by must be at least 1 and most 18000
            hitCharacter.hp -= Math.max(1, Math.min(totalDamage, 18000));
          }
          // Bleed
          if (ability.hasOwnProperty("bleed") && ability.bleed > 1) {
            var curDuration = ability.duration;
            // Bleed every second for bleed amount
            while (curDuration > 0) {
              setTimeout(function () {
                target.hp -= ability.bleed;
              }, 1000);
              curDuration -= 1;
            }
          }
          // Stun
          if (ability.hasOwnProperty("stun") && ability.stun > 0) {
            hitCharacter.stunned = true;
            setTimeout (function() {
              // Check if stunned again
              if (hitCharacter.stunCount > 1) {
                hitCharacter.stunCount -= 1;
              }
              else {
                hitCharacter.stunned = false;
              }
            }, ability.stun * 1000);
          }
          // Decrease Range
          if (ability.hasOwnProperty("decreaseRange")) {
            hitCharacter.rangeModifier -= ability.decreaseRange;
            setTimeout(function() {
              hitCharacter.rangeModifier += ability.decreaseRange;
            }, ability.duration * 1000);
          }
        }
      });
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
        var characterLocation = location.characters[character.id].location;
        var newLocation = characterLocation.add(Vec2.setLength({x: target.x, y: target.y}, ability.moveDistance));
        // Update new location
        location.characters[location.characterIndex.indexOf(character.id)].location = newLocation;
        location.charactersToUpdate[location.charactersToUpdateIndex.indexOf(character.id)].location = newLocation;
      }
      // Increase Range
      if (ability.hasOwnProperty("increaseRange")) {
        target.rangeModifier -= ability.increaseRange;
        setTimeout(function() {
          target.rangeModifier += ability.increaseRange;
        }, ability.duration * 1000);
      }
    }
    // Set the new cooldown
    ability.curCoolDown = new Date().getTime();
  }, ability.castTime * 1000);
  Ability.EmitFinish(character.id, ability.id, roomID, io);
};

Ability.AttackSpeeds = {
  ExtremelyFast: 100,
  VeryFast: 300,
  Fast: 600,
  Medium: 1000,
  Slow: 2000,
  VerySlow: 3000,
  ExtremelySlow: 5000
};

Ability.EmitUse = function(characterID, abilityID, roomID, io) {
  io.to(roomID).emit(Event.input.knight.ABILITY_START, {"i":characterID, "a":abilityID});
};

Ability.EmitFinish = function(characterID, abilityID, roomID, io) {
  io.to(roomID).emit(Event.input.knight.ABILITY_END, {"i":characterID, "a":abilityID});
};

module.exports = Ability;