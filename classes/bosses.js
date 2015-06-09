/*
 Bosses data
 */
var ABILITY = require('./Ability');
var Vec2 = require('./Vector2');
var Character = require('./Character');

var Bosses = function() {
  var TheSavageTillBeast = function (level) {
    this.character = new Character();
    this.character.hp = 620 * level;
    this.base_damage = 18 * level;
    this.character.armor = 5 * level;
    this.busy = false;
    this.base_range = 2;
    this.curCoolDowns = [0, 0, 0 , 0, 0];

    // Left-Click Attack
    this.ability1 = function (target, characters) {
      if (this.busy) {
        return;
      }
      this.busy = true;
      setTimeout(function() {
        // Return if stunned
        if (this.character.stunned) {
          return;
        }
        // Allow the weapon to be used again
        this.busy = false;
        var projectiles = [];
        projectiles.push(Vec2.setLength({x: target.x, y: target.y}, this.base_range + this.character.rangeModifier));
        projectiles.forEach(function (projectile) {
          // Check if the ability hits a wall (if its ranged)
          var collisionPoints = [];
          var prevLocation = location.characters[this.character.id].location;
          for (var i = 0; i < location.map.geom.length; i++) {
            var p = location.map.geom[i];
            if (Vec2.wallCollision(prevLocation, projectile, p)) {
              // Collision occurred
              collisionPoints.push(p);
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
          // Only use one target
          hitTarget.splice(1, 100);
          // Apply offensive loop for hit targets
          for (i = 0; i < hitTarget.length; i++) {
            var hitCharacter;
            characters.forEach(function(character) {
              if (character.id == hitTarget[i].id && character.type == "knight") {
                hitCharacter = character;
              }
            });
            // Continue if no characters are found
            if (!hitCharacter) {
              continue;
            }
            // Damage
            if (this.base_damage) {
              var totalDamage = this.base_damage - hitTarget.blockArmor;
              // Damage taken by must be at least 1 and most 18000
              hitCharacter.hp -= Math.max(1, Math.min(totalDamage, 18000));
            }
          }
        });
      }, ABILITY.AttackSpeeds.Slow);
    };
    // Right-Click Block
    this.ability2 = function (toggle) {
      if (!toggle) {
        this.character.blockArmor -= 10000;
      } else {
        this.character.blockArmor += 10000;
      }
    };
  };
  var BeholderOfTheUniversalSun = function(level) {

  };
  var BassetuneChampion = function(level) {

  };
  var BreatherOfLife = function(level) {

  };
  var SaghericNentileFiend = function() {

  };
  var CorruptedKnight = function() {

  };
  var BeyewsSummoner = function() {

  };
  var AyapakunArcher = function() {

  };
  var AyapakunWarrior = function() {

  };
  var GohIncarnate = function() {

  };
};

exports.output = Bosses;