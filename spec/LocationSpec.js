var Location = require("../classes/Location");

describe("LocationSpec: Walkable Places Around: ", function() {
	it("Case: 2x2 all walkable with ray within size", function() {
		var location = new Location(new RoomMock([
												  [0,0],
												  [0,0]
												]));

        var result = location.walkablePlacesAround({"x": 1, "y": 1}, 1);
        expect(result.length).toEqual(4);
		expect(result[0]).toEqual({"x": 0, "y": 0});
		expect(result[1]).toEqual({"x": 0, "y": 1});
		expect(result[2]).toEqual({"x": 1, "y": 0});
		expect(result[3]).toEqual({"x": 1, "y": 1});
    }); 
	it("Case: 2x2 with 2 cell not walkable with ray within size", function() {
		var location = new Location(new RoomMock([
												  [1,0],
												  [1,0]
												]));

        var result = location.walkablePlacesAround({"x": 1, "y": 1}, 1);
        expect(result.length).toEqual(2);
		expect(result[0]).toEqual({"x": 0, "y": 1});
		expect(result[1]).toEqual({"x": 1, "y": 1});
    }); 

	it("Case: 2x2 all walkable with ray oversize", function() {
		var location = new Location(new RoomMock([
												  [0,0],
												  [0,0]
												]));
        var result = location.walkablePlacesAround({"x": 1, "y": 1}, 5);
        expect(result.length).toEqual(4);
		expect(result[0]).toEqual({"x": 0, "y": 0});
		expect(result[1]).toEqual({"x": 0, "y": 1});
		expect(result[2]).toEqual({"x": 1, "y": 0});
		expect(result[3]).toEqual({"x": 1, "y": 1});
    }); 
});


var RoomMock = function(grid) {
    /* ROOM STANDARD DATA */
    this.map = {};
    this.map.grid = grid;
};
