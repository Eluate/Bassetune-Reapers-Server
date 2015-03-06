var Character = require('./Character');

/*
	Model class for knights. Inheritance from Character.
*/

var Knight = function(location, owner, inventory) {
	Character.call(this, location, owner);
	this.inventory = inventory;
};

Knight.prototype = Object.create(Character.prototype, {
	
	useWeapon: function(weapon, target) {
		// TODO
	},
	
	useAbility: function(ability, target) {
		// TODO
	},
	
	useItem: function(item, target) {
		// TODO
	}
	
});