/*
 Model class for inventories.
 */
var Item = require('./Item');
var Armor = require('./Armor');

var Inventory = function () {
	this.slots = {};

	this.getFreeSpace = function () {
		var count = 0;
		this.slots.forEach(function (slot) {
			if (slot.number > -1) {
				count++;
			}
		});
		return Inventory.getMaxSpace - count;
	};

	// TODO : create appropriate classes for stuff
	this.weapons = [null, null];
	
	var armorType = Armor.ArmorTypes.Unarmored;
	this.armor = function() {
		return armorType;
	};
	this.setArmor = function (itemID) {
		switch (itemID) {
			case 1800:
				armorType = Armor.ArmorTypes.Unarmored;
				break;
			case 1801:
				armorType = Armor.ArmorTypes.Light_Armor;
				break;
			case 1802:
				armorType = Armor.ArmorTypes.Medium_Armor;
				break;
			case 1803:
				armorType = Armor.ArmorTypes.Heavy_Armor;
				break;
		}
	}
	
	this.ammo = null;
	this.abilities = null;
};

Inventory.prototype.getMaxSpace = function () {
	return 24;
};

Inventory.prototype.getMaxStackSize = function (isThrowing) {
	if (isThrowing) {
		return 200;
	} else {
		return 1;
	}
};

module.exports = Inventory;