/**
 * Classes for Ability/Item Effects
 */

var Event = require('./EventEnum');

var Effect = function (data) {
	this.io = data.io;
	this.matchID = data.game_uuid;
	// Damage effects are based off receivers level

	this.Purge = function (character) {
		// Stop all current effects
		for (var i = 0; i < character.effects.length; i++) {
			clearInterval(character.effects[i].Interval);
		}
		// Reset effect array to nothing
		character.effects = [];
	};

	this.Regeneration = function (character, item) {
		for (var i = 1; i <= item.duration; i++) {
			var interval = setTimeout(function () {
				console.log("Regeneration from " + character.hp + " to " +
					Math.min(Math.min(character.maxhp, character.hp + (item.value / item.duration)), character.maxhp) + ".");
				character.hp = Math.min(Math.min(character.maxhp, character.hp + (item.value / item.duration)), character.maxhp);
			}, 1000 * i);
			character.effects.push({Effect: Effect.EffectTypes.Regeneration, Interval: interval});
		}
		var data = {e: Effect.EffectTypes.Regeneration, d: item.duration, i: item.id};
		this.io.to(this.matchID).emit(Event.output.Effect, data);
	};

	this.Bleed = function (character) {
		// Purge existing bleeds in order to refresh duration and stack damage
		var stack = 1;
		for (var n = 0; n < character.effects.length; n++) {
			if (character.effects[n].Effect == Effect.EffectTypes.Bleed) {
				stack = stack + 1;
				clearTimeout(character.effects[n]);
				for (var i = 1; i <= 3; i++) {
					var interval = setTimeout(function () {
						character.hp -= 1 * character.level;
					}, 1000 * i);
					character.effects.push({Effect: Effect.EffectTypes.Bleed, Timeout: interval});
				}
			}
		}

		for (var i = 1; i <= 3; i++) {
			var interval = setTimeout(function () {
				character.hp -= 1 * character.level;
			}, 1000 * i);
			character.effects.push({Effect: Effect.EffectTypes.Bleed, Timeout: interval});
		}

		var data = {e: Effect.EffectTypes.Bleed, d: 3000, s: stack};
		this.io.to(this.matchID).emit(Event.output.Effect, {"d": data});
	};

	this.Burn = function (character) {
		// Purge existing bleeds in order to refresh duration
		for (var n = 0; n < character.effects.length; n++) {
			if (character.effects[n].Effect == Effect.EffectTypes.Burn) {
				clearTimeout(character.effects[n]);
			}
		}

		for (var i = 1; i <= 2; i++) {
			var interval = setTimeout(function () {
				character.hp -= 5 * character.level;
			}, 1000 * i);
			character.effects.push({Effect: Effect.EffectTypes.Burn, Timeout: interval});
		}

		var data = {e: Effect.EffectTypes.Burn, d: 2000};
		this.io.to(this.matchID).emit(Event.output.Effect, {"d": data});
	};

	this.Stun = function (character, seconds) {
		var effect = {Effect: Effect.EffectTypes.Stun, Active: true}
		var interval = setTimeout(function () {
			effect.Active = false;
		}, 1000 * seconds);
		effect.Timeout = interval;
		character.effects.push(effect);

		var data = {e: Effect.EffectTypes.Stun, d: 1000 * seconds};
		this.io.to(this.matchID).emit(Event.output.Effect, {"d": data});
	};
};

Effect.EffectTypes = {
	IncreasedRange: "I_Range",
	DecreasedRange: "D_Range",
	Regeneration: "Regen",
	Burn: "Burn",
	Bleed: "Bleed",
	Stun: "Stun"
};

module.exports = Effect;