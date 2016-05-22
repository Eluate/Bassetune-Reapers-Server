/*
 Class for the abilities and weapon usage
 */
var Vec2 = require("./Vector2");
var Event = require('./EventEnum');

var Melee = ["Axe, Sword, Dagger, Knife"]; // Add more later
var Ranged = ["Bow"]; // Add more later

var Ability = function (entityID) {
  var abilityInfo = require('./resources/abilities')[entityID];
  // Set ability info
  this.id = abilityInfo.id;
  this.reqType = abilityInfo.required_type;
  this.aoeSize = abilityInfo.aoe_size;
  this.range = abilityInfo.range;
  this.coolDown = abilityInfo.cool_down;
  this.castTime = abilityInfo.cast_time;
  this.type = abilityInfo.type;
  this.duration = abilityInfo.duration;
  this.numProjectiles = abilityInfo.projectiles;
  this.skewer = abilityInfo.skewer;
  this.damage = abilityInfo.damage;
  this.armor = abilityInfo.armor;
  this.damageModifier = abilityInfo.damage_modifier;
  this.projSpeed = abilityInfo.projectile_speed;
  this.piercing = abilityInfo.piercing;
  this.rangeDamageModifier = abilityInfo.range_damage_modifier;
  this.moveDistance = abilityInfo.move_distance;
  this.numAttacks = abilityInfo.multiple_attacks;
  this.ignoreArmor = abilityInfo.ignore_armor;
  this.bleed = abilityInfo.bleed;
  this.stun = abilityInfo.stun;
  this.rangeModifier = abilityInfo.range_modifier;
  // Check if any are undefined
  for (var abilityProperty in this) {
    if (this.hasOwnProperty(abilityProperty)) {
      if (this[abilityProperty].toString().toLowerCase() == "null") {
        this[abilityProperty] = undefined;
      }
    }
  }
  // The current cooldown
  this.curCoolDown = 0;
};

Ability.prototype.UseKnightAbility = function (data) {
  // Assign variables from data
  var ability = this,
      weapon = data.weapon,
      character = data.character,
      target = data.target,
      location = data.location,
      characters = data.characters,
      roomID = data.game_uuid,
      io = data.io;
  // Retrieve weapon data
  weapon = Ability.GetWeaponInfo(weapon);
  // Check if weapon matches the required weapon
  if (!Melee.some(function(weapon) {
      return weapon == weapon.type && weapon.type == ability.reqType;
    }) && !Ranged.some(function(weapon) {
      return weapon == weapon.type && weapon.type == ability.reqType;
    }) && ability.reqType != weapon.type && ability.reqType != null ) {
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
      var prevLocation = character.location;
      // Set target as direction
      target = Vec2.sub(target, prevLocation);
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
            projectiles.push(Vec2.add(Vec2.setLength(target, ability.range + character.rangeModifier)), prevLocation);
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
          for (var i = 0; i < location.map.borderedMap.length; i++) {
            var p = location.map.borderedMap[i];
            if (Vec2.wallCollision(prevLocation, projectile, p)) {
              // Collision occurred
              collisionPoints.push(p);
            }
          }
        }
        // Check for target hits
        var hitTargets = [];
        for (var j = 0; j < location.character.length; j++) {
          var charLocation = location.character[j].position;
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
            if (collisionPoints[j].distanceTo(prevLocation) < hitTargets[i].position.distanceTo(prevLocation)) {
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
          var hitCharacter = 0;
          characters.forEach(function(character) {
            if (character.id == hitTarget[i].id && character.type != "knight") {
              hitCharacter = character;
            }
          });
          // Continue if no characters are found
          if (hitCharacter == 0) {
            continue;
          }
          // Damage
          if (ability.hasOwnProperty("damage")) {
            // Calculate range for range damage modifier
            var totalRange = Vec2.distanceTo(character.position, hitTarget[i].position);
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
        var characterLocation = character.position ;
        var newLocation = characterLocation.add(Vec2.setLength({x: target.x, y: target.y}, ability.moveDistance));
        // Update new location
        character.position = newLocation;
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
    if (character.channelling != false) {
      if (character.channelling == true) {
        character.channelling = "a";
      }
      else {
        character.channelling += "a";
      }
      character.channellingAbility.CheckInterruption();
    }
    // Set the new cooldown
    ability.curCoolDown = new Date().getTime();
  }, ability.castTime * 1000);
  Ability.EmitKnightFinish(character.id, ability.id, roomID, io);
};

Ability.AbilityType = {
  OFFENSIVE: "offensive",
  DEFENSIVE: "defensive"
};

Ability.GetWeaponInfo = function (entityID) {
  var weapons = require('./resources/weapons');
  var weapon = weapons[entityID];
  return {
    type: weapon.weapon_type,
    damage: weapon.damage,
    busy: false
  };
};

Ability.Effect = function (abilityID, characterID, positive, type, roomID, io) {
  io.to(roomID).emit(Event.output.EFFECT, {"a":abilityID, "c":characterID, "t":type});
};

Ability.EffectTypes = {
  IncreasedRange: "I_Range",
  DecreasedRange: "D_Range",
  Regeneration: "Regen",
  Bleed: "Bleed",
  Stun: "Stun"
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