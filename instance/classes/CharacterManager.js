/**
 * Manages the spawning of characters
 */
var character = require("./Character");
var knight = require("./Knight");
var lords = require("./Lords").Lords;
var lesserLords = require("./LesserLords").LesserLords;
var minions = require("./Minions").Minions;

var CharacterManager = function () {
    this.count = 0;

    this.SpawnKnight = function (owner) {
        var char = new character(this.count, owner, "knight", 0);
        this.count++;
        char.knight = new knight(char);
        return char;
    };

    this.SpawnLord = function (owner, entity) {
        var char = new character(this.count, owner, "lord", entity);
        this.count++;
        var boss = (new lords[entity - 3000]());
        // Set boss attributes
        char.boss = boss;
        char.hp = boss.hp;
        char.maxhp = boss.hp;
        char.blockArmor = boss.armor;
        char.speed = boss.speed;
        return char;
    };

    this.SpawnMinion = function (owner, entity) {
        var char = new character(this.count, owner, "minion", entity);
        this.count++;
        var minion = (new minions[entity - 3400]());
        // Set minion attributes
        char.minion = minion;
        char.hp = minion.hp;
        char.maxhp = minion.hp;
        char.blockArmor = minion.armor;
        char.blockArmorPercent = minion.armorPercent;
        char.speed = minion.speed;
        return char;
    };

    this.SpawnLesserLord = function (owner, entity) {
        var char = new character(this.count, owner, "lesserlord", entity);
        this.count++;
        var lesserLord = (new lesserLords[entity - 3200]());
        // Set minion attributes
        char.lesserlord = lesserLord;
        char.hp = lesserLord.hp;
        char.maxhp = lesserLord.hp;
        char.blockArmor = lesserLord.armor;
        char.blockArmorPercent = lesserLord.armorPercent;
        char.speed = lesserLord.speed;
        return char;
    };
};

module.exports = CharacterManager;