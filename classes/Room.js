// Get all modules required for initialization
var Chat = require('./Chat');
var Location = require('./Location');
var Map = require('./Map');
var MySQLHandler = require('./mysqlHandler');
var Finder = require('./Finder');
var Event = require('./EventEnum');
var CharacterManager = require('./CharacterManager');
var VictoryConditions = require('./VictoryConditions');
var MinionAI = require("./ai/MinionAI");


var Room = function (io, matchID, config) {
    // Bind parameters to matchID
    this.matchID = matchID;
    this.io = io;
    this.config = config;

    // Start instances of modules
    this.map = new Map(this);
    this.chat = new Chat(this);
    this.location = new Location(this);
    this.characterManager = new CharacterManager();

    // All players that exist in the current game
    this.players = [];
    // All characters
    this.characters = [];
    this.location.characters = this.characters;
    // All knights (character objects)
    this.knights = [];
    this.location.knights = this.knights;
    // Dungeon Floors
    this.dungeonCompositions = [];
    this.currentFloor = 0;

    // Options
    this.tick = 16;
    this.finishedLoadingPlayerData = false;

    this.minionAI = new MinionAI(this.characters, this.location);
    //set aggro radius for minion. Default is 5
    //this.minionAI.setAggroRadius(5);

    /*
     Get player Data
     */
    var StorePlayerData = function (self) {
        // Get player data
        var playerIDs = self.config.bosses.concat(self.config.knights);
        var sortedIDs = playerIDs.sort(function (a, b) {
            return a - b;
        });
        // Count how many player creations have finished so map can be generated
        var finishedCount = 0;
        // Loop through each player accountID from matchmaking data
        playerIDs.forEach(function (accountID) {
            MySQLHandler.connection.query("SELECT * FROM br_account WHERE account_id = ?", [accountID], function (err, results) {
                if (err) throw err; // TODO: End game

                // Set player instance id for character owners
                results[0].sID = sortedIDs.indexOf(accountID);
                if (self.config.knights.indexOf(accountID) > -1) {
                    results[0].side = "knight";
                } else {
                    results[0].side = "boss";
                }
                self.players.push(results[0]);
                var player = Finder.GetPlayerFromAccountID(self.players, accountID);

                // Get all equipped items and abilities
                MySQLHandler.connection.query("(SELECT item_id, slot_id, null as item_tag, dungeon_id FROM br_lord_slots WHERE account_id = ?) UNION " +
                    "(SELECT item_id, slot_id, item_tag, null FROM br_knight_slots WHERE account_id = ?) UNION " +
                    "(SELECT item_id, slot_id, null, null FROM br_ability_slots WHERE account_id = ?)", [accountID, accountID, accountID], function (err, results) {
                    if (err) throw err;
                    if (results.length == undefined || results.length == 0) return;

                    var abilitySlots = [];
                    var knightItems = [];
                    var lordItems = [];
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].item_id == null || results[i].item_id == 0)
                            continue;

                        if (results[i].dungeon_id == null && results[i].item_tag == null) {
                            abilitySlots.push([results[i].item_id, results[i].slot_id]);
                        } else if (results[i].item_tag == null) {
                            lordItems.push([results[i].item_id, results[i].slot_id, results[i].dungeon_id]);
                        } else {
                            knightItems.push([results[i].item_id, results[i].slot_id, results[i].item_tag]);
                        }
                    }

                    // Sort knight data
                    if (config.knights.indexOf(accountID) > -1) {
                        // Inventory refers to any consumable, passive, weapon or armor item
                        var inventory = [];
                        // Fill inventory with blank slots
                        for (var i = 0; i <= 24; i++) {
                            // Inventory slots are [item id, item slot, item tag, item count]
                            inventory.push([0, i, 0, 0]);
                        }

                        var armor = null;
                        var ammo = null;
                        var weapons = [];

                        var itemFile = require('./resources/items');
                        var weaponFile = require('./resources/weapons');
                        var armorFile = require('./resources/armor');
                        var abilityFile = require('./resources/abilities');
                        var ammoFile = require('./resources/ammo');

                        var itemResults = knightItems;
                        for (var i = 0; i < itemResults.length; i++) {
                            for (var n = 0; n < itemFile.length; n++) {
                                if (itemFile[n].item_id == itemResults[i][0]) {
                                    inventory[itemResults[i][1]] = itemResults[i];
                                    // All consumables have 1 item use
                                    inventory[itemResults[i][1]].push(1);
                                }
                            }

                            for (var n = 0; n < weaponFile.length; n++) {
                                if (weaponFile[n].item_id == itemResults[i][0]) {
                                    inventory[itemResults[i][1]] = itemResults[i];

                                    if (itemResults[i][2] == 9) {
                                        // Two-handed
                                        weapons[0] = itemResults[i];
                                        weapons[1] = itemResults[i];
                                    } else if (itemResults[i][2] == 2) {
                                        // Main
                                        weapons[0] = itemResults[i];
                                    } else if (itemResults[i][2] == 3) {
                                        // Auxiliary
                                        weapons[1] = itemResults[i];
                                    }
                                }
                            }

                            for (var n = 0; n < armorFile.length; n++) {
                                if (armorFile[n].item_id == itemResults[i][0]) {
                                    inventory[itemResults[i][1]] = itemResults[i];

                                    if (itemResults[i][2] == 4) {
                                        // Armor
                                        armor = itemResults[i];
                                    }
                                }
                            }

                            for (var n = 0; n < ammoFile.length; n++) {
                                if (ammoFile[n].item_id == itemResults[i][0]) {
                                    inventory[itemResults[i][1]] = itemResults[i];

                                    if (itemResults[i][2] == 4) {
                                        // Ammo
                                        ammo = itemResults[i];
                                        // All ammo has 16 uses
                                        inventory[itemResults[i]].push(16);
                                    }
                                }
                            }
                        }

                        // Abilities refers to the abilities equipped, and loads the initial consumable items into the hotbar on the client
                        var abilities = [];
                        // Fill abilities with blank slots
                        for (var i = 0; i <= 12; i++) {
                            // Ability slots are [ability id, item slot]
                            abilities.push([0, i]);
                        }

                        var abilityResults = abilitySlots;
                        for (var i = 0; i < abilityResults.length; i++) {
                            // Get offensive and defensive abilities
                            for (var n = 0; n < abilityFile.length; n++) {
                                if (abilityFile[n].item_id == abilityResults[i][0]) {
                                    abilities[abilityResults[i][1]] = abilityResults[i];
                                }
                            }
                        }

                        var character = self.characterManager.SpawnKnight(player.sID, player.knight_level);
                        character.knight.inventory.abilities = abilities;
                        character.knight.inventory.weapons = weapons;
                        character.knight.inventory.armor = armor;
                        character.knight.inventory.ammo = ammo;
                        character.knight.inventory.slots = inventory;
                        character.knight.LoadAbilities();
                        character.position = {x: 30, y: 30};
                        self.characters.push(character);
                        self.knights.push(character);

                        character.hp = 4000;

                        // Increment finished count
                        finishedCount = finishedCount + 1;
                        if (finishedCount == playerIDs.length) {
                            SpawnMapAndCharacters(self);
                            self.finishedLoadingPlayerData = true;
                        }

                        // TODO: Calculate proper starting positions
                    }
                    // Sort boss data
                    else if (config.bosses.indexOf(accountID) > -1) {
                        var bossSlots = [];
                        if (lordItems == [] || lordItems == {}) {
                            // TODO: End match, not a valid boss inventory (auto boss loss && no knight win)
                            return;
                        } else {
                            // Fill bossSlots array with required dungeonComp arrays
                            var maxDungeons = 1;
                            for (var p = 0; p < lordItems.length; p++) {
                                if (lordItems[2] + 1 > maxDungeons) {
                                    maxDungeons = lordItems[2] + 1;
                                }
                            }
                            for (var p = 0; p < maxDungeons; p++) {
                                bossSlots.push([]);
                            }

                            for (var p = 0; p < lordItems.length; p++) {
                                bossSlots[lordItems[p][2]].push([lordItems[p][0], lordItems[p][1]]);
                            }
                            self.dungeonCompositions = bossSlots;
                        }

                        var Item = require("./Item");
                        for (var i = 0; i < self.dungeonCompositions.length; i++) {
                            if (i != self.currentFloor) continue;
                            for (var n = 0; n < bossSlots[i].length; n++) {
                                var entity = bossSlots[i][n][0];
                                // Lesser Lord
                                if (Item.ItemType.isLesserLord(entity)) {
                                    var character = self.characterManager.SpawnLesserLord(player.sID, entity);
                                    self.characters.push(character);
                                }
                                // Minion
                                else if (Item.ItemType.isMinion(entity)) {
                                    var character = self.characterManager.SpawnMinion(player.sID, entity);
                                    self.characters.push(character);
                                }
                                // Trap
                                else if (Item.ItemType.isTrap(entity)) {

                                }
                            }
                        }

                        // Increment finished count
                        finishedCount = finishedCount + 1;
                        if (finishedCount == playerIDs.length) {
                            SpawnMapAndCharacters(self);
                            self.finishedLoadingPlayerData = true;
                        }
                    }
                });
            });
        });
    };
    StorePlayerData(this);

    var SpawnMapAndCharacters = function (self) {
        var spawnPoints = self.map.SpawnDungeon();

        self.characters.forEach(function (character) {
            spawnPoints.forEach(function (point) {
                if (character.id == point.characterID) {
                    character.position = point.location;
                    character.spawnPosition = point.location; //keeping original position for ai
                }
            });
        });

        console.log("");
        console.log("Updated characters: ");
        console.log(self.characters);
    };

    this.sendInventories = function (characters, socket) {
        // Send knight inventory
        characters.forEach(function (character) {
            if (character.knight) {
                // Emit inventory and abilities
                socket.emit(Event.output.knight.ITEM_INVENTORY, {
                    id: character.owner,
                    i: character.knight.inventory.slots
                });
                socket.emit(Event.output.knight.ABILITY_INVENTORY, {
                    id: character.owner,
                    i: character.knight.inventory.abilities
                });
            }
        });
    };

    /*
     Send Updates
     */
    var sendUpdates = function (self) {
        if (!self.finishedLoadingPlayerData) return;
        self.minionAI.execute();
        // Locations
        self.location.UpdateCharacterPositions();
        self.location.SendCharacterLocations();
        // Victory Conditions
        VictoryConditions.Check(self);
        // HP
        var hp = {d: []};
        self.characters.forEach(function (character) {
            if (character.hp != character.prevhp) {
                hp.d.push({i: character.id, h: character.hp});
                character.prevhp = character.hp;
            }
        });
        if (hp.d.length > 0) {
            self.io.to(self.matchID).emit(Event.output.CHAR_HP, hp);
        }
        // Update time passed since last tick
        self.location.UpdateTime();
    };
    // Start Game Loop
    this.gameLoop = setInterval(sendUpdates, 1000 / this.tick, this);
};

/*
 Handle Reconnection
 */
//io.sockets.in(game_uuid).on('register', function (data)
Room.prototype.onRegister = function (socket, data) {
    if (!this.players.some(function (player) {
        if (data.uuid == player.last_uuid) {
            player.socketID = socket.id;
            player.socket = socket;
            return true;
        }
    })) {
        socket.disconnect();
        return;
    }
    // Emit the seed for map generation
    socket.emit("seed", {"s": this.map.seed, "t": this.map.dungeonType});
    // Emit the characters
    this.characters.forEach(function (character) {
        socket.emit(Event.output.CHAR_CREATED,
            {
                I: character.id,
                O: character.owner,
                E: character.entity,
                H: character.hp,
                L: character.position,
                M: character.maxhp
            });
    });
    // Emit the players
    var playerData = {"d": []};
    this.players.forEach(function (player) {
        playerData["d"].push({i: player.sID, u: player.username, n: player.nickname, s: player.side})
    });
    socket.emit(Event.output.PLAYER, playerData);
    // Wait 1s until sending inventories
    setTimeout(this.sendInventories, 1000, this.characters, socket);
};
/*
 Listeners: Input from the player
 */

// Disconnection
//io.sockets.in(game_uuid).on('disconnect',
Room.prototype.onDisconnect = function (socket) {
    var username = Finder.GetUsernameFromSocketID(this.players, socket.id);
    require('./Disconnect')(socket, username, this.matchID, this.io);
};
// Text Chat
//io.sockets.in(game_uuid).on(Event.input.TALK,
Room.prototype.onTalk = function (socket, data) {
    var target = data.target;
    var message = data.message;
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].socketID == socket.id) {
            this.chat.addMsg(this.players, this.players[i], message, target);
        }
    }
};
// Movement
//io.sockets.in(game_uuid).on(Event.input.MOVE,
Room.prototype.onMove = function (socket, data) {
    // Find player belonging to player id
    var playerID = Finder.GetPlayerSIDFromSocketID(this.players, socket.id);
    // Received data in form of {characterID:[locationX, locationY], ...}
    for (var key in data) {
        if (data[key].constructor !== Array) {
            continue;
        }
        // Check if data is valid or not
        if (data[key].length != 2) {
            return;
        }
        for (var i = 0; i < this.characters.length; i++) {
            var character = this.characters[i];
            if (character.id != key) {
                continue;
            }
            if (playerID == character.owner) {
                this.location.UpdateDestination(character, data[key]);
                console.log(character.path);
                console.log("updated ds");
                break;
            }
        }
    }
};
// Leave
//io.sockets.in(game_uuid).on(Event.input.LEAVE,
Room.prototype.onLeave = function (socket) {
    var username = Finder.GetUsernameFromSocketID(this.players, socket.id);
    require('./Disconnect')(socket, username, this.matchID, this.io);
};
// Knight changing equipped armor
//io.sockets.in(game_uuid).on(Event.input.knight.CHANGE_EQUIPPED,
Room.prototype.onKnightChangeEquipped = function (socket, data) {
    // Find knight belonging to player id
    var playerID = Finder.GetPlayerSIDFromSocketID(this.players, socket.id);
    for (var i = 0; i < this.characters.length; i++) {
        if (this.characters[i].owner == playerID && this.characters[i].knight) {
            data.io = this.io;
            data.matchID = this.matchID;
            data.players = this.players;
            data.knights = this.knights;
            this.characters[i].knight.ChangeEquipped(data, data.slotID, data.target);
            i = this.players.length;
        }
    }
};
// Knight using ability
//io.sockets.in(game_uuid).on(Event.input.knight.ABILITY_START,
Room.prototype.onKnightAbilityStart = function (socket, data) {
    console.log(data);
    var slotID = parseInt(data.slotID, 10);
    var characterID = parseInt(data.characterID, 10);
    var weaponID = parseInt(data.weapon, 10);
    if (isNaN(slotID) || isNaN(characterID) || isNaN(weaponID)) {
        return;
    }
    // Find knight belonging to player id
    var playerID = Finder.GetPlayerSIDFromSocketID(this.players, socket.id);
    for (var i = 0; i < this.characters.length; i++) {
        var character = this.characters[i];
        if (this.characters[i].owner == playerID && this.characters[i].knight) {
            if (!character.stunned()) {
                data.slotID = slotID;
                data.location = this.location;
                data.character = character;
                data.characters = this.characters;
                data.game_uuid = this.matchID;
                data.io = this.io;
                character.knight.UseAbility(data);

                //console.log("Player " + player.sID + " used ability " + data.slotID + ".");
            }
            break;
        }
    }
};
// Knight using item
//io.sockets.in(game_uuid).on(Event.input.knight.USE_ITEM_START,
Room.prototype.onKnightUseItemStart = function (socket, data) {
    var characterID = parseInt(data.characterID, 10);
    var slotID = parseInt(data.slotID, 10);
    if (isNaN(characterID) || isNaN(slotID)) {
        return;
    }
    for (var i = 0; i < this.characters.length; i++) {
        var character = this.characters[i];
        if (character.id != characterID) {
            return;
        }
        for (var n = 0; n < this.players.length; n++) {
            var player = this.players[n];
            if (player.socketID == socket.id && Finder.GetPlayerSIDFromSocketID(this.players, socket.id) == character.owner) {
                if (!character.stunned() && character.knight != null) {
                    data.slotID = slotID;
                    data.location = this.location;
                    data.character = character;
                    data.characters = this.characters;
                    data.game_uuid = this.matchID;
                    data.io = this.io;
                    character.knight.UseItem(data);

                    console.log("Player " + player.sID + " used " + data.slotID + ".");
                }
            }
        }
    }
};
// Boss putting a trap down
//io.sockets.in(game_uuid).on(Event.input.boss.PUT_TRAP,
Room.prototype.onBossPutTrap = function (socket, data) {
    // TODO: Put a trap
};
// Boss using an ability
//io.sockets.in(game_uuid).on(Event.input.boss.ABILITY_START,
Room.prototype.onBossAbilityStart = function (socket, data) {
    var abilityID = parseInt(data.slotID, 10);
    var characterID = parseInt(data.characterID, 10);
    var target = data.target;
    if (isNaN(slotID) || isNaN(characterID) || ((!target.hasOwnProperty("x") || !target.hasOwnProperty("y")) || !target.hasOwnProperty("toggle"))) {
        return;
    }
    this.players.forEach(function (player) {
        characters.forEach(function (character) {
            if (character.type == "boss" && character.id == characterID &&
                player.socketID == socket.id && Finder.GetPlayerSIDFromSocketID(this.players, socket.id) == character.owner) {
                if (!character.stunned && !isNaN(slotID) && slotID < character.boss.abilities.length) {
                    data.characters = characters;
                    data.game_uuid = game_uuid;
                    data.io = this.io;
                    data.character = character;
                    data.slotID = slotID;
                    character.boss.abilities[slotID](data);
                }

            }
        });
    });
};

Room.prototype.stop = function () {
    // TODO : disconnect players, close socket, update redis, shutdown matchID
};

module.exports = Room;