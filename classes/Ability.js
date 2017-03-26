/*
 Class for the abilities and weapon usage
 */
var Vec2 = require("./Vector2");
var Event = require('./EventEnum');

var Melee = ["axe, sword, dagger, knife, twohandedsword"]; // Add more later
var Ranged = ["bow"]; // Add more later

var Ability = function (abilityInfo) {
	// Set ability info
	this.id = abilityInfo.item_id;
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

	// The current cooldown
	this.curCoolDown = 0;
};

Ability.prototype.UseKnightAbility = function (data) {
	// Assign variables from data
	var ability = this,
		character = data.character,
		location = data.location,
		characters = data.characters,
		roomID = data.game_uuid,
		target = data.target,
		io = data.io;

	console.log(target);

	// Select mainhand or offhand weapon
	var weapon = null;
	if (data.weapon == 1) {
		weapon = character.knight.inventory.weapons[1];
	} else {
		weapon = character.knight.inventory.weapons[0];
	}
	if (weapon == null) {
		return;
	}

	// Retrieve weapon data
	weapon = Ability.GetWeaponInfo(weapon[0]);
	if (!weapon) return;
	console.log(weapon);
	console.log(this);

	// Skip if already channelling same ability and weapon
	if (character.channelling == {"ability": ability, "weapon": weapon}) return;

	// Check if weapon matches the required weapon
	if ((weapon.type == "melee" && !Melee.some(function (weaponElement) {
			return weaponElement == weapon.type;
		})) && (weapon.type == "ranged" && !Ranged.some(function (weaponElement) {
			return weaponElement == weapon.type;
		})) && ability.reqType != weapon.type && ability.reqType != null) {
		return;
	}
	console.log("Meets required type");
	// Check is cooldown has finished
	if (new Date().getTime() - ability.curCoolDown < ability.coolDown * 1000) {
		return;
	}
	console.log("Not on cooldown.");
	// Emit the use of the ability
	Ability.EmitKnightUse(character.id, ability.id, target, roomID, io);
	character.channelling = {"ability": ability, "weapon": weapon};
	// Wait until the cast time is up
	setTimeout(function () {
		// Return if stunned or overridden
		if (character.stunned()) return;
		if (character.channelling != {"ability": ability, "weapon": weapon}) return;

		// For offence, target is a position
		if (ability.type == Ability.AbilityType.OFFENSIVE) {
			// Projectile array
			var projectiles = [];
			// The location of the character who cast
			var prevPosition = character.position;
			// Set target as direction
			target = Vec2.sub(target, prevPosition);
			// Multiple projectiles
			if (ability.numProjectiles > 1) {
				for (var i = 0; i < ability.numProjectiles; i++) {
					if (i > ability.numProjectiles / 2) {
						projectiles.push(Vec2.add(Vec2.setLength({
							x: target.x + i,
							y: target.y + i
						}, ability.range + character.rangeModifier), prevPosition));
					}
					else if (i < ability.numProjectiles / 2) {
						projectiles.push(Vec2.add(Vec2.setLength({
							x: target.x - i,
							y: target.y - i
						}, ability.range + character.rangeModifier), prevPosition));
					}
					else {
						projectiles.push(Vec2.add(Vec2.setLength(target, ability.range + character.rangeModifier), prevPosition));
					}
				}
			}
			else {
				projectiles.push(Vec2.add(Vec2.setLength({
					x: target.x,
					y: target.y
				}, ability.range + character.rangeModifier), prevPosition));
			}
			// Check for target hits
			projectiles.forEach(function (projectile) {
				var hitTargets = [];
				// Check if the ability hits a wall (if its ranged)
				var collisionPoints = [];

				for (var i = 0; i < location.map.grid.length; i++) {
					for (var j = 0; j < location.map.grid[0].length; j++) {
						var wall = {
							x1: i - 0.5, x2: i + 0.5,
							y1: j - 0.5, y2: j + 0.5
						};
						if (Vec2.wallCollision(prevPosition, projectile, wall)) {
							// Collision occurred
							collisionPoints.push(wall);
						}
					}
				}

				for (var j = 0; j < location.characters.length; j++) {
					if (Vec2.pointCollision(prevPosition, projectile, location.characters[j].position)) {
						// Collision occurred
						hitTargets.push(location.characters[j]);
					}
				}

				// Check if any targets have been hit
				if (hitTargets.length < 1) {
					return;
				}

				// Remove dead characters from selection
				for (i = 0; i < hitTargets.length; i++) {
					if (hitTargets[i].dead()) {
						hitTargets.splice(i, 1);
						i -= 1;
					}
				}

				// Remove allied characters from selection
				for (i = 0; i < hitTargets.length; i++) {
					if (hitTargets[i].type == "knight") {
						hitTargets.splice(i, 1);
						i -= 1;
					}
				}

				// Check whether target hit wall or target first
				for (var j = 0; j < collisionPoints.length; j++) {
					for (var i = 0; i < hitTargets.length; i++) {
						if (Vec2.distanceTo({x: collisionPoints[j].x1 + 0.5, y: collisionPoints[j].y1 + 0.5}, prevPosition) < Vec2.distanceTo(hitTargets[i].position, prevPosition)) {
							hitTargets.splice(i, 1);
							i -= 1;
						}
					}
				}

				// Only use one hitTarget if its not piercing
				if (!ability.piercing && hitTargets.length > 0) {
					// TODO: Select the one closest to the character
					// Only one target
					hitTargets.splice(1, hitTargets.length);
				}

				// Apply offensive loop for hit targets
				for (i = 0; i < hitTargets.length; i++) {
					var hitCharacter = 0;
					characters.forEach(function (character) {
						if (character.id == hitTargets[i].id && character.type != "knight") {
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
						var totalRange = Vec2.distanceTo(character.position, hitCharacter.position);
						var totalDamage = ability.damage + weapon.damage * ability.damageModifier + (ability.rangeDamageModifier * totalRange);
						console.log(totalDamage);
						console.log(ability.damage);
						console.log(weapon.damage);
						console.log(ability.damageModifier);
						console.log(ability.rangeDamageModifier);
						console.log(totalRange);
						// Check if ability should ignore armor
						if (!ability.ignoreArmor) {
							totalDamage -= hitCharacter.blockArmor;
						}
						// Damage taken by must be at least 1 and most 18000
						console.log(totalDamage);
						hitCharacter.hp -= Math.max(1, Math.min(totalDamage, 18000));
						console.log(hitCharacter);
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
						setTimeout(function () {
							hitCharacter.stunCount -= 1;
						}, ability.stun * 1000);
					}
					// Decrease Range
					if (ability.hasOwnProperty("decreaseRange")) {
						hitCharacter.rangeModifier -= ability.rangeModifier;
						setTimeout(function () {
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
				setTimeout(function () {
					target.blockArmor -= ability.armor;
				}, this.duration * 1000);
			}
			// Dodge
			if (ability.hasOwnProperty("moveDistance") && target.hasOwnProperty("x") && target.hasOwnProperty("y")) {
				var characterLocation = character.position;
				var newLocation = characterLocation.add(Vec2.setLength({
					x: target.x,
					y: target.y
				}, ability.moveDistance));
				// Update new location
				character.position = newLocation;
			}
			// Increase Range
			if (ability.hasOwnProperty("increaseRange")) {
				target.rangeModifier -= ability.rangeModifier;
				setTimeout(function () {
					target.rangeModifier += ability.rangeModifier;
				}, ability.duration * 1000);
			}
		}
		// Set the new cooldown
		ability.curCoolDown = new Date().getTime();
		// Reset channelled so that same ability/weapon combo can be used again
		character.channelling = false;
	}, ability.castTime * 1000);
	Ability.EmitKnightFinish(character.id, ability.id, roomID, io);
};

Ability.AbilityType = {
	OFFENSIVE: "offensive",
	DEFENSIVE: "defensive"
};

Ability.GetWeaponInfo = function (entityID) {
	var weapons = require('./resources/weapons');

	var weapon = null;
	for (var n = 0; n < weapons.length; n++) {
		if (weapons[n].item_id == entityID) {
			weapon = weapons[n];
		}
	}

	if (weapon == null) return;
	else return {
		type: weapon.weapon_type,
		damage: weapon.damage
	};
};

Ability.Effect = function (abilityID, characterID, positive, type, roomID, io) {
	io.to(roomID).emit(Event.output.EFFECT, {"a": abilityID, "c": characterID, "t": type});
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

Ability.EmitKnightUse = function (characterID, abilityID, target, roomID, io) {
	io.to(roomID).emit(Event.input.knight.ABILITY_START, {"i": characterID, "a": abilityID, "t": target});
};

Ability.EmitKnightFinish = function (characterID, abilityID, roomID, io) {
	io.to(roomID).emit(Event.input.knight.ABILITY_END, {"i": characterID, "a": abilityID});
};

Ability.EmitBossUse = function (characterID, abilityID, roomID, io) {
	io.to(roomID).emit(Event.input.boss.ABILITY_START, {"i": characterID, "a": abilityID});
};

Ability.EmitBossFinish = function (characterID, abilityID, roomID, io) {
	io.to(roomID).emit(Event.input.boss.ABILITY_END, {"i": characterID, "a": abilityID});
};

module.exports = Ability;