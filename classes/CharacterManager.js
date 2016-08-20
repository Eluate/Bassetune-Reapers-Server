/**
 * Manages the spawning of characters
 */
var character = require("./Character");
var knight = require ("./Knight");
var bosses = require ("./Bosses").Bosses;

var CharacterManager =  {};
CharacterManager.count = 0;

CharacterManager.SpawnKnight =  function(owner, level)
{
    var char = new character(this.count, owner, "knight", 0, level);
    this.count++;
    char.knight = new knight();
    return char;
};

CharacterManager.SpawnBoss = function (owner, level, entity) 
{
  var char = new character(this.count, owner, "boss", entity, level);
  this.count++;
  var boss = (new bosses[entity](level));
  // Set boss attributes
  char.boss = boss;
  char.hp = boss.hp;
  char.maxhp = boss.hp;
  char.blockArmor = boss.armor;
  char.speed = boss.speed;
  return char;
};

module.exports = CharacterManager;