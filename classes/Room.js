// Get all modules required for initialization
var Chat = require('./Chat');
var Location = require('./Location');
var Map = require('./Map');1
var MySQLHandler = require('./mysqlHandler');
var Finder = require('./Finder');
var Event = require('./EventEnum');
var CharacterManager = require('./CharacterManager');


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
	this.tick = 32;
	this.finishedLoadingPlayerData = false;

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
				MySQLHandler.connection.query("SELECT knight_slots, ability_slots, boss_slots FROM br_inventory WHERE account_id = ?", [accountID], function (err, results) {
					if (err) throw err;
					if (results.length == undefined || results.length == 0) return;

					// Sort knight data
					if (config.knights.indexOf(accountID) > -1) {
						// Inventory refers to any consumable, passive, weapon or armor item
						var inventory = [];
						// Fill inventory with blank slots
						for (var i = 0; i <= 24; i++) {
							inventory.push([0, 0, i, 0]);
						}

						// Abilities refers to the abilities equipped, and loads the initial consumable items into the hotbar on the client
						var abilities = [];

						var armor = null;
						var ammo = null;
						var weapons = [];

						var itemFile = require('./resources/items');
						var weaponFile = require('./resources/weapons');
						var armorFile = require('./resources/armor');
						var abilityFile = require('./resources/abilities');
						var ammoFile = require('./resources/ammo');

						var itemResults = JSON.parse(results[0].knight_slots);
						for (var i = 0; i < itemResults.length; i++) {
							for (var n = 0; n < itemFile.length; n++) {
								if (itemFile[n].item_id == itemResults[i][0]) {
									inventory[itemResults[i][2]] = itemResults[i];
								}
							}

							for (var n = 0; n < weaponFile.length; n++) {
								if (weaponFile[n].item_id == itemResults[i][0]) {
									inventory[itemResults[i][2]] = itemResults[i];

									if (itemResults[i][3] == 9) {
										// Two-handed
										weapons[0] = itemResults[i];
										weapons[1] = itemResults[i];
									}
									else if (itemResults[i][3] == 2) {
										// Main
										weapons[0] = itemResults[i];
									}
									else if (itemResults[i][3] == 3) {
										// Auxiliary
										weapons[1] = itemResults[i];
									}
								}
							}

							for (var n = 0; n < armorFile.length; n++) {
								if (armorFile[n].item_id == itemResults[i][0]) {
									inventory[itemResults[i][2]] = itemResults[i];

									if (itemResults[i][3] == 4) {
										// Armor
										armor = itemResults[i];
									}
								}
							}

							for (var n = 0; n < ammoFile.length; n++) {
								if (ammoFile[n].item_id == itemResults[i][0]) {
									inventory[itemResults[i][2]] = itemResults[i];

									if (itemResults[i][3] == 4) {
										// Ammo
										ammo = itemResults[i];
									}
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
						}

						// TODO: Calculate proper starting positions
					}
					// Sort boss data
					else if (config.bosses.indexOf(accountID) > -1) {
						var bossSlots = JSON.parse(results[0].boss_slots || "[]");
						if (bossSlots == [] || bossSlots == {}) {
							// TODO: End match, not a valid boss inventory (auto boss loss && no knight win)
							return;
						}
						else {
							self.dungeonCompositions = bossSlots;
						}

						var Item = require("./Item");
						for (var i = 0; i < self.dungeonCompositions.length; i++) {
							if (i != self.currentFloor) continue;

							for (var n = 0; n < self.dungeonCompositions[i].length; n ++) {
								var entity = self.dungeonCompositions[i][n][0];
								// Lord
								if (Item.ItemType.isLord(entity)) {
									var character = self.characterManager.SpawnLord(player.sID, entity);
									self.characters.push(character);
								}
								// Lesser Lord
								else if (Item.ItemType.isLesserLord(entity)) {
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
		var Item = require("./Item");
		var spawnPoints = self.map.SpawnDungeon();

		self.characters.forEach(function (character) {
			spawnPoints.forEach(function (point) {
				if (character.id == point.characterID) {
					character.position = point.location;
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
		// Locations
		self.location.UpdateCharacterPositions();
		self.location.SendCharacterLocations();
		// Victory Conditions
		if (self.map.dungeonType == "normal") {
			if (self.location.isKnightZoneWin()) {
				// Move on to next part of the dungeon
				self.map.SpawnLordRoom();
				// Emit win condition event
				var winCondition = {
					side: "knight", // Knight side won
					type: "progress" // Progress to lord dungeon
				};
				self.io.to(this.matchID).emit(Event.output.WIN_CONDITION_MET, winCondition);
			} else if (function () { // All knights are dead
					for (var i = 0; i < self.knights.length; i++) {
						if (!self.knights[i].isDead()) {
							return false;
						}
					}
				}) {
				// TODO: Implement end of game code, (results, etc)
				// Emit win condition event
				var winCondition = {
					side: "lord", // Knight side won
					type: "end" // End Match
				};
				self.io.to(this.matchID).emit(Event.output.WIN_CONDITION_MET, winCondition);
			}
		} else {
			if (self.map.dungeonType == "boss" && false /* Lord is dead */) {
				// TODO: Move on to next dungeon or End Game
			} else if (false /* All knights are dead */) {
				// TODO: End Game as win for Lord side
			}
		}
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
	setInterval(sendUpdates, 1000 / this.tick, this);
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
/*Z
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
	// Received data in form of {characterID:[locationX, locationY], ...}
	for (var key in data) {
		if (data[key].constructor !== Array) {
			continue;
		}
		// Check if data is valid or not
		if (data[key].length != 2 ) {
			return;
		}
		for (var i = 0; i < this.characters.length; i++) {
			var character = this.characters[i];
			if (character.id != key) {
				continue;
			}
			for (var n = 0; n < this.players.length; n++) {
				var player = this.players[n];
				if (player.socketID == socket.id && player.sID == character.owner) {
					this.location.UpdateDestination(character, data[key]);
					break;
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
				return;
			}
		});
	});
};

Room.prototype.stop = function () {
// TODO : disconnect players, close socket, update redis, shutdown matchID
};

module.exports = Room;