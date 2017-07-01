var MinionAI = require("../../classes/ai/MinionAI");

describe("MinionAISpec: Base", function() {
    it("Case: No Minions and No Knight -> Nothing ToDo", function() {
        var mockedCharacters = [];
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    }); 
});

describe("MinionAISpec: Looking for Knight to aggro", function() {  
    it("Case: One Minion and One Knight (Out of range) -> No Aggroing", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        mockedCharacters.push(new KnightMock("Knight01", 100, 100));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    });  

    it("Case: One Minion and One Knight (Within range) -> Start Aggroing", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        mockedCharacters.push(new KnightMock("Knight01", 2, 2));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 2, 2)).toBeTruthy();
    });
    
    it("Case: Two Minions and One Knight (Within range) -> Two Start Aggroing", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        mockedCharacters.push(new MinionMock("Minion02", 0, 1));
        mockedCharacters.push(new KnightMock("Knight01", 2, 2));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated(2)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 2, 2)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion02", 2, 2)).toBeTruthy();
    });    

    it("Case: One Minion aggroing One Knight, looses target, not too far from home -> Start Heading Home", function() {
        var mockedCharacters = [];
        var minion = new MinionMock("Minion01", 0, 0, 5, 5);
        minion.isAggroing = true;
        mockedCharacters.push(minion);

        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 5, 5)).toBeTruthy();
        expect(minion.isHeadingHome).toBeTruthy();
        expect(minion.isAggroing).toBeFalsy();
        expect(minion.isPatrolling).toBeFalsy();
    });

    it("Case: One Minion aggroing One Knight, looses target, too far from home -> Start Heading Home", function() {
        var mockedCharacters = [];
        var minion = new MinionMock("Minion01", 0, 0, 5, 5);
        minion.isAggroing = true;
        mockedCharacters.push(minion);

        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 5, 5)).toBeTruthy();
        expect(minion.isHeadingHome).toBeTruthy();
        expect(minion.isAggroing).toBeFalsy();
        expect(minion.isPatrolling).toBeFalsy();
    });

});

describe("MinionAISpec: Too Far From Home", function() {
    it("Case: One Minion too far from home -> Start Heading Home", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0, 5, 5));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(3);
        ai.execute();

        expect(mockedLocation.hasCharUpdated(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 5, 5)).toBeTruthy();
    });
    
    it("Case: One Minion not too far from home -> No Update", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0, 2, 2));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(3);
        ai.execute();

        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    });
    
    it("Case: One Minion home and One Minion too far -> First Minion Start Heading Home", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0, 0, 0));
        mockedCharacters.push(new MinionMock("Minion02", 0, 0, 5, 5));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(3);
        ai.execute();

        expect(mockedLocation.hasCharUpdated(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 0, 0)).toBeFalsy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion02", 5, 5)).toBeTruthy();
    });
});

describe("MinionAISpec: Heading Home", function() {
    it("Case: One Minion going to home -> Keep Going Home", function() {
        var mockedCharacters = [];
        var minion = new MinionMock("Minion01", 0, 0, 1, 1);
        minion.isHeadingHome = true;

        mockedCharacters.push(minion);
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setMaxDistanceFromHome(3);
        ai.execute();

        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
        expect(minion.isHeadingHome).toBeTruthy();
        expect(minion.isAggroing).toBeFalsy();
        expect(minion.isPatrolling).toBeFalsy();
    });
    it("Case: One Minion reach home -> Start Patrolling", function() {
        var mockedCharacters = [];
        var minion = new MinionMock("Minion01", 0, 0, 0, 0);
        minion.isHeadingHome = true;

        mockedCharacters.push(minion);
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setMaxDistanceFromHome(3);
        ai.execute();

        expect(mockedLocation.hasCharUpdated()).toBeFalsy();

        expect(minion.isHeadingHome).toBeFalsy();
        expect(minion.isAggroing).toBeFalsy();
        expect(minion.isPatrolling).toBeTruthy();
    });
    it("Case: One Minion meets One Knight -> Start Aggroing", function() {
        var mockedCharacters = [];
        var minion = new MinionMock("Minion01", 0, 0, 5, 5);
        minion.isHeadingHome = true;

        mockedCharacters.push(minion);
        mockedCharacters.push(new KnightMock("Knight01", 1, 1));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setMaxDistanceFromHome(3);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 1, 1));

        expect(minion.isHeadingHome).toBeFalsy();
        expect(minion.isAggroing).toBeTruthy();
        expect(minion.isPatrolling).toBeFalsy();
    });

});

var LocationMock = function() {
    this.updatedChars = [];
    /* Location API: UpdateDestination
       @param character: Character object    
       @param destination: Number Array with Length = 2, where [0] = x position and [1] = y position
    */
    this.UpdateDestination = function(character, destination) {
        this.updatedChars.push({"char": character, "dest": destination});
    };

    /* Location API: distance
       @param fromPosition: source position {x: INT, y: INT}    
       @param toPosition: dest position {x: INT, y: INT}    
    */
    this.distance = function(fromPosition, toPosition) {
        var diffX = fromPosition.x - toPosition.x;
		var diffY = fromPosition.y - toPosition.y;
		return Math.sqrt((diffX * diffX) + (diffY * diffY));
    };

    /* MOCK APIs */
    this.hasCharUpdated = function(count) {
        if (!count) return this.updatedChars.length > 0;
        return this.updatedChars.length == count;
    };
    this.hasUpdatedCharWithDestination = function(charId, x, y) {
        for (var i=0; i< this.updatedChars.length; i++) {
            var each = this.updatedChars[i];
            if (each.char._id == charId && each.dest[0] == x && each.dest[1] == y) return true;
        }
        return false;
    };
};

var MinionMock = function(id, x, y, spawnX, spawnY) {
    /* CHARACTER STANDARD DATA */
    this.entity = 3400;
    this.position = {"x": x, "y": y};
    if (!spawnX) spawnX = x;
    if (!spawnY) spawnY = y;
    this.spawnPosition = {"x": spawnX, "y": spawnY};

    /* AI DATA */
    this.isAggroing = false;
    this.isHeadingHome = false;
    this.isPatrolling = false;

    /* MOCK DATA */
    this._id = id;
};

var KnightMock = function(id, x, y) {
    this._id = id;
    this.entity = 0;
    this.position = {"x": x, "y": y};
};