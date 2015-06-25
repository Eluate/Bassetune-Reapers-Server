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

  this.UseAbility = function (weapon, abilityID, target, location, characters, roomID, io) {
    for (var i = 0, abilitiesLength = this.abilities.length; i < abilitiesLength; i++) {
      if (abilityID == this.abilities[i].id) {
        if (weapon == 1) {
          this.abilities[i].UseKnightAbility(this.inventory.mainWeapon, this, target, location, characters, roomID, io);
        }
        else {
          this.abilities[i].UseKnightAbility(this.inventory.offWeapon, this, target, location, characters, roomID, io);
        }
      }
    }
  };

  this.UseItem = function (item, target) {
    // TODO
  };
};