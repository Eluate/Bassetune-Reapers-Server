function DoorCellPicker(room, pickStrategy) {
    this.room = room;
    this.pickStrategy = pickStrategy;

    this.draw = function () {
        //seleziona i lati senza corridoio.
        ranges = [];
        if (!this.room.hasCorridorAtEast()) {
            cellMin = this.room.topRightVertex();
            cellMax = this.room.bottomRightVertex();
            ranges.push(cellMin.cells(cellMax));
        }
        if (!this.room.hasCorridorAtSouth()) {
            cellMin = this.room.bottomLeftVertex();
            cellMax = this.room.bottomRightVertex();
            ranges.push(cellMin.cells(cellMax));
        }
        if (!this.room.hasCorridorAtWest()) {
            cellMin = this.room.topLeftVertex();
            cellMax = this.room.bottomLeftVertex();
            ranges.push(cellMin.cells(cellMax));
        }
        if (!this.room.hasCorridorAtNorth()) {
            cellMin = this.room.topLeftVertex();
            cellMax = this.room.topRightVertex();
            ranges.push(cellMin.cells(cellMax));
        }

        //Seleziono le celle di uno dei lati
        index = pickStrategy.drawBetween(0, ranges.length - 1);
        cells = ranges[index];

        //Seleziono la cella nel mezzo di quel lato
        index = Math.floor(cells.length / 2);
        selected = cells[index];
        return selected;
    };
}

module.exports = DoorCellPicker;
