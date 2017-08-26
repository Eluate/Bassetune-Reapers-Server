/**
 * Manages progress of dungeons and completion of dungeons
 */

var Event = require('./EventEnum');

var ConditionCheck = function (self) {
	// Normal Dungeon Type
	if (self.map.dungeonType == "normal") {
		// Knight Win
		if (self.location.isKnightZoneWin()) {
			// Emit win condition event
			var winCondition = {
				side: "knight", // Knight side won
				type: "progress" // Progress to lord dungeon
			};
			self.io.to(self.matchID).emit(Event.output.WIN_CONDITION_MET, winCondition);

			// Remove minions and minibosses
			for (var i = 0; i < self.characters.length; i++) {
				if (!self.characters[i].knight) {
					self.characters.splice(i, 1);
					i--;
				}
			}

			// Revive any dead knights (restore 10% hp)
			for (var i = 0; i < self.characters.length; i++) {
				if (self.characters[i].dead()) {
					self.characters[i].hp = self.characters[i].maxhp * 0.1;
				}
			}

			// Spawn Lord (loop through dungeon compositions and find it)
			var Item = require("./Item");
			var player = self.players[0];
			// Find lord player ID
			for (var i = 0; i < self.players.length; i++) {
				if (self.players[i].side == "boss") {
					player = self.players[i];
				}
			}
			for (var i = 0; i < self.dungeonCompositions.length; i++) {
				if (i != self.currentFloor) continue;
				for (var n = 0; n < self.dungeonCompositions[i].length; n++) {
					var entity = self.dungeonCompositions[i][n][0];
					// Check if item is lord
					if (Item.ItemType.isLord(entity)) {
						var character = self.characterManager.SpawnLord(player.sID, entity);
						self.characters.push(character);
					}
				}
			}

			// Move on to next part of the dungeon
			var spawnPoints = self.map.SpawnLordRoom();

			setTimeout(function () {
				// Emit the seed for map generation
				self.io.to(self.matchID).emit("seed", { "s": self.map.seed, "t": self.map.dungeonType });
			}, 5000);

			self.characters.forEach(function (character) {
				spawnPoints.forEach(function (point) {
					if (character.id == point.characterID) {
						character.position = point.location;
						character.spawnPosition = point.location; //keeping original position for ai
					}
				});
			});

			// Emit the characters
			self.characters.forEach(function (character) {
				self.io.to(self.matchID).emit(Event.output.CHAR_CREATED,
					{ I: character.id, O: character.owner, E: character.entity, H: character.hp, L: character.position, M: character.maxhp });
			});
		} else if (areKnightsDead(self)) {
			// TODO: Implement end of game code, (results, etc)
			// Emit win condition event
			var winCondition = {
				side: "lord", // Knight side won
				type: "end" // End Match
			};
			self.io.to(self.matchID).emit(Event.output.WIN_CONDITION_MET, winCondition);
		}
	}

	// Lord Side Dungeon Type
	if (self.map.dungeonType == "lord") {
		if (isBossDead(self)) {
			// TODO: Move on to next dungeon or End Game
			if (self.currentFloor + 1 < self.dungeonCompositions.length) {
				// Continue to next floor
				self.currentFloor += 1;

				// Emit win condition event
				var winCondition = {
					side: "knight", // Knight side won
					type: "progress" // Progress to next floor
				};
				self.io.to(self.matchID).emit(Event.output.WIN_CONDITION_MET, winCondition);

				// Remove boss
				for (var i = 0; i < self.characters.length; i++) {
					if (!self.characters[i].knight) {
						self.characters.splice(i, 1);
						i--;
					}
				}

				// Revive any dead knights (restore 10% hp)
				for (var i = 0; i < self.characters.length; i++) {
					if (self.characters[i].dead()) {
						self.characters[i].hp = self.characters[i].maxhp * 0.1;
					}
				}

				// Spawn Lord (loop through dungeon compositions and find it)
				var Item = require("./Item");
				var player = self.players[0];
				// Find lord player ID
				for (var i = 0; i < self.players.length; i++) {
					if (self.players[i].side == "boss") {
						player = self.players[i];
					}
				}
				for (var i = 0; i < self.dungeonCompositions.length; i++) {
					if (i != self.currentFloor) continue;
					for (var n = 0; n < self.dungeonCompositions[i].length; n++) {
						var entity = self.dungeonCompositions[i][n][0];
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

				// Move on to next part of the dungeon
				self.map.seed = parseInt(Math.random() * 10000);
				var spawnPoints = self.map.SpawnDungeon();

				setTimeout(function () {
					// Emit the seed for map generation
					self.io.to(self.matchID).emit("seed", { "s": self.map.seed, "t": self.map.dungeonType });
				}, 5000);

				self.characters.forEach(function (character) {
					spawnPoints.forEach(function (point) {
						if (character.id == point.characterID) {
							character.position = point.location;
							character.spawnPosition = point.location; //keeping original position for ai
						}
					});
				});

				// Emit the characters
				self.characters.forEach(function (character) {
					self.io.to(self.matchID).emit(Event.output.CHAR_CREATED,
						{ I: character.id, O: character.owner, E: character.entity, H: character.hp, L: character.position, M: character.maxhp });
				});

			} else {
				// Knights have won the game by finishing the final dungeon

				// Emit win condition event
				var winCondition = {
					side: "knight", // Knight side won
					type: "finish" // Finish Game
				};
				self.io.to(self.matchID).emit(Event.output.WIN_CONDITION_MET, winCondition);

				clearInterval(self.gameLoop);

				// TODO: Save game data in mysql
			}
		} else if (areKnightsDead(self)) {
			// Emit win condition event
			var winCondition = {
				side: "lord", // Lord side won
				type: "finish" // Finish Game
			};
			self.io.to(self.matchID).emit(Event.output.WIN_CONDITION_MET, winCondition);
		}
	}
};

var isBossDead = function (self) {
	var isDead = self.characters.some(function (character) {
		if (character.boss && character.dead()) {
			return true;
		}
	});
	return isDead;
};

var areKnightsDead = function(self) {
	var allDead = self.knights.every(function (knight) { // Check if all knights are dead
		if (knight.dead()) return true;
	});
	return allDead;
}


module.exports.Check = ConditionCheck;