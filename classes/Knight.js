/*
 Model class for knights. Inheritance from Character.
 */
var Finder = require('./Finder');
var Inventory = require('./Inventory');
var EventEnum = require('./EventEnum');
var Ability = require('./Ability');
var Item = require('./Item');
var Armor = require('./Armor');

var Knight = function (character) {
	this.character = character;
	this.inventory = new Inventory();
	this.inventory.armor = new Armor();
	this.abilities = [];
};

Knight.prototype.LoadAbilities = function () {
	var abilityFile = require('./resources/abilities');
	for (var i = 0; i < this.inventory.abilities.length; i++) {
		for (var n = 0; n < abilityFile.length; n++) {
			if (abilityFile[n].item_id == this.inventory.abilities[i][0]) {
				this.abilities.push(new Ability(abilityFile[n]));
			}
		}
	}
};

Knight.prototype.ChangeEquipped = function (data, slotID, target) {
	if (this.character.stunned()) return;

	var slots = this.inventory.slots;
	if (target == 0) {
		// Switch slots only
		var item1 = null;
		var item2 = null;
		for (var i = 0, slotLength = slots.length; i < slotLength; i++) {
			if (slots[i][1] == data.slot1) {
				item1 = slots[i];
			}
			if (slots[i][1] == data.slot2) {
				item2 = slots[i];
			}
		}
		if (item1 != null && item2 != null) {
			// Swap slot numbers
			var tempNumber = item2[1];
			item2[1] = item1[1];
			item1[1] = tempNumber;

			data.io.emit(EventEnum.output.knight.END_CHANGE_EQUIPPED, {"a": item1[1], "b": item2[1], "p": this.character.owner});
		}
		return;
	}

	// For setting new armor/weapons/ammo
	for (var i = 0, slotLength = slots.length; i < slotLength; i++) {
		var slot = slots[i];
		if (slot[1] != slotID) continue;

		if (target == 2 || target == 3 || target == 9) {
			// Start item switch delay
			data.io.to(data.matchID).emit(EventEnum.output.knight.START_CHANGE_EQUIPPED, {"i": slot[1], "t": target, "p": this.character.owner});
			var self = this;
			// Overwrite any abilities/items being channelled
			this.character.channelling = slot;
			setTimeout(function () {
				// Check if channelling has been cancelled
				if (self.character.channelling != slot) {
					return;
				}
				self.character.channelling = false;

				if (target == 2) {
					// Mainhand
					if ((self.inventory.weapons[0] == self.inventory.weapons[1]) && self.inventory.weapons[1]) {
						self.inventory.weapons[1][2] = 0;
						self.inventory.weapons[1] = null;
					}
					if (self.inventory.weapons[0]) self.inventory.weapons[0][2] = 0;
					self.inventory.weapons[0] = slot;
					slot[2] = 2;
				}
				else if (target == 3) {
					// Offhand
					if ((self.inventory.weapons[0] == self.inventory.weapons[1]) && self.inventory.weapons[0]) {
						self.inventory.weapons[0][2] = 0;
						self.inventory.weapons[0] = null;
					}
					if (self.inventory.weapons[1]) self.inventory.weapons[1][2] = 0;
					self.inventory.weapons[1] = slot;
					slot[2] = 3;
				}
				else if (target == 9) {
					// Twohand
					if (self.inventory.weapons[0]) self.inventory.weapons[0][2] = 0;
					if (self.inventory.weapons[1]) self.inventory.weapons[1][2] = 0;
					self.inventory.weapons[0] = slot;
					self.inventory.weapons[1] = slot;
					slot[2] = 9;
				}
				data.io.to(data.matchID).emit(EventEnum.output.knight.END_CHANGE_EQUIPPED, {"i": slot[1], "t": target, "p": self.character.owner});
			}, 3000);
		}
		else if (target == 4) {
				// Armor
				if (this.inventory.armor) {
					this.inventory.armor[2] = 0;
					this.inventory.setArmor(1800);
				} else {
					this.inventory.setArmor(slot[0]);
					slot[2] = 4;
				}
		}
		else {
			data.io.to(data.matchID).emit(EventEnum.output.knight.END_CHANGE_EQUIPPED, {"i": slot[1], "t": target, "p": this.character.owner});
		}

		i = slotLength;
	}

};

Knight.prototype.UseAbility = function (data) {
		for (var i = 0, abilitiesLength = this.inventory.abilities.length; i < abilitiesLength; i++) {
			if (data.slotID == this.inventory.abilities[i][1]) {
				this.abilities[i].UseKnightAbility(data);
				break;
			}
		}
};

Knight.prototype.UseItem = function (data) {
	var inventory = this.inventory.slots;
	console.log(inventory);
	for (var i = 0, inventoryLength = inventory.length; i < inventoryLength; i++) {
		// Check if item id matches the item and if an item is available (item count)
		if (inventory[i].length == 4 && data.slotID == inventory[i][1] && inventory[i][3] > 0) {
			data.slot = inventory[i];
			Item.UseItem(data);
			// Only use the first one
			i = inventoryLength;
		}
	}
};

module.exports = Knight;