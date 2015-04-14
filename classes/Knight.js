/*
 Model class for knights. Inheritance from Character.
 */
var Character = require('./Character');
var Inventory = require('./Inventory');
var THREE = require('three');

var Knight = function (location, owner) {
  this.character = new Character(location, owner, "knight", 0, 0);
  this.inventory = new Inventory();
  this.abilities = [];

  this.type == "knight";

  this.ChangeEquipped = function (itemID, target) {
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

  this.UseAbility = function (weapon, abilityID, target) {
    if (weapon == 1) {
      for (var i = 0, abilitiesLength = this.abilities.length; i < abilitiesLength; i++) {
        if (abilityID == this.abilities[i].id) {
          this.abilities[i].UseKnightAbility(inventory.mainWeapon, this, target);
        }
      }
    }
    else if (weapon == 2) {
      for (var i = 0, abilitiesLength = this.abilities.length; i < abilitiesLength; i++) {
        if (abilityID == this.abilities[i].id) {
          this.abilities[i].UseKnightAbility(inventory.offWeapon, this, target);
        }
      }
    }
  };

  this.UseItem = function (item, target) {
    // TODO
  };
};