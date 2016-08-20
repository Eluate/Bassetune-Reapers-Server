/*
 Model class for knights. Inheritance from Character.
 */
var Character = require('./Character');
var Inventory = require('./Inventory');
var Ability = require('./Ability');
var Item = require('./Item');

var Knight = function () 
{
  this.inventory = new Inventory();
  this.abilities = [];
};

Knight.prototype.ChangeEquipped = function (itemID, target) {
    for (var i = 0, slots = this.inventory.slots, slotLength = slots.length; i < slotLength; i++) {
     if (slots[i].hasOwnProperty("itemID") && slots[i].itemID == itemID) {
       if (target == "main") {
         this.inventory.mainWeapon = slots[i];
       }
       else if (target == "off") {
         this.inventory.offWeapon = slots[i];
       }
       else if (target == "armor") {
         this.inventory.armor = slots[i];
       }
       i = slotLength;
     }
    }
  };

Knight.prototype.UseAbility = function (data) {
  for (var i = 0, abilitiesLength = this.abilities.length; i < abilitiesLength; i++) {
    if (data.abilityID == this.abilities[i].id) {
      this.abilities[i].UseKnightAbility(data);
    }
  }
};

Knight.prototype.UseItem = function (data) {
	var inventory = this.inventory.slots;
	console.log(inventory);
  for (var i = 0, inventoryLength = inventory.length; i < inventoryLength; i++) {
		// Check if item id matches the item and if an item is available (item count)
    if (data.itemID == inventory[i][0] && inventory[i][1] > 0) {
			data.slot = inventory[i];
      Item.UseItem(data);
      // Only use the first one
      i = inventoryLength;
    }
  }
};

module.exports = Knight;