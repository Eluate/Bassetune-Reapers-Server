require("./lib/mscorlib.js");
require("./lib/dungen.js");
var SpawningGenerator = require("./src/SpawningGenerator.js");
var SpawnGenUtil = require("./src/util/SpawnGenUtil.js");

var Map = function (self) {

	this.seed = parseInt(Math.random() * 10000);

	this.SpawnDungeon = function() {
		/***********************************/
		/******* DUNGEON GENERATION ********/
		/***********************************/
		//var gen = DunGenUtil.createServerGenWithLog();
		var dunGen = DunGenUtil.createServerGen();
		dunGen.setMapSize(40, 50);
		dunGen.setRoomsNumberRange(4, 7);
		dunGen.setRoomSizeRange(9, 15);
		dunGen.setCorridorSizeRange(5, 8);

		dunGen.setSeed(self.map.seed);
		console.log("Seed: " + self.map.seed);

		var dunMatrix = dunGen.asMatrix();
		//DunGenUtil.printMatrix(matrix);

		/***********************************/
		/******** SPAWN GENERATION *********/
		/***********************************/
		var board = dunGen.asBoard();
		var knightIds = SpawnGenUtil.sortCharacters(self.characters, "knight");
		var lesserLordIds = SpawnGenUtil.sortCharacters(self.characters, "lesserlord");
		var creatureIds = SpawnGenUtil.sortCharacters(self.characters, "minion");
		var trapIds = SpawnGenUtil.sortCharacters(self.characters, "trap");
		var lordDoorId = "lorddoor";

		var spawnGen = new SpawningGenerator();
		//spawnGen.setPredictiveMode();

		spawnGen.setBoard(board);
		spawnGen.setKnightIds(knightIds);
		spawnGen.setLesserLordIds(lesserLordIds);
		spawnGen.setCreatureIds(creatureIds);
		spawnGen.setTrapIds(trapIds);
		spawnGen.setLordDoorId(lordDoorId);

		var spawnPoints = spawnGen.result();

		SpawnGenUtil.print(dunMatrix, spawnPoints, self);

		return spawnPoints;
	};

	function SpawnLordRoom() {
		/***********************************/
		/******* DUNGEON GENERATION ********/
		/***********************************/
		//var gen = DunGenUtil.createServerGenWithLog();
		var dunGen = DunGenUtil.createServerGen();
		dunGen.setMapSize(10, 10);
		dunGen.setRoomsNumberRange(1, 1);
		dunGen.setRoomSizeRange(10, 10);
		//dunGen.setCorridorSizeRange(0, 0);
		//dunGen.setSeed(0);

		var dunMatrix = dunGen.asMatrix();
		//DunGenUtil.printMatrix(matrix);

		/***********************************/
		/******** SPAWN GENERATION *********/
		/***********************************/
		var board = dunGen.asBoard();
		var knightIds = SpawnGenUtil.ids(101, 3);
		var lordIds = SpawnGenUtil.ids(201, 1);

		var spawnGen = new SpawningGenerator();
		spawnGen.setBoard(board);
		spawnGen.setKnightIds(knightIds);
		spawnGen.setLordIds(lordIds);

		var spawnPoints = spawnGen.result();

		SpawnGenUtil.print(dunMatrix, spawnPoints, self);
	}
};

module.exports = Map;