require("./lib/mscorlib.js");
require("./lib/dungen.js");
var SpawningGenerator = require("./src/DungSpawningGenerator.js");
var SpawnGenUtil = require("./src/util/SpawnGenUtil.js");
var CSharpUtil = require("./src/util/CSharpUtil.js");
var PF = require('pathfinding');

var Map = function (self) {

    this.seed = parseInt(Math.random() * 10000);
    this.pfGrid = null; // Pathfinding grid for movement of AI
    this.doorLocation = {x: 0, y: 0}; // The location of the door for checking win conditions
    this.dungeonType = "normal"; // "normal" or "lord", determines type of dungeon to be generated
    this.dungeonCount = 0; // Increment when knights successfully complete normal + lord dungeon

    this.SpawnDungeon = function () {
        this.dungeonType = "normal";
        this.pfGrid = new PF.Grid(40, 50);
        /***********************************/
        /******* DUNGEON GENERATION ********/
        /***********************************/
        //var gen = DunGenUtil.createServerGenWithLog();
        var dunGen = DunGenUtil.createServerGen();
        dunGen.setMapSize(40, 50);
        dunGen.setRoomsNumberRange(4, 7);
        dunGen.setRoomSizeRange(9, 15);
        dunGen.setCorridorLengthRange(5, 8);
        dunGen.setCorridorWidthRange(4, 4);

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
        spawnGen.setCellNextWallExclusionMode();
        spawnGen.setBoard(board);
        spawnGen.setKnightIds(knightIds);
        spawnGen.setLesserLordIds(lesserLordIds);
        spawnGen.setCreatureIds(creatureIds);
        spawnGen.setTrapIds(trapIds);
        spawnGen.setLordDoorId(lordDoorId);

        var spawnPoints = spawnGen.result();
        self.map.grid = CSharpUtil.csMatrixToJs(dunMatrix);

        // Loop through map and set pathfinding grid
        for (var x = 0; x < self.map.grid.length; x++) {
            for (var y = 0; y < self.map.grid[x].length; y++) {
                if (self.map.grid[x][y] == 0) {
                    self.map.pfGrid.setWalkableAt(x, y, true);
                } else {
                    self.map.pfGrid.setWalkableAt(x, y, false);
                }
            }
        }

        // Set location of boss door
        for (var i = 0; i < spawnPoints.length; i++) {
            if (spawnPoints[i].characterID == "lorddoor") {
                this.doorLocation = spawnPoints[i].location;
            }
        }

        SpawnGenUtil.print(dunMatrix, spawnPoints, self);

        return spawnPoints;
    };

    this.SpawnLordRoom = function () {
        this.dungeonType = "lord";
        this.pfGrid = new PF.Grid(20, 20);
        /***********************************/
        /******* DUNGEON GENERATION ********/
        /***********************************/
        //var gen = DunGenUtil.createServerGenWithLog();
        var dunGen = DunGenUtil.createServerGen();
        dunGen.setMapSize(20, 20);
        dunGen.setRoomsNumberRange(1, 1);
        dunGen.setRoomSizeRange(20, 20);
        dunGen.setCorridorLengthRange(0, 0);
        dunGen.setCorridorWidthRange(0, 0);

        dunGen.setSeed(self.map.seed);

        var dunMatrix = dunGen.asMatrix();
        //DunGenUtil.printMatrix(matrix);

        /***********************************/
        /******** SPAWN GENERATION *********/
        /***********************************/
        var board = dunGen.asBoard();
        var knightIds = SpawnGenUtil.sortCharacters(self.characters, "knight");
        var lordIds = SpawnGenUtil.sortCharacters(self.characters, "lord");
        var lordDoorId = "lorddoor";

        var spawnGen = new SpawningGenerator();
        spawnGen.setCellNextWallExclusionMode();
        spawnGen.setBoard(board);
        spawnGen.setKnightIds(knightIds);
        spawnGen.setLordIds(lordIds);
        spawnGen.setLordDoorId(lordDoorId);

        var spawnPoints = spawnGen.result();
        self.map.grid = CSharpUtil.csMatrixToJs(dunMatrix);

        // Loop through map and set pathfinding grid
        for (var x = 0; x < self.map.grid.length; x++) {
            for (var y = 0; y < self.map.grid[x].length; y++) {
                if (self.map.grid[x][y] == 0) {
                    self.map.pfGrid.setWalkableAt(x, y, true);
                } else {
                    self.map.pfGrid.setWalkableAt(x, y, false);
                }
            }
        }

        SpawnGenUtil.print(dunMatrix, spawnPoints, self);

        return spawnPoints;
    }
};

module.exports = Map;