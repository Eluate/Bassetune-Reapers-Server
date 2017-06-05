var MinionAI = require("../../classes/ai/MinionAI");

describe("MinionAISpec: Base", function() {
    it("Case: No Minions and No Knight -> Nothing ToDo", function() {
        var mockedCharacters = [];
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    }); 
});

describe("MinionAISpec: Idling", function() {  
    it("Case: One Minion and One Knight (Out of range) -> Start Patrolling", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 0, 0, "IDLE");
        mockedCharacters.push(minion01);
        mockedCharacters.push(new KnightMock("Knight01", 100, 100));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(minion01.isPatrolling()).toBeTruthy();
        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    });  

    it("Case: One Minion and One Knight (Within range) -> Start Aggroing", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 0, 0, "IDLE");
        mockedCharacters.push(minion01);
        mockedCharacters.push(new KnightMock("Knight01", 2, 2));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(minion01.isAggroing()).toBeTruthy();
        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
        
    });
    
    it("Case: Two Minions and One Knight (Within range) -> Two Start Aggroing", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 0, 0, "IDLE");
        var minion02 = new MinionMock("Minion02", 0, 1, 0, 1, "IDLE");
        mockedCharacters.push(minion01);
        mockedCharacters.push(minion02);
        mockedCharacters.push(new KnightMock("Knight01", 2, 2));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(minion01.isAggroing()).toBeTruthy(); 
        expect(minion02.isAggroing()).toBeTruthy();
        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    });

    it("Case: One Minion too far from home -> Start Heading Home", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 10, 10, "IDLE");
        mockedCharacters.push(minion01);
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(minion01.isHeadingHome()).toBeTruthy(); 
        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    });    

    it("Case: One Minion not too far from home -> Start Heading Home", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 3, 3, "IDLE");
        mockedCharacters.push(minion01);
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(minion01.isHeadingHome()).toBeTruthy(); 
        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    });
});

describe("MinionAISpec: Aggroing", function() {
    it("Case: One Minion looses target -> Start Idling", function() {
        var mockedCharacters = [];
        var minion = new MinionMock("Minion01", 0, 0, 7, 7, "AGGRO");
        mockedCharacters.push(minion);

        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
        expect(minion.isIdling()).toBeTruthy();
    });
});

describe("MinionAISpec: Heading Home", function() {
    it("Case: One Minion start to go home -> Heading Home", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 10, 10, "HEADHOME");
        mockedCharacters.push(minion01);
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(minion01.isHeadingHome()).toBeTruthy();
        expect(mockedLocation.hasCharUpdated(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 0, 0)).toBeTruthy();
    });
    
    it("Case: One Minion is going to home -> Keep Going Home", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 10, 10, "HEADHOME");
        minion01.setDestination(0, 0);
        mockedCharacters.push(minion01);
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
        expect(minion01.isHeadingHome()).toBeTruthy();
    });
    it("Case: One Minion reach home -> Start Patrolling", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 0, 0, "HEADHOME");
        mockedCharacters.push(minion01);
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.setMaxDistanceFromHome(5);
        ai.execute();

        expect(minion01.isPatrolling()).toBeTruthy();
        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
    });
    it("Case: One Minion meets One Knight -> Start Aggroing", function() {
        var mockedCharacters = [];
        var minion01 = new MinionMock("Minion01", 0, 0, 5, 5, "HEADHOME");
        mockedCharacters.push(minion01);
        mockedCharacters.push(new KnightMock("Knight01", 3, 3));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setMaxDistanceFromHome(5);
        ai.setAggroRadius(5);
        ai.execute();

        expect(minion01.isAggroing()).toBeTruthy();
        expect(mockedLocation.hasCharUpdated()).toBeFalsy();
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

var MinionMock = function(id, spawnX, spawnY, x, y, state) {
    /* CHARACTER STANDARD DATA */
    this.entity = 3400;
    this.position = {"x": x, "y": y};
    this.spawnPosition = {"x": spawnX, "y": spawnY};
    this.path = [];
    this.setDestination = function(x, y) {
        this.path.push([x, y]);
    };

    /* AI DATA */
    this.ai = {};
    this.ai.state = !state?null:state;
    this.isAggroing = function() {return this.ai.state === "AGGRO"};
    this.isHeadingHome = function() {return this.ai.state === "HEADHOME"};
    this.isPatrolling = function() {return this.ai.state === "PATROL"};
    this.isIdling = function() {return this.ai.state === "IDLE"};

    /* MOCK DATA */
    this._id = id;
};

var KnightMock = function(id, x, y) {
    this._id = id;
    this.entity = 0;
    this.position = {"x": x, "y": y};
};