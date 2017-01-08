/* 
 Model class for characters.
 */

var Effects = require('./Effect');

// constructor
var Character = function (id, owner, type, entity, level) {
	this.id = id;
	this.owner = owner; // player
	this.level = level;
	this.type = type; // creature, miniboss, boss, trap or knight
	this.entity = entity; // the characters entity (eg first trap is entity 1 if type trap is picked)
	this.speed = 6; // the speed at which character moves at (6 by default)

	if (entity == 0 || entity == 1) {
		this.hp = 100 * level; // 100 base for knights
	}
	else {
		this.hp = 100; // 100 by default
	}
	this.prevhp = this.hp; // previous hp before update
	this.maxhp = this.hp; // maximum hp

	this.blockArmor = 0; // any extra armor given by a block
	this.stunCount = 0; // number of stuns on character
	this.position = null;
	this.rotation = null;
	this.prevPosition = null;
	this.effects = [];
	this.channelling = false;
	this.rangeModifier = 0; // number to increase or decrease range by
};

Character.prototype = {
	stunned: function () {
		this.dead() || this.effects.some(function (effect) {
			if (effect.Effect == Effects.EffectTypes.Stun) {
				if (effect.Active) {
					return true;
				}
			}
			return false;
		});
	},
	dead: function () {
		return this.hp <= 0;
	}
};

module.exports = Character;