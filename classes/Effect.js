/**
 * Classes for Ability/Item Effects
 */

var Event = require('./EventEnum');

var Effect = function (data) {
	this.io = data.io;
	this.matchID = data.game_uuid;
	// Damage effects are based off receivers level

	this.Purge = function (character, item) {
		// Stop all current effects
		for (var i = 0; i < character.effects.length; i++) {
			clearInterval(character.effects[i].Interval);
		}
		// Reset effect array to nothing
		character.effects = [];

		var data = {e: Effect.EffectTypes.Purge, i: item.id, c: character.id};
		this.io.to(this.matchID).emit(Event.output.EFFECT, data);
	};

	this.Heal = function (character, item) {
		character.hp = Math.min(Math.min(character.maxhp, character.hp + item.value), character.maxhp);
		var data = {e: Effect.EffectTypes.Heal, i: item.id, c: character.id};
		this.io.to(this.matchID).emit(Event.output.EFFECT, data);
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
		var data = {e: Effect.EffectTypes.Regeneration, d: item.duration, i: item.id, c: character.id};
		this.io.to(this.matchID).emit(Event.output.EFFECT, data);
	};

	this.Bleed = function (character) {
		// Purge existing bleeds in order to refresh duration and stack damage
		var stack = 1;
		for (var n = 0; n < character.effects.length; n++) {
			if (character.effects[n].Effect == Effect.EffectTypes.Bleed && character.effects[n].Active) {
				stack = stack + 1;
				character.effects[n].Active = false;
				clearTimeout(character.effects[n].Timeout);
			}
			else if (character.effects[n].Effect == Effect.EffectTypes.Bleed_Instance && character.effects[n].Active) {
				character.effects[n].Active = false;
				clearTimeout(character.effects[n].Timeout);
			}
		}

		for (var n = 1; n <= stack; n++) {
			for (var i = 1; i <= 3; i++) {
				var effect = {Effect: Effect.EffectTypes.Bleed_Instance, Active: true, Timeout: null};
				character.effects.push(effect);
				var interval = setTimeout(function (effect) {
					character.hp -= 1;
					effect.Active = false;
				}, 1000 * i, effect);
				effect.Timeout = interval;

				if (i == 3) {
					var effect = {Effect: Effect.EffectTypes.Bleed, Active: true, Timeout: null};
					character.effects.push(effect);
					var interval = setTimeout(function (effect) {
						effect.Active = false;
					}, 3000, effect);
					effect.Timeout = interval;
				}
			}
		}

		var data = {e: Effect.EffectTypes.Bleed, d: 3000, s: stack, c: character.id};
		this.io.to(this.matchID).emit(Event.output.EFFECT, data);
	};

	this.Burn = function (character) {
		var damageModifier = 1;
		// Purge existing burns in order to refresh duration
		for (var n = 0; n < character.effects.length; n++) {
			if (character.effects[n].Effect == Effect.EffectTypes.Burn && character.effects[n].Active) {
				character.effects[n].Active = false;
				clearTimeout(character.effects[n].Timeout);
			}
			// Check if Wrath of Fire Miasma is active
			if (character.effects[n].Effect == Effect.EffectTypes.Wrath_Of_Fire_Miasma && character.effects[n].Active) {
				damageModifier *= 2;
			}
		}

		for (var i = 1; i <= 2; i++) {
			var effect = {Effect: Effect.EffectTypes.Burn, Active: true, Timeout: null};
			character.effects.push(effect);
			var interval = setTimeout(function (effect) {
				character.hp -= 20 * damageModifier;
				effect.Active = false;
			}, 1000 * i, effect);
			effect.Timeout = interval;
		}

		var data = {e: Effect.EffectTypes.Burn, c: character.id};
		this.io.to(this.matchID).emit(Event.output.EFFECT, data);
	};

	this.WrathOfFireMiasma = function (character) {
		// Purge existing wraths in order to refresh duration
		for (var n = 0; n < character.effects.length; n++) {
			if (character.effects[n].Effect == Effect.EffectTypes.Burn && character.effects[n].Active) {
				character.effects[n].Active = false;
				clearTimeout(character.effects[n].Timeout);
			}
		}

		var effect = {Effect: Effect.EffectTypes.Wrath_Of_Fire_Miasma, Active: true, Timeout: null};
		character.effects.push(effect);
		var interval = setTimeout(function (effect) {
			effect.Active = false;
		}, 5000, effect);
		effect.Timeout = interval;
	};

	this.Stun = function (character, seconds) {
		var effect = {Effect: Effect.EffectTypes.Stun, Active: true, Timeout: null};
		var interval = setTimeout(function (effect) {
			effect.Active = false;
		}, 1000 * seconds, effect);
		effect.Timeout = interval;
		character.effects.push(effect);

		var data = {e: Effect.EffectTypes.Stun, d: 1000 * seconds, c: character.id};
		this.io.to(this.matchID).emit(Event.output.EFFECT, data);
	};
};

Effect.EffectTypes = {
	Regeneration: "Regen",
	Heal: "Heal",
	Burn: "Burn",
	Bleed: "Bleed",
	Bleed_Instance: "I_Bleed",
	Stun: "Stun",
	Purge: "Purge",
	Wrath_Of_Fire_Miasma: "WrathOfFireMiasma"
};

module.exports = Effect;