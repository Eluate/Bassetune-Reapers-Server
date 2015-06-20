/*
 Model class for inventories.
 */

var Inventory = function (weapons, abilities, items) {
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
  this.weapons = weapons;
  this.abilities = abilities;
  this.items = items;

  // Specially equipped items
  this.mainWeapon = null;
  this.offWeapon = null;
  this.armor = null;
};

Inventory.prototype.getMaxSpace = function () {
  return 15;
};

Inventory.prototype.getMaxStackSize = function (isThrowing) {
  if (isThrowing) {
    return 200;
  }
  else {
    return 15;
  }
};

module.exports = Inventory;