/*
	Model class for inventories.
*/

var Inventory = function(weapons, abilities, items) {
	
	// TODO : create appropriate classes for stuff
	this.weapons = weapons;
	this.abilities = abilities;
	this.items = items;
};



Inventory.prototype.getMaxSpace = function() {
	return 15;
};

Inventory.prototype.getFreeSpace = function() {
	var count = getMaxSpace() - (this.weapons.length + this.abilities.length + this.items.length);
	return count;
};

module.exports = Inventory;