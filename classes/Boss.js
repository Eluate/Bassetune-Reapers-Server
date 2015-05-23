/*
 Model class for Bosses. Inherits Character.
 */
var Character = require('./Character');
var Ability = require('./Ability');
var THREE = require('three');

var Boss = function (location, owner) {
  this.character = new Character(location, owner, "boss", 0, 0);
  this.abilities = [];

  this.character.type == "boss";

  this.UseAbility = function (abilityID, target, location, characters, charactersIndex) {
    for (var i = 0, abilitiesLength = this.abilities.length; i < abilitiesLength; i++) {
      if (abilityID == this.abilities[i].id) {
        Ability.UseKnightAbility(this.abilities[i], this.inventory.offWeapon, this, target, location, characters);
      }
    }
  };
};