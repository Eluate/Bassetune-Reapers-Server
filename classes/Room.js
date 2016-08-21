var Chat = require('./Chat');
var Location = require('./Location');
var Map = require('./Map');
var Event = require('./EventEnum');
var Finder = require('./Finder');
var MySQLHandler = require('./mysqlHandler');

var Room = function (io, matchID, config) {
	// Bind parameters to room
	this.matchID = matchID;
	this.io = io;
	this.config = config;

	// Start instances of modules
	this.map = new Map();
	this.chat = new Chat(io, matchID);
	this.location = new Location(io, matchID, this.map);
	this.characterManager = require('./CharacterManager');

	// All players that exist in the current game
	this.players = [];
	// All characters
	this.characters = [];
	this.location.characters = this.characters;

	/*
	 Get player Data
	 */
	var StorePlayerData = function (config, characterManager, location, characters, players) {
		// Get player data
		var itemList = require("./resources/items");
		var playerIDs = config.bosses.concat(config.knights);
		var sortedIDs = playerIDs.sort(function (a, b) {
			return a - b;
		});
		playerIDs.forEach(function (accountID) {
			MySQLHandler.connection.query("SELECT * FROM br_account WHERE account_id = ?", [accountID], function (err, results) {
				if (err) throw err;

				results[0].sID = sortedIDs.indexOf(accountID);
				if (config.knights.indexOf(accountID) > -1) {
					results[0].side = "knight";
				} else {
					results[0].side = "boss";
				}
				players.push(results[0]);
				var player = Finder.GetPlayerFromAccountID(players, accountID);

				// Sort boss data
				if (config.bosses.indexOf(accountID) > -1) {
					MySQLHandler.connection.query("SELECT boss_slots FROM br_inventory WHERE account_id = ?", [accountID], function (err, results) {
						if (err || results.length < 1) {
							return;
						}
						var bossSlots = JSON.parse(results[0].boss_slots);
						for (var key in bossSlots) {
							var slot = bossSlots[key];
							var item = {};
							// Find the item using the ID
							itemList.forEach(function (itemInfo) {
								if (itemInfo.id == slot[0]) {
									item = itemInfo;
								}
							});
							// TODO: Filter bosses, minibosses, creatures, traps
							// Only create the boss for now
							if (item.purpose == "boss") {
								var boss = characterManager.SpawnBoss(player.sID, player.boss_level, item.item_id - 3000);
								boss.position = {x: 20, y: 20};
								characters.push(boss);
								// TODO: Calculate proper starting positions
								//for now they all start in the same spot
							}
						}
					});
				}
				// Sort knight data
				if (config.knights.indexOf(accountID) > -1) {
					// Get all equipped items and abilities
					MySQLHandler.connection.query("SELECT knight_slots, ability_slots FROM br_inventory WHERE account_id = ?", [accountID], function (err, results) {
						if (err) throw err;
						if (results.length == undefined || results.length == 0) return;

						// Inventory refers to any consumable, passive, weapon or armor item
						var inventory = [];
						// Abilities refers to the abilities equipped, and loads the initial consumable items into the hotbar on the client
						var abilities = [];

						var itemFile = require('./resources/items');
						var abilityFile = require('./resources/abilities');

						var itemResults = JSON.parse(results[0].knight_slots);
						for (var i = 0; i < itemResults.length; i++) {
							for (var n = 0; n < itemFile.length; n++) {
								if (itemFile[n].item_id == itemResults[i][0]) {
									inventory.push(itemResults[i]);
								}
							}
						}

						var abilityResults = JSON.parse(results[0].ability_slots);
						for (var i = 0; i < abilityResults.length; i++) {
							// Get offensive and defensive abilities
							for (var n = 0; n < abilityFile.length; n++) {
								if (abilityFile[n].item_id == abilityResults[i][0]) {
									abilities.push(abilityResults[i]);
								}
							}
							// Get items equipped to hotbar
							for (var n = 0; n < itemFile.length; n++) {
								if (itemFile[n].item_id == abilityResults[i][0]) {
									inventory.push(abilityResults[n]);
									// Push these items into ability array so that these items are loaded into the hotbar when loaded
									abilities.push(abilityResults[i]);
								}
							}
						}

						var armor = [];
						var weapons = [];
						var character = characterManager.SpawnKnight(player.sID, player.knight_level);
						character.knight.abilities = abilities;
						character.knight.inventory.weapons = weapons;
						character.knight.inventory.slots = inventory;
						character.position = {x: 30, y: 30};
						characters.push(character);

						character.hp = 30;
						// Set character location
						// TODO: Calculate proper starting positions
					});
				}
			});
		});

	};
	StorePlayerData(config, this.characterManager, this.location, this.characters, this.players);

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
					i: character.knight.abilities
				});
			}
		});
	};

	/*
	 Send Updates
	 */
	var sendUpdates = function (characters, location, io, matchID) {
		// Locations
		location.UpdateCharacterPositions();
		location.SendCharacterLocations();
		location.UpdateTime();
		// HP
		var hp = {d:[]};
		characters.forEach(function (character) {
			if (character.hp != character.prevhp) {
				hp.d.push({i: character.id, h: character.hp});
				character.prevhp = character.hp;
			}
		});
		if (hp.d.length > 0) {
			io.to(matchID).emit(Event.output.CHAR_HP, hp);
		}
	};
	// Start Game Loop, 12 Updates per second
	setInterval(sendUpdates, 83, this.characters, this.location, this.io, this.matchID);
};

// Sets the data object for further use in different modules
Room.prototype.retrieveData = function() {
	var data = {};
};

/*
 Handle Reconnection
 */
//io.sockets.in(game_uuid).on('register', function (data)
Room.prototype.onRegister = function (socket, data) {
	if (!this.players.some(function (player) {
			if (data.uuid == player.last_uuid) {
				player.socketID = socket.id;
				return true;
			}
		})) {
		socket.disconnect();
		return;
	}
	// Emit the seed for map generation
	socket.emit("seed", {"s": this.map.seed});
	// Emit the characters
	this.characters.forEach(function (character) {
		socket.emit(Event.output.CHAR_CREATED,
			{I: character.id, O: character.owner, E: character.entity, H: character.hp, L: character.position, M: character.maxhp});
	});
	// Emit the players
	var playerData = {"d": []};
	this.players.forEach(function (player) {
		playerData["d"].push({i: player.sID, u: player.username, n: player.nickname, s: player.side})
	});
	socket.emit(Event.output.PLAYER, playerData);
	// Wait 1s until sending inventories
	setTimeout(this.sendInventories(this.characters, socket), 1000);
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
	this.players.forEach(function (player) {
		if (player.socketID == socket.id) {
			this.chat.addMsg(this.players, player, message, target);
		}
	});
};
// Movement
//io.sockets.in(game_uuid).on(Event.input.MOVE,
Room.prototype.onMove = function (socket, data) {
	// Received data in form of {characterID:[locationX, locationY], ...}
	for (var key in data) {
		if (data[key].constructor !== Array) {
			continue;
		}
		// Check if data is valid or not
		if (data[key].length != 2 || isNaN(parseFloat(data[key][0])) || isNaN(parseFloat(data[key][1]))) {
			return;
		}
		for (var i = 0; i < this.characters.length; i++) {
			var character = this.characters[i];
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
			for (var n = 0; n < this.players.length; n++) {
				var player = this.players[n];
				if (player.socketID == socket.id && player.sID == character.owner) {
					this.location.UpdateDestination(character, data[key]);
					return true;
				}
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
	var characterID = parseInt(data.characterID, 10);
	if (!isNaN(characterID) && characterID < characters.length &&
		Finder.GetAccountIDFromSocketID(this.players, socket.id) == characters[characterID].owner && characters[characterID].knight != null) {
		characters[characterID].knight.ChangeEquipped(data.itemID, data.target);
	}
};
// Knight using ability
//io.sockets.in(game_uuid).on(Event.input.knight.ABILITY_START,
Room.prototype.onKnightAbilityStart = function (socket, data) {
	var abilityID = parseInt(data.abilityID, 10);
	var characterID = parseInt(data.characterID, 10);
	var weaponID = parseInt(data.weapon, 10);
	if (isNaN(abilityID) || isNaN(characterID) || isNaN(weaponID) || data.target == null || !data.target.hasOwnProperty("x") || !data.target.hasOwnProperty("y")) {
		return;
	}
	characters.forEach(function (character) {
		if (character.id != characterID && character.type == "knight") {
			return;
		}
		this.players.forEach(function (player) {
			if (player.socketID == socket.id && Finder.GetAccountIDFromSocketID(this.players, socket.id) == character.owner) {
				if (!character.stunned && character.knight != null) {
					data.abilityID = abilityID;
					data.weaponID = weaponID;
					data.location = location;
					data.character = character;
					data.characters = characterID;
					data.game_uuid = this.matchID;
					data.io = this.io;
					character.knight.UseAbility(data);
				}
			}
		});
	});
};
// Knight using item
//io.sockets.in(game_uuid).on(Event.input.knight.USE_ITEM_START,
Room.prototype.onKnightUseItemStart = function (socket, data) {
	var characterID = parseInt(data.characterID, 10);
	var itemID = parseInt(data.itemID, 10);
	if (isNaN(characterID) || isNaN(itemID)) {
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
					data.itemID = itemID;
					data.location = this.location;
					data.character = character;
					data.characters = this.characters;
					data.game_uuid = this.matchID;
					data.io = this.io;
					character.knight.UseItem(data);

					console.log("Player " + player.sID + " used " + data.itemID + ".");
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
	var abilityID = parseInt(data.abilityID, 10);
	var characterID = parseInt(data.characterID, 10);
	var target = data.target;
	if (isNaN(abilityID) || isNaN(characterID) || ((!target.hasOwnProperty("x") || !target.hasOwnProperty("y")) || !target.hasOwnProperty("toggle"))) {
		return;
	}
	this.players.forEach(function (player) {
		characters.forEach(function (character) {
			if (character.type == "boss" && character.id == characterID &&
				player.socketID == socket.id && Finder.GetAccountIDFromSocketID(this.players, socket.id) == character.owner) {
				if (!character.stunned && !isNaN(abilityID) && abilityID < character.boss.abilities.length) {
					data.characters = characters;
					data.game_uuid = game_uuid;
					data.io = this.io;
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