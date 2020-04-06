var DungPickerFactorySelector = require("./picker/selector/DungPickerFactorySelector.js");
var BaseSpawningAlgorithm = require("./spawner/BaseSpawningAlgorithm.js");

function DungSpawningGenerator() {
    this.algo = new BaseSpawningAlgorithm(new DungPickerFactorySelector());

    this.setPredictiveMode = function () {
        this.algo.setPredictiveMode();
    };
    this.setCellNextWallExclusionMode = function () {
        this.algo.setCellNextWallExclusionMode();
    };
    this.setBoard = function (aBoard) {
        this.algo.setBoard(aBoard);
    };
    this.setKnightIds = function (ids) {
        this.algo.setKnightIds(ids);
    };
    this.setLordIds = function (ids) {
        this.algo.setLordIds(ids);
    };
    this.setLesserLordIds = function (ids) {
        this.algo.setLesserLordIds(ids);
    };
    this.setCreatureIds = function (ids) {
        this.algo.setCreatureIds(ids);
    };
    this.setTrapIds = function (ids) {
        this.algo.setTrapIds(ids);
    };
    this.setLordDoorId = function (id) {
        this.algo.setLordDoorId(id);
    };

    this.result = function () {
        return this.algo.result();
    };
}

module.exports = DungSpawningGenerator;
