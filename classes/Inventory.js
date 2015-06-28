/*
 Model class for inventories.
 */

var Inventory = function (weapons, items) {
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
  this.items = items;
  this.armor = null;
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