var CSharpUtil = require("./CSharpUtil.js");

function SpawnGenUtil() {}

SpawnGenUtil.ids = function(firstId, howManyIds) {
    result = new Array();
    result.push(firstId);
    for(i=1; i<howManyIds; i++) {
        result.push(firstId+i);
    }
    return result;
};

SpawnGenUtil.sortCharacters = function(characterArray, type) {
	var characters = [];
	if (type == "knight") {
		for (var i = 0; i < characterArray.length; i++) {
			if (ItemType.isKnight(characterArray[i].entity)) {
				characters.push(characterArray[i].id);
			}
		}
	} else if (type == "lord") {
		for (var i = 0; i < characterArray.length; i++) {
			if (ItemType.isLord(characterArray[i].entity)) {
				characters.push(characterArray[i].id);
			}
		}
	} else if (type == "lesserlord") {
		for (var i = 0; i < characterArray.length; i++) {
			if (ItemType.isLesserLord(characterArray[i].entity)) {
				characters.push(characterArray[i].id);
			}
		}
	} else if (type == "minion") {
		for (var i = 0; i < characterArray.length; i++) {
			if (ItemType.isMinion(characterArray[i].entity)) {
				characters.push(characterArray[i].id);
			}
		}
	} else if (type == "trap") {
		for (var i = 0; i < characterArray.length; i++) {
			if (ItemType.isTrap(characterArray[i].entity)) {
				characters.push(characterArray[i].id);
			}
		}
	}
	return characters;
};


SpawnGenUtil.print = function(csDungeonMatrix, spawnPoints, self) {
    jsMatrix = CSharpUtil.csMatrixToJs(csDungeonMatrix);
    applySpawnPoints(spawnPoints,jsMatrix, self);

    printSpawnPoints(spawnPoints);
    printLegend();
    printJsMatrix(jsMatrix);
};


function applySpawnPoints(spawnPoints, jsMatrix, self) {
    for (var i = 0; i < spawnPoints.length; i++) {
    	for (var n = 0; n < self.characters.length; n++) {
				var character = self.characters[n];
				var each = spawnPoints[i];
				var type = -1;
    		if (each.characterID.toString().startsWith("lor")) type = "D";      //Door
    		else if (each.characterID != character.id) continue;
				else if (ItemType.isKnight(character.entity)) type = "K";                //Knight
				else if (ItemType.isLord(character.entity)) type = "L";             //Lord
				else if (ItemType.isLesserLord(character.entity)) type = "M";       //LesserLord
				else if (ItemType.isMinion(character.entity)) type = "C";           //Minion
				else if (ItemType.isTrap(character.entity)) type = "T";             //Trap

				row = each.location.x;
				col = each.location.y;
				jsMatrix[row][col] = type;
			}
    }
}

function printLegend() {
    console.log("");
    console.log("Legend:");
    console.log("[K=Knight] [L=Lord] [M=LesserLord]");
    console.log("[C=Creature] [T=Trap] [D=LordDoor]");
    console.log("[1=Wall] [0=Void]");
}

function printSpawnPoints(spawnPoints) {
    console.log("");
    console.log("SpawnPoints:");
    console.log(spawnPoints);
}

function printJsMatrix(jsMatrix) {
    console.log("");
    for(row=0; row<jsMatrix.length; row++) {
        rowString = "";
        for(col=0; col<jsMatrix[0].length; col++) {
            rowString = rowString.concat(jsMatrix[row][col]);
            if (col < jsMatrix[0].length-1) rowString = rowString.concat(" ");
        }
        console.log(rowString);  
    }
}

ItemType = {
	isKnight: function(itemID)
	{
		return itemID == 0 || itemID == 1;
	},
	isItem: function(itemID)
	{
		return !(itemID < 1000 || itemID >= 2500);
	},
	isConsumable: function(itemID)
	{
		return !(itemID < 1000 || itemID >= 2400);
	},
	isAmmo: function(itemID)
	{
		return !(itemID < 1900 || itemID >= 2000);
	},
	isWeapon: function(itemID)
	{
		return !(itemID < 2000 || itemID >= 2400);
	},
	isArmor: function(itemID)
	{
		return !(itemID < 2400 || itemID >= 2500);
	},
	isLord: function(itemID)
	{
		return !(itemID < 3000 || itemID >= 3200);
	},
	isLesserLord: function(itemID)
	{
		return !(itemID < 3200 || itemID >= 3400);
	},
	isMinion: function(itemID)
	{
		return !(itemID < 3400 || itemID >= 3600);
	},
	isTrap: function(itemID)
	{
		return !(itemID < 3600 || itemID >= 3800);
	},
	isOffensiveAbility: function(itemID)
	{
		return !(itemID < 2500 || itemID >= 2750);
	},
	isDefensiveAbility: function(itemID)
	{
		return !(itemID < 2750 || itemID >= 3000);
	}
};

module.exports = SpawnGenUtil;