/*
 Model class for knights. Inheritance from Character.
 */
var Character = require('./Character');
var Inventory = require('./Inventory');
var Ability = require('./Ability');

var Knight = function () {
    this.inventory = new Inventory();
    this.abilities = [];

    this.ChangeEquipped = function (itemID, target) {
        for (var i = 0, slots = this.inventory.slots, slotLength = slots.length; i < slotLength; i++) {
            if (slots[i].hasOwnProperty("itemID") && slots[i].itemID == itemID) {
                if (target == "main") {
                    this.inventory.mainWeapon = slots[i];
                } else if (target == "off") {
                    this.inventory.offWeapon = slots[i];
                } else if (target == "armor") {
                    this.inventory.armor = slots[i];
                }
                i = slotLength;
            }
        }
    };

    this.UseAbility = function (data) {
        for (var i = 0, abilitiesLength = this.abilities.length; i < abilitiesLength; i++) {
            if (data.abilityID == this.abilities[i].id) {
                if (data.weaponID == 1) {
                    data.weapon = this.inventory.mainWeapon;
                } else {
                    data.weapon = this.inventory.offWeapon;
                }
                this.abilities[i].UseKnightAbility(data);
            }
        }
    };

    this.UseItem = function (data) {
        for (var i = 0, inventoryLength = this.inventory.items.length; i < inventoryLength; i++) {
            if (data.itemID == this.inventory.items[i].id) {
                this.abilities[i].UseItem(data);
                // Only use the first one
                i = inventoryLength;
            }
        }
    };
};