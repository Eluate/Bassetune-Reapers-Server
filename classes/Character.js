/* 
 Model class for characters.
 */

var Effects = require('./Effect');

// constructor
var Character = function (id, owner, type, entity) {
	this.id = id;
	this.owner = owner; // player
	this.type = type; // creature, miniboss, boss, trap or knight
	this.entity = entity; // the characters entity (eg first trap is entity 1 if type trap is picked)
	
	if (this.knight) {
		//this.knight.inventory.armor.moveSpeed;
		this.speed = 2;
	} else {
		this.speed = 2;
	}

	if (entity == 0 || entity == 1) {
		this.hp = 5000; // 5000 base for knights
	}
	else {
		this.hp = 100; // 100 by default
	}
	this.prevhp = this.hp; // previous hp before update
	this.maxhp = this.hp; // maximum hp

	this.blockArmor = 0; // any extra armor given by a block
	this.blockArmorPercent = 0; // multiplied by damage to give armor as percentage of damage
	this.position = {x: 0, y: 0};
	this.rotation = {x: 0, y: 0};
	this.prevPosition = null;
	this.effects = [];
	this.channelling = false;
	this.rangeModifier = 0; // number to increase or decrease range by
};

Character.prototype = {
	stunned: function () {
		this.dead() || this.effects.some(function (effect) {
			if (effect.Effect == Effects.EffectTypes.Stun || effect.Effect == Effects.EffectTypes.Freeze ||
				effect.Effect == Effects.EffectTypes.Stagger || effect.Effect == Effects.EffectTypes.Half_Stagger) {
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