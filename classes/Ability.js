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
  ability.numAttacks = abilityInfo.multiple_attacks;
  ability.ignoreArmor = abilityInfo.ignore_armor;
  ability.bleed = abilityInfo.bleed;
  ability.stun = abilityInfo.stun;
  ability.rangeModifier = abilityInfo.range_modifier;

  for (var abilityProperty in ability) {
    if (ability.hasOwnProperty("abilityProperty")) {
      if (ability[abilityProperty].toString().toLowerCase() == "null") {
        ability[abilityProperty] = undefined;
      }
    }
  }
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

Ability.prototype.UseKnightAbility = function (data) {
  var ability = this;
  var weapon = data.weapon;
  var character = data.character;
  var target = data.target;
  var location = data.location;
  var characters = data.characters;
  var roomID = data.game_uuid;
  var io = data.io;
  weapon = Ability.GetWeaponInfo(weapon);
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
  if (!target.hasOwnProperty("x") || !target.hasOwnProperty("y")) {
    return;
  }
  if (character.channelling != false) {
    if (character.channelling == true) {
      character.channelling = "a";
    }
    else {
      character.channelling += "a";
    }
    character.channellingAbility.CheckInterruption();
  }
  // Make it so that the weapon can't be used while casting
  weapon.busy = true;
  // Emit the use of the ability
  Ability.EmitKnightUse(character.id, ability.id, roomID, io);
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
      // Projectile array
      var projectiles = [];
      // The location of the character who cast
      var prevLocation = location.characters[location.characterIndex.indexOf(character.id)].location;
      // Multiple projectiles
      if (ability.numProjectiles > 1) {
        for (var i = 0; i < ability.numProjectiles; i++) {
          if (i > ability.numProjectiles / 2) {
            projectiles.push(Vec2.add(Vec2.setLength({x: target.x + i, y: target.y + i}, ability.range + character.rangeModifier)), prevLocation);
          }
          else if (i < ability.numProjectiles / 2) {
            projectiles.push(Vec2.add(Vec2.setLength({x: target.x - i, y: target.y - i}, ability.range + character.rangeModifier)), prevLocation);
          }
          else {
            projectiles.push(Vec2.add(Vec2.setLength({x: target.x, y: target.y}, ability.range + character.rangeModifier)), prevLocation);
          }
        }
      }
      else {
        projectiles.push(Vec2.add(Vec2.setLength({x: target.x, y: target.y}, ability.range + character.rangeModifier)), prevLocation);
      }
      projectiles.forEach(function (projectile) {
        // Check if the ability hits a wall (if its ranged)
        var collisionPoints = [];
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
          for (i = 0; i < hitTarget.length; i++) {
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
            var totalDamage = ability.damage + weapon.damage * ability.damageModifier + (this.rangeDamageModifier * totalRange);
            // Check if ability should ignore armor
            if (!ability.ignoreArmor) {
              totalDamage -= hitCharacter.blockArmor;
            }
            // Damage taken by must be at least 1 and most 18000
            hitCharacter.hp -= Math.max(1, Math.min(totalDamage, 18000));
            if (hitCharacter.channelling) {
              if (hitCharacter.channelling != false) {
                if (hitCharacter.channelling == true) {
                  hitCharacter.channelling = "d";
                }
                else {
                  hitCharacter.channelling += "d";
                }
                hitCharacter.channellingAbility.CheckInterruption();
              }
            }
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
            hitCharacter.stunCount = hitCharacter.stunCount + 1;
            if (hitCharacter.channelling) {
              if (hitCharacter.channelling != false) {
                if (hitCharacter.channelling == true) {
                  hitCharacter.channelling = "s";
                } else {
                  hitCharacter.channelling += "s";
                }
                hitCharacter.channellingAbility.CheckInterruption();
              }
            }
            setTimeout (function() {
              hitCharacter.stunCount -= 1;
            }, ability.stun * 1000);
          }
          // Decrease Range
          if (ability.hasOwnProperty("decreaseRange")) {
            hitCharacter.rangeModifier -= ability.rangeModifier;
            setTimeout(function() {
              hitCharacter.rangeModifier += ability.rangeModifier;
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
        if (location.characterIndex.indexOf(character.id) > 0) {
          location.characters[location.characterIndex.indexOf(character.id)].location = newLocation;
        }
        if (location.charactersToUpdateIndex.indexOf(character.id)> 0) {
          location.charactersToUpdate[location.charactersToUpdateIndex.indexOf(character.id)].location = newLocation;
        }
      }
      // Increase Range
      if (ability.hasOwnProperty("increaseRange")) {
        target.rangeModifier -= ability.rangeModifier;
        setTimeout(function() {
          target.rangeModifier += ability.rangeModifier;
        }, ability.duration * 1000);
      }
    }
    // Check if channeling has been interrupted
    if (character.channelItem != null) {
      character.channelItem.CheckInterruption(data);
    }
    // Set the new cooldown
    ability.curCoolDown = new Date().getTime();
  }, ability.castTime * 1000);
  Ability.EmitKnightFinish(character.id, ability.id, roomID, io);
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

Ability.EmitKnightUse = function(characterID, abilityID, roomID, io) {
  io.to(roomID).emit(Event.input.knight.ABILITY_START, {"i":characterID, "a":abilityID});
};

Ability.EmitKnightFinish = function(characterID, abilityID, roomID, io) {
  io.to(roomID).emit(Event.input.knight.ABILITY_END, {"i":characterID, "a":abilityID});
};

Ability.EmitBossUse = function(characterID, abilityID, roomID, io) {
  io.to(roomID).emit(Event.input.boss.ABILITY_START, {"i":characterID, "a":abilityID});
};

Ability.EmitBossFinish = function(characterID, abilityID, roomID, io) {
  io.to(roomID).emit(Event.input.boss.ABILITY_END, {"i":characterID, "a":abilityID});
};

module.exports = Ability;