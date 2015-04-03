/*
 Model class for inventories.
 */

var Inventory = function (weapons, abilities, items) {

  var slots = {};

  this.getFreeSpace = function () {
    var count = 0;
    slots.forEach(function (slot) {
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
};

Inventory.prototype.getMaxSpace = function () {
  return 15;
};

module.exports = Inventory;