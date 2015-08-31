var Chat = require('./Chat');
var Location = require('./Location');
var Map = require('./Map');
var Event = require('./EventEnum');
var Finder = require('./Finder');
var MySQLHandler = require('./mysqlHandler');

var Room = function (io, game_uuid, config) {
  // Start instances of modules
  var map = new Map();
  var chat = new Chat(io, game_uuid);
  var location = new Location(io, game_uuid, map);
  var characterManager = require('./CharacterManager').CharacterManager;
  console.log("characterManager:");
  console.log(characterManager.SpawnBoss);
  
  // All players that exist in the current game
  var players = [];
  // All characters
  var characters = [];

  /*
    Get player Data
   */
  var StorePlayerData = function (data) {
    // Get player data
    var P = players;
    config.players.forEach(function (accountID) {
      MySQLHandler.connection.query("SELECT * FROM br_account WHERE account_id = ?" , [accountID] , function(err,results) {
        if (err) {
          return;
        }
        P.push(results[0]);
      });
    });
    // Sort boss data
    config.bosses.forEach(function(accountID) {
      MySQLHandler.connection.query("SELECT * FROM br_inventory WHERE account_id = ? AND false = isNull(item_id)", [accountID], function(err, results) {
        if (err) {
          return;
        }
        var allItems = [];
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_id.toString() != "null") {
            allItems.push(results[i]);
          }
        }
        allItems.forEach(function(item) {
          // Only create the boss for now
          if (item.purpose == "boss") {
            var boss = characterManager.SpawnBoss(accountID, Finder.GetPlayerFromAccountID(players, accountID).boss_level, item.value);
            io.to(game_uuid).emit(Event.output.CHAR_CREATED, {ID: character.id, Owner: character.owner, Entity: character.entity, Type: character.type, HP: character.maxhp});
            characters.push(boss);
            // TODO: Calculate proper starting positions
            //for now they all start in the same spot
            location.UpdateDestination(character.id, [20, 20]);
          }
        });
        // TODO: Filter bosses, minibosses, creatures, traps
      });
    });
    config.knights.forEach(function(accountID) {
      // Get all equipped items & abilities
      MySQLHandler.connection.query("SELECT * FROM br_inventory WHERE account_id = ? AND (false = isnull(inventory_slot) OR false = isnull(ability_slot))", [accountID], function(err, results) {
        var items = [];
        var weapons = [];
        var abilities = [];
        for (var i = 0; i < results.length; i++) 
        {
          console.log("weapon id: " + results[i].weapon_id);
          if (results[i].weapon_id.toString() != "null") {
            weapons.push(results[i]);
          } else if (results[i].item_id.toString() != "null") {
            items.push(results[i]);
          } else if (results[i].ability_id.toString() != "null") {
            abilities.push(results[i]);
          }
        }
        var character = characterManager.SpawnKnight(accountID);
        character.knight.inventory.items = items;
        character.knight.abilities = abilities;
        character.knight.inventory.weapons = weapons;
        character.knight.inventory.sortInventory();
        characters.push(character);
        //this event is weird, no client will ever get this since this function is called during room creation
        io.to(game_uuid).emit(Event.output.CHAR_CREATED, {ID: character.id, Owner: character.owner, Entity: character.entity, Type: character.type, HP: character.maxhp});
        // Set character location
        // TODO: Calculate proper starting positions
        location.UpdateDestination(character.id, [1 + (i / 2), 1 + (i / 2)]);
      });
    });
    players = data;
  };
  StorePlayerData(config);

  /*
 Send Updates
 */
  var SendUpdates  = function () 
  {
    // Locations
    characters.forEach(function(character) {
      location.UpdateCharacterLocation(character.id, character.speed);
    });
    location.SendCharacterLocations();
    location.UpdateTime();
    // HP
    var hp = [];
    characters.forEach(function(character) {
      if (character.hp != character.prevhp) {
        hp.push({i:character.id, h:character.hp});
        character.prevhp = character.hp;
      }
    });
    io.to(game_uuid).emit(Event.output.CHAR_HP, hp);
  }
  // Start Game Loop, 24 Updates per second
  setInterval(SendUpdates, 41);
};

/*
   Handle Reconnection
   */
  //io.sockets.in(game_uuid).on('register', function (data) 
  Room.prototype.onRegister = function (socket, data)
  {
    if (!players.some(function (player) {
      if (data.uuid == player.last_uuid) {
        player.socketID = socket.id;
        return true;
      }return false;
    })) {
      socket.disconnect();
    }
    // emit registered
    // TODO: Emit data (Characters, Locations, Players)
  };

  /*
   Listeners: Input from the player
   */
  
    // Disconnection
    //io.sockets.in(game_uuid).on('disconnect', 
    Room.prototype.onDisconnect = function (socket) 
    {
      var username = Finder.GetUsernameFromSocketID(players, socket.id);
      require('./Disconnect')(socket, username, game_uuid, io);
    };
    // Text Chat
    //io.sockets.in(game_uuid).on(Event.input.TALK, 
    Room.prototype.onTalk = function (socket , data) 
    {
      players.forEach(function (player) {
        if (player.socketID == socket.id) {
          chat.addMsg(player.username, data.message);
        }
      });
    };
    // Movement
    //io.sockets.in(game_uuid).on(Event.input.MOVE, 
    Room.prototype.onMove = function (socket , data) 
    {
      // Received data in form of {characterID:[locationX, locationY}, ...}
      for (var key in data) {
        // Check if data is valid or not
        if (isNaN(parseFloat(data[key][0])) || isNaN(parseFloat(data[key][1]))) {
          return;
        }
        characters.some(function (character) {
          if (character.id != key) {
            return false;
          }
          // Check if channelling
          if (character.channelling) {
            if (character.channelling != false) {
              if (character.channelling == true) {
                character.channelling = "m";
              } else {
                character.channelling += "m";
              }
              character.channellingAbility.CheckInterruption();
            }
          }
          players.forEach(function (player) {
            if (player.socketID == socket.id && Finder.GetAccountIDFromSocketID(players, socketID) == character.owner) {
              location.UpdateDestination(key, data[key]);
              return true;
            }
          });
        });
      }
    };
    // Leave
    //io.sockets.in(game_uuid).on(Event.input.LEAVE, 
    Room.prototype.onLeave = function (socket) 
    {
      var username = Finder.GetUsernameFromSocketID(players, socket.id);
      require('./Disconnect')(socket, username, game_uuid, io);
    };
    // Knight changing equipped armor
    //io.sockets.in(game_uuid).on(Event.input.knight.CHANGE_EQUIPPED, 
    Room.prototype.onKnightChangeEquipped = function (socket,data) 
    {
      var characterID = parseInt(data.characterID, 10);
      if (!isNaN(characterID) && characterID < characters.length &&
        Finder.GetAccountIDFromSocketID(players, socket.id) == characters[characterID].owner && characters[characterID].knight != null) {
        characters[characterID].knight.ChangeEquipped(data.itemID, data.target);
      }
    };
    // Knight using ability
    //io.sockets.in(game_uuid).on(Event.input.knight.ABILITY_START, 
    Room.prototype.onKightAbilityStart = function (socket,data) 
    {
      var abilityID = parseInt(data.abilityID, 10);
      var characterID = parseInt(data.characterID, 10);
      var weaponID = parseInt(data.weapon, 10);
      if (isNaN(abilityID) || isNaN(characterID) || isNaN(weaponID) || data.target == null ||
        !data.target.hasOwnProperty("x") || !data.target.hasOwnProperty("y")) {
        return;
      }
      characters.forEach(function (character) {
        if (character.id != characterID && character.type == "knight") {
          return;
        }
        players.forEach(function (player) {
          if (player.socketID == socket.id && Finder.GetAccountIDFromSocketID(players, socket.id) == character.owner) {
            if (!character.stunned && character.knight != null) {
              data.abilityID = abilityID;
              data.weaponID = weaponID;
              data.location = location;
              data.character = character;
              data.characters = characterID;
              data.game_uuid = game_uuid;
              data.io = io;
              character.knight.UseAbility(data);
            }
          }
        });
      });
    };
    // Knight using item
    //io.sockets.in(game_uuid).on(Event.input.knight.USE_ITEM_START, 
    Room.prototype.onKnightUseItemStart = function (socket,data) 
    {
      var characterID = parseInt(data.characterID, 10);
      var itemID = parseInt(data.itemID, 10);
      if (isNaN(characterID) || isNaN(itemID)) {
        return;
      }
      characters.forEach(function (character) {
        if (character.id != characterID) {
          return;
        }
        players.forEach(function (player) {
          if (player.socketID == socket.id && Finder.GetAccountIDFromSocketID(players, socket.id) == character.owner) {
            if (!character.stunned && character.knight != null) {
              data.itemID = itemID;
              data.location = location;
              data.character = characters[characterID];
              data.characters = characters;
              data.game_uuid = game_uuid;
              data.io = io;//what is this used for? looks like a redundancy
              character.knight.UseItem(data);
            }
          }
        });
      });
    };
    // Boss putting a trap down
    //io.sockets.in(game_uuid).on(Event.input.boss.PUT_TRAP, 
    Room.prototype.onBossPutTrap = function (socket,data) 
    {
      // TODO: Put a trap
    };
    // Boss using an ability
    //io.sockets.in(game_uuid).on(Event.input.boss.ABILITY_START, 
    Room.prototype.onBossAbilityStart = function (socket,data) 
    {
      var abilityID = parseInt(data.abilityID, 10);
      var characterID = parseInt(data.characterID, 10);
      var target = data.target;
      if (isNaN(abilityID) || isNaN(characterID) || ((!target.hasOwnProperty("x") || !target.hasOwnProperty("y")) ||
      !target.hasOwnProperty("toggle"))) {
        return;
      }
      players.forEach(function (player) {
        characters.forEach(function (character) {
          if (character.type == "boss" && character.id == characterID &&
            player.socketID == socket.id && Finder.GetAccountIDFromSocketID(players, socket.id) == character.owner) {
            if (!character.stunned && !isNaN(abilityID) && abilityID < character.boss.abilities.length) {
              data.characters = characters;
              data.game_uuid = game_uuid;
              data.io = io;//?
              data.character = character;
              data.abilityID = abilityID;
              character.boss.abilities[abilityID](data);
            }
            return;
          }
        });
      });
    };

Room.prototype.stop = function () {
// TODO : disconnect players, close socket, update redis, shutdown room
};

module.exports = Room;