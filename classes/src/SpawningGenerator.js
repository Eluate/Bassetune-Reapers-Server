var MinPickStrategy = require("./picker/MinPickStrategy.js");
var RandomPickStrategy = require("./picker/RandomPickStrategy.js");
var DungeonModePickerFactory = require("./picker/DungeonModePickerFactory.js");
var LordRoomModePickerFactory = require("./picker/LordRoomModePickerFactory.js");

function SpawningGenerator() {
    this.board = null;
    this.knightIds = new Array();
    this.lordIds = new Array();
    this.lesserLordIds = new Array();
    this.creatureIds = new Array();
    this.trapIds = new Array();
    this.lordDoorId = null;    

    this.roomCellPickers = null;
    this.corrCellPickers = null;

    this.isDungeonMode = null;

    this.pickStrategy = new RandomPickStrategy();
    this.setPredictiveMode = function() {
        this.pickStrategy = new MinPickStrategy();
    };

    this.setBoard = function(aBoard) {
        this.board = aBoard;
        if (this.board.rooms().length > 1) {
            this.isDungeonMode = true;
        } else {
            this.isDungeonMode = false;
        }

    };
    this.setKnightIds = function(ids) {
        this.knightIds = ids;
    };
    this.setLordIds = function(ids) {
        this.lordIds = ids;
    };
    this.setLesserLordIds = function(ids) {
        this.lesserLordIds = ids;
    };
    this.setCreatureIds = function(ids) {
        this.creatureIds = ids;
    };
    this.setTrapIds = function(ids) {
        this.trapIds = ids;
    };

    this.setLordDoorId = function(id) {
        this.lordDoorId = id;
    };

    this.result = function() {
        this.priv_initCellPickers();

        var spawnPoints = new Array();
        if (this.isDungeonMode) {
            this.priv_spawnKnightsOn(spawnPoints);
            this.priv_spawnLesserLordsOn(spawnPoints);
            this.priv_spawnCreaturesOn(spawnPoints);
            this.priv_spawnTrapsOn(spawnPoints);
            this.priv_spawnLordDoorOn(spawnPoints);
        } else {
            this.priv_spawnKnightsOn(spawnPoints);
            this.priv_spawnLordsOn(spawnPoints);
        }
        return spawnPoints;
    };

    this.priv_spawnKnightsOn = function(spawnPointArray) {
        var roomSize = this.board.rooms().length;
        var knightSize = this.knightIds.length;

        if ( roomSize === 0) return;
        if ( knightSize === 0) return;

        var cellPicker = this.priv_firstRoomCellPicker().forKnights();

        for(i=0; i < knightSize; i++) {
            id = this.knightIds[i];
            cell = cellPicker.draw();
            if (!cell) return;
            x = cell.rowIndex();
            y = cell.columnIndex();
            spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
        }
    }

    this.priv_spawnLordsOn = function(spawnPointArray) {
        if (this.board.rooms().length === 0) return;
        if (this.lordIds.length === 0) return;

        var cellPicker = this.priv_lastRoomCellPicker().forLords();

        for(i=0; i < this.lordIds.length; i++) {
            id = this.lordIds[i];
            cell = cellPicker.draw();
            if (!cell) return;
            x = cell.rowIndex();
            y = cell.columnIndex();
            spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
        }
    }

    this.priv_spawnLesserLordsOn = function(spawnPointArray) {
        if (this.board.rooms().length === 0) return;
        if (this.lesserLordIds.length === 0) return;

        cellPicker = this.priv_lastRoomCellPicker().forLesserLords();

        for(i=0; i < this.lesserLordIds.length; i++) {
            id = this.lesserLordIds[i];
            cell = cellPicker.draw();
            if (!cell) return;
            x = cell.rowIndex();
            y = cell.columnIndex();
            spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
        }
    }

    this.priv_spawnTrapsOn = function(spawnPointArray) {
        var trapSize = this.trapIds.length;
        var roomSize = this.board.rooms().length;
        var corrSize = this.board.corridors().length;

        if (trapSize === 0) return;
        var roomsToSkip = 1;
        if (roomSize == 0) roomsToSkip = 0;
        var placeSize = (roomSize - roomsToSkip + corrSize);
        if (placeSize === 0) return;

        var distribAvg = Math.floor(trapSize / placeSize);
        var distribRest = this.trapIds.length - (distribAvg * placeSize);

        var trapIndex = 0;
        if (distribAvg !== 0) {    
            //Distributing AVG Traps in Rooms excluded First
            for(var roomIndex=1; roomIndex < roomSize; roomIndex++) {
                for(var t=0; t < distribAvg; t++) {
                    var id = this.trapIds[trapIndex];
                    var cell = this.priv_cellPickerForRoom(roomIndex).forTraps().draw();
                    if (!cell) {
                        distribRest++;
                        continue;
                    }
                    x = cell.rowIndex();
                    y = cell.columnIndex();
                    spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
                    trapIndex++;
                }            
            }  

            //Distributing AVG Traps in corridors
            for(corrIndex=0; corrIndex < corrSize; corrIndex++) {
                for(t=0; t < distribAvg; t++) {
                    id = this.trapIds[trapIndex];
                    cell = this.priv_cellPickerForCorridor(corrIndex).forTraps().draw();
                    //Se non riesco a piazzare l'elememento corrente
                    //aggiungo 1 al resto e continuo
                    //NOTA OTTIMIZZABILE: quando non riesco a piazzare, prendo la differenza, la sommo al resto e faccio break
                    if (!cell) { 
                        distribRest++; 
                        continue;
                    }
                    x = cell.rowIndex();
                    y = cell.columnIndex();
                    spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
                    trapIndex++;
                }            
            }
        }
        //Distributing Rest Traps in Rooms and then Corridors
        if (distribRest > 0) {
            cellPickers = new Array();
            cellPickers = cellPickers.concat(this.roomCellPickers);
            cellPickers.splice(0, 1); //Rimuovo First Room 
            cellPickers = cellPickers.concat(this.corrCellPickers);

            pickerIndex = 0;
            atLeastOneSpawn = false;
            for(t=0; t < distribRest; t++) {
                id = this.trapIds[trapIndex];
                cell = cellPickers[pickerIndex].forTraps().draw();
                if (cell) {
                    atLeastOneSpawn = true;
                    x = cell.rowIndex();
                    y = cell.columnIndex();
                    spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
                    trapIndex++;
                } else {
                    t--;
                }
                
                pickerIndex++;
                if (pickerIndex === cellPickers.length) {
                    if (!atLeastOneSpawn) break;
                    pickerIndex = 0;
                    atLeastOneSpawn = false;
                }
            }            
        }

    }

    this.priv_spawnCreaturesOn = function(spawnPointArray) {
        creatureSize = this.creatureIds.length;
        roomSize = this.board.rooms().length;
        if (creatureSize === 0) return;
        if (roomSize === 0) return;

        //Skip First room 
        //roomsToSkip = (roomSize<=1) ? roomSize : 2; 
        //placeSize = roomSize - roomsToSkip;
        placeSize = roomSize - 1;
        if (placeSize === 0) return;

        distribAvg = Math.floor(creatureSize / placeSize);
        distribRest = creatureSize - (distribAvg * placeSize); 
        
        creatureIndex = 0;
        if (distribAvg !== 0) {
            //Distributing AVG Creatures in Rooms excluded First
            for(roomIndex=1; roomIndex < roomSize; roomIndex++) {
                for(t=0; t < distribAvg; t++) {
                    id = this.creatureIds[creatureIndex];
                    cell = this.priv_cellPickerForRoom(roomIndex).forCreatures().draw();
                    //Se non riesco a piazzare l'elememento corrente
                    //aggiungo 1 al resto e continuo
                    //NOTA OTTIMIZZABILE: quando non riesco a piazzare, prendo la differenza, la sommo al resto e faccio break
                    if (!cell) { 
                        distribRest++; 
                        continue;
                    }

                    x = cell.rowIndex();
                    y = cell.columnIndex();
                    spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
                    creatureIndex++;
                }            
            }  
        }

        //Distributing Rest Creatures in Rooms
        if (distribRest > 0) {
                roomIndex = 1;
                atLeastOneSpawn = false;
                for(t=0; t < distribRest; t++) {
                    id = this.creatureIds[creatureIndex];
                    cell = this.priv_cellPickerForRoom(roomIndex).forCreatures().draw();
                    if (cell) {
                        atLeastOneSpawn = true;
                        x = cell.rowIndex();
                        y = cell.columnIndex();
                        spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
                        creatureIndex++;
                    } else {
                        t--;
                    }
                    
                    //OTTIMIZZABILE: Tenendo un array delle stanze che hanno celle libere, finche non si azzera.
                    roomIndex++;
                    if (roomIndex === roomSize) {
                        if (!atLeastOneSpawn) break;
                        roomIndex = 1;
                        atLeastOneSpawn = false;
                    }
                }            
        }
    }

    this.priv_spawnLordDoorOn = function(spawnPointArray) {
        if (!this.lordDoorId) return;
        if (!this.board.rooms().length === 0) return;
        
        id = this.lordDoorId;
        cell = this.priv_lastRoomCellPicker().forLordDoor().draw();
        x = cell.rowIndex();
        y = cell.columnIndex();
        spawnPointArray.push(this.priv_createSpawnPoint(id, x, y));
    
    }

    this.priv_initCellPickers = function() {
        //ROOMS
        this.roomCellPickers = new Array();
        var rooms = this.board.rooms();
        for(var i=0; i<rooms.length; i++) {
            var fact = this.isDungeonMode ? new DungeonModePickerFactory(rooms[i], this.pickStrategy):new LordRoomModePickerFactory(rooms[i], this.pickStrategy);
            this.roomCellPickers.push(fact);
        }

        //CORRIDORS
        this.corrCellPickers = new Array();
        corrs = this.board.corridors();
        for(i=0; i<corrs.length; i++) {
            this.corrCellPickers.push(new DungeonModePickerFactory(corrs[i], this.pickStrategy));
        }
    }

    this.priv_firstRoomCellPicker = function() {
        //return this.roomCellPickers[0];
        return this.priv_cellPickerForRoom(0);
    };
    this.priv_lastRoomCellPicker = function() {
        roomSize = this.board.rooms().length;
        //return this.roomCellPickers[roomSize-1];
        return this.priv_cellPickerForRoom(roomSize-1);
    };
    this.priv_cellPickerForRoom = function(index) {
        return this.roomCellPickers[index];
    };

    this.priv_cellPickerForCorridor = function(index) {
        return this.corrCellPickers[index];
    };


    this.priv_doorCellPicker = function() {
        return this.doorCellPicker;
    };

    this.priv_createSpawnPoint = function(id, cellRow, cellColumn) {
        return {"characterID": id, "location": {"x": cellRow, "y": cellColumn}}
    };
} 

module.exports = SpawningGenerator;
