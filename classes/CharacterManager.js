/**
 * Manages the spawning of characters
 */
var character = require("./Character");
var knight = require("./Knight");
var bosses = require("./Lords").Bosses;
var minions = require("./Minions").Minions;

var CharacterManager = function () {
	this.count = 0;

	this.SpawnKnight = function (owner, level) {
		var char = new character(this.count, owner, "knight", 0, level);
		this.count++;
		char.knight = new knight(char);
		return char;
	};

	this.SpawnBoss = function (owner, level, entity) {
		var char = new character(this.count, owner, "lord", entity, level);
		this.count++;
		var boss = (new bosses[entity - 3000](level));
		// Set boss attributes
		char.boss = boss;
		char.hp = boss.hp;
		char.maxhp = boss.hp;
		char.blockArmor = boss.armor;
		char.speed = boss.speed;
		return char;
	};

	this.SpawnMinion = function (owner, level, entity) {
		var char = new character(this.count, owner, "minion", entity, level);
		this.count++;
		var minion = (new minions[entity - 3400](level));
		// Set minion attributes
		char.minion = minion;
		char.hp = minion.hp;
		char.maxhp = minion.hp;
		char.blockArmor = minion.armor;
		char.speed = minion.speed;
		return char;
	};
};

module.exports = CharacterManager;