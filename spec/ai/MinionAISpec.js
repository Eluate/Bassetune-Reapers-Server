describe("MinionAISpec:", function() {
    var MinionAI = require("../../classes/ai/MinionAI");

    it("Case: No Minions and No Knight -> No Update", function() {
        var mockedCharacters = [];
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasBeenCalled()).toBeFalsy();
    }); 
    
    it("Case: One Minion and No Knight -> No Update", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasBeenCalled()).toBeFalsy();
    });

    it("Case: One Minion and One Knight (Out of range) -> No Update", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        mockedCharacters.push(new KnightMock("Knight01", 100, 100));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasBeenCalled()).toBeFalsy();
    });  

    it("Case: One Minion and One Knight (Within range) -> One Update", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        mockedCharacters.push(new KnightMock("Knight01", 2, 2));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasBeenCalledTimes(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 2, 2)).toBeTruthy();
    });
    
    it("Case: Four Minions and One Knight (Within range) -> Four Updates", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        mockedCharacters.push(new MinionMock("Minion02", 0, 1));
        mockedCharacters.push(new MinionMock("Minion03", 1, 0));
        mockedCharacters.push(new MinionMock("Minion04", 1, 1));

        mockedCharacters.push(new KnightMock("Knight01", 2, 2));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasBeenCalledTimes(4)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 2, 2)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion02", 2, 2)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion03", 2, 2)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion04", 2, 2)).toBeTruthy();
    });    

    it("Case: Four Minions and One Knight (One Within range) -> One Update", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        mockedCharacters.push(new MinionMock("Minion02", 0, 100));
        mockedCharacters.push(new MinionMock("Minion03", 100, 0));
        mockedCharacters.push(new MinionMock("Minion04", 100, 100));

        mockedCharacters.push(new KnightMock("Knight01", 2, 2));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasBeenCalledTimes(1)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 2, 2)).toBeTruthy();
    });

    it("Case: Four Minions and Two Knights (Within range) -> Four Updates", function() {
        var mockedCharacters = [];
        mockedCharacters.push(new MinionMock("Minion01", 0, 0));
        mockedCharacters.push(new MinionMock("Minion02", 1, 1));
        mockedCharacters.push(new MinionMock("Minion03", 198, 198));
        mockedCharacters.push(new MinionMock("Minion04", 199, 199));

        mockedCharacters.push(new KnightMock("Knight01", 2, 2));
        mockedCharacters.push(new KnightMock("Knight01", 200, 200));
        
        var mockedLocation = new LocationMock();

        var ai = new MinionAI(mockedCharacters, mockedLocation);
        ai.setAggroRadius(5);
        ai.execute();

        expect(mockedLocation.hasBeenCalledTimes(4)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion01", 2, 2)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion02", 2, 2)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion04", 200, 200)).toBeTruthy();
        expect(mockedLocation.hasUpdatedCharWithDestination("Minion04", 200, 200)).toBeTruthy();
    });        
});



var LocationMock = function() {
    this.updatedChars = [];
    this.callCount = 0;
    /* Location API: UpdateDestination
       @param character: Character object    
       @param destination: Number Array with Length = 2, where [0] = x position and [1] = y position
    */
    this.UpdateDestination = function(character, destination) {
        this.updatedChars.push({"char": character, "dest": destination});
        this.callCount++;
    };
    this.hasBeenCalled = function() {
        return this.callCount > 0;
    };
    this.hasBeenCalledTimes = function(count) {
        return this.callCount == count;
    };
    this.hasUpdatedCharWithDestination = function(charId, x, y) {
        for (var i=0; i< this.updatedChars.length; i++) {
            var each = this.updatedChars[i];
            if (each.char._id == charId && each.dest[0] == x && each.dest[1] == y) return true;
        }
        return false;
    };
};

var MinionMock = function(id, x, y) {
    this._id = id;
    this.entity = 3400;
    this.position = {"x": x, "y": y};
};

var KnightMock = function(id, x, y) {
    this._id = id;
    this.entity = 0;
    this.position = {"x": x, "y": y};
};