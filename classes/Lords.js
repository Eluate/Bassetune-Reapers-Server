/*
 Lords data
 */
var Ability = require('./Ability');
var Vector2 = require('./Vector2');

var Bosses = [];

var TheSavageTillBeast = function () {
	this.hp = 620;
	this.base_damage = 18;
	this.armor = 5;
	this.busy = false;
	this.base_range = 2;
	this.curCoolDowns = [0, 0, 0, 0, 0];
	this.blocking = false;
	this.speed = 3;

	// Left-Click Attack
	this.ability1 = function (data) {
		var character = data.character;
		if (data.hasOwnProperty("target") && data.hasOwnProperty("characters")) {
			var target = data.target;
			var characters = data.characters;
		}
		else {
			return;
		}
		if (this.busy) {
			return;
		}
		if (!target.hasOwnProperty("x") || !target.hasOwnProperty("y")) {
			return;
		}
		this.busy = true;
		Ability.EmitBossUse(character.id, data.slotID, data.matchID, data.io);
		setTimeout(function () {
			// Return if stunned
			if (character.stunned) {
				return;
			}
			// Allow the weapon to be used again
			this.busy = false;
			var projectiles = [];
			projectiles.push(Vector2.setLength({x: target.x, y: target.y}, this.base_range + character.rangeModifier));
			projectiles.forEach(function (projectile) {
				// Check if the ability hits a wall (if its ranged)
				var collisionPoints = [];
				var prevLocation = location.characters[location.characterIndex.indexOf(character.id)].position;
				for (var i = 0; i < location.map.geom.length; i++) {
					var p = location.map.geom[i];
					if (Vector2.wallCollision(prevLocation, projectile, p)) {
						// Collision occurred
						collisionPoints.push(p);
					}
				}
				// Check for target hits
				var hitTargets = [];
				for (var j = 0; j < location.character.length; j++) {
					var charLocation = location.character[j].position;
					if (Vector2.pointCollision(prevLocation, charLocation, projectile)) {
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
					characters.forEach(function (character) {
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
		}, Ability.AttackSpeeds.Slow);
		Ability.EmitBossFinish(character.id, data.slotID, data.matchID, data.io);
	};
	// Right-Click Block
	this.ability2 = function (data) {
		var character = data.character;
		if (data.toggle == null) {
			return;
		}
		if (data.toggle.toString() != "true" && this.blocking != false) {
			this.character.blockArmor -= 10000;
			this.blocking = false;
			Ability.EmitBossFinish(character.id, data.slotID, data.matchID, data.io);
		} else {
			this.character.blockArmor += 10000;
			this.blocking = true;
			Ability.EmitBossUse(character.id, data.slotID, data.matchID, data.io);
		}
	};
	// Store all abilities
	this.abilities = [this.ability1, this.ability2];
};

var BeholderOfTheUniversalSun = function () {

};

var BassetuneChampion = function () {

};

var BreatherOfLife = function () {

};

var SaghericNentileFiend = function () {

};

var CorruptedKnight = function () {

};

var BeyewsSummoner = function () {

};

var AyapakunArcher = function () {

};

var AyapakunWarrior = function () {

};

var GohIncarnate = function () {

};

Bosses.push(TheSavageTillBeast);
Bosses.push(BeholderOfTheUniversalSun);
Bosses.push(BreatherOfLife);
Bosses.push(SaghericNentileFiend);
Bosses.push(CorruptedKnight);
Bosses.push(BeyewsSummoner);
Bosses.push(AyapakunArcher);
Bosses.push(AyapakunWarrior);
Bosses.push(GohIncarnate);

module.exports.Bosses = Bosses;