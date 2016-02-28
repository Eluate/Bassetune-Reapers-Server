/*
 Class for the map (useful for collisions in usage with location)
 */
var Room = function (roomTiles, map) {
  this.tiles = roomTiles;
  this.edgeTiles = [];
  this.connectedRooms = [];
  this.roomSize = this.tiles.length;
  this.isAccessibleFromMainRoom = false;
  this.isMainRoom = false;

  for (var i = 0; i < this.tiles.length; i++) {
    var tile = this.tiles[i];
    for (var x = tile[0] - 1; x <= tile[0] + 1; x++) {
      for (var y = tile[1] - 1; y <= tile[1] + 1; y++) {
        if (x == tile[0] || y == tile[1]) {
          if (map[x][y] == 1) {
            this.edgeTiles.push(tile);
          }
        }
      }

    }
  }
};

Room.prototype = {
  SetAccessibleFromMainRoom: function () {
    if (!this.isAccessibleFromMainRoom) {
      this.isAccessibleFromMainRoom = true;
      for (var i = 0; i < this.connectedRooms; i++) {
        this.connectedRooms[i].SetAccessibleFromMainRoom();
      }
    }
  },

  IsConnected: function (otherRoom) {
    return this.connectedRooms.indexOf(otherRoom) > -1;
  }
};

Room.ConnectRooms = function (roomA, roomB) {
  if (roomA.isAccessibleFromMainRoom) {
    roomB.SetAccessibleFromMainRoom();
  }
  else if (roomB.isAccessibleFromMainRoom) {
    roomA.SetAccessibleFromMainRoom();
  }
  roomA.connectedRooms.push(roomB);
  roomB.connectedRooms.push(roomA);
};

var Map = function () {
  var height = 72;
  var width = 128;
  var randomFillPercent = 0.48;
  // Set up 2D array for the map
  this.geometry = new Array(width);
  for (var i = 0; i < width; i++) {
    this.geometry[i] = new Array(height);
  }
  // Generate the seed
  this.seed = 1;
  // Randomly fill the map
  var seedCounter = this.seed;
  var random = function () {
    var x = Math.sin(seedCounter++) * 10000;
    return x - Math.floor(x);
  };
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
        // Set as wall
        this.geometry[x][y] = 1;
      }
      else {
        // Randomly choose if wall or not
        this.geometry[x][y] = (random() < randomFillPercent) ? 1 : 0;
      }
    }
  }
  // Smooth the map
  var IsInMapRange = function (x, y) {
    return x >= 0 && x < width && y >= 0 && y < height;
  };
  var getSurroundingWallCount = function (gridX, gridY, map) {
    var wallCount = 0;
    for (var neighbourX = gridX - 1; neighbourX <= gridX + 1; neighbourX++) {
      for (var neighbourY = gridY - 1; neighbourY <= gridY + 1; neighbourY++) {
        if (IsInMapRange(neighbourX, neighbourY)) {
          if (neighbourX != gridX || neighbourY != gridY) {
            wallCount += map[neighbourX][neighbourY];
          }
        }
        else {
          wallCount++;
        }
      }

    }

    return wallCount;
  };
  var smoothMap = function (map) {
    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var neighbourWallTiles = getSurroundingWallCount(x, y, map);
        if (neighbourWallTiles > 4) {
          map[x][y] = 1;
        }
        else if (neighbourWallTiles < 4) {
          map[x][y] = 0;
        }
      }
    }
  };
  for (var i = 0; i < 5; i++) {
    smoothMap(this.geometry);
  }
  // Process Map
  var GetRegionTiles = function (startX, startY, map) {
    var tiles = [];
    // Set up 2D array for the mapFlags
    var mapFlags = new Array(width);
    for (var i = 0; i < width; i++) {
      mapFlags[i] = (new Array(height)).fill(0);
    }
    var tileType = map[startX][startY];

    var queue = [];
    queue.push([startX, startY]);
    mapFlags[startX][startY] = 1;

    while (queue.length > 0) {
      var tile = queue.shift();
      tiles.push(tile);
      for (var x = tile[0] - 1; x <= tile[0] + 1; x++) {
        for (var y = tile[1] - 1; y <= tile[1] + 1; y++) {
          if (IsInMapRange(x, y) && (y == tile[1] || x == tile[0])) {
            if (mapFlags[x][y] == 0 && map[x][y] == tileType) {
              mapFlags[x][y] = 1;
              queue.push([x, y]);
            }
          }
        }
      }
    }
    return tiles;
  };
  var GetLine = function (from, to) {
    var line = [];

    var x = from[0];
    var y = from[1];

    var dx = to[0] - from[0];
    var dy = to[1] - from[1];

    var inverted = false;
    var step = Math.Sign(dx);
    var gradientStep = Math.Sign(dy);

    var longest = Math.abs(dx);
    var shortest = Math.abs(dy);

    if (longest < shortest) {
      inverted = true;
      longest = Math.abs(dy);
      shortest = Math.abs(dx);

      step = Math.Sign(dy);
      gradientStep = Math.Sign(dx);
    }

    var gradientAccumulation = longest / 2;
    for (var i = 0; i < longest; i++) {
      line.push([x, y]);

      if (inverted) {
        y += step;
      }
      else {
        x += step;
      }

      gradientAccumulation += shortest;
      if (gradientAccumulation >= longest) {
        if (inverted) {
          x += gradientStep;
        }
        else {
          y += gradientStep;
        }
        gradientAccumulation -= longest;
      }
    }

    return line;
  };
  var DrawCircle = function (c, r, map) {
    for (var x = -r; x <= r; x++) {
      for (var y = -r; y <= r; y++) {
        if (x * x + y * y <= r * r) {
          var drawX = c[0] + x;
          var drawY = c[1] + y;
          if (IsInMapRange(drawX, drawY)) {
            map[drawX][drawY] = 0;
          }
        }
      }
    }
  };
  var CreatePassage = function (roomA, roomB, tileA, tileB, map) {
    Room.ConnectRooms(roomA, roomB);

    var line = GetLine(tileA, tileB);
    for (var i = 0; i < line.length; i++) {
      DrawCircle(line[i], 5, map);
    }
  };
  // Connect closest rooms
  var ConnectClosestRooms = function (allRooms, forceAccessibilityFromMainRoom, map) {
    var roomListA = [];
    var roomListB = [];
    if (forceAccessibilityFromMainRoom) {
      for (var i = 0; i < survivingRooms; i++) {
        if (room.isAccessibleFromMainRoom) {
          roomListB.push(room);
        } else {
          roomListA.push(room);
        }
      }
    } else {
      roomListA = allRooms;
      roomListB = allRooms;
    }

    var bestDistance = 0;
    var bestTileA = [];
    var bestTileB = [];
    var bestRoomA = [];
    var bestRoomB = [];
    var possibleConnectionFound = false;

    for (var i = 0; i < roomListA.length; i++) {
      if (!forceAccessibilityFromMainRoom) {
        possibleConnectionFound = false;
        if (roomListA[i].connectedRooms.length > 0) {
          continue;
        }
      }

      for (var n = 0; n < roomListB.length; n++) {
        var roomA = roomListA[i];
        var roomB = roomListB[i];
        if (roomA == roomB || roomA.IsConnected(roomB)) {
          continue;
        }

        for (var tileIndexA = 0; tileIndexA < roomA.edgeTiles.length; tileIndexA++) {
          for (var tileIndexB = 0; tileIndexB < roomB.edgeTiles.length; tileIndexB++) {
            var tileA = roomA.edgeTiles[tileIndexA];
            var tileB = roomB.edgeTiles[tileIndexB];
            var distanceBetweenRooms = parseInt(Math.pow(tileA[0] - tileB[0], 2) + Math.pow(tileA[1] - tileB[1], 2));

            if (distanceBetweenRooms < bestDistance || !possibleConnectionFound) {
              bestDistance = distanceBetweenRooms;
              possibleConnectionFound = true;
              bestTileA = tileA;
              bestTileB = tileB;
              bestRoomA = roomA;
              bestRoomB = roomB;
            }
          }
        }
      }

      if (possibleConnectionFound && !forceAccessibilityFromMainRoom) {
        CreatePassage(bestRoomA, bestRoomB, bestTileA, bestTileB, map);
      }
    }

    if (possibleConnectionFound && forceAccessibilityFromMainRoom) {
      CreatePassage(bestRoomA, bestRoomB, bestTileA, bestTileB, map);
      ConnectClosestRooms(allRooms, true, map);
    }

    if (!forceAccessibilityFromMainRoom) {
      ConnectClosestRooms(allRooms, true, map);
    }
  };
  var GetRegions = function (tileType, map) {
    var regions = [];
    // Set up 2D array for the mapFlags
    var mapFlags = new Array(width);
    for (var i = 0; i < width; i++) {
      mapFlags[i] = new Array(height).fill(0);
    }
    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        if (mapFlags[x][y] == 0 && map[x][y] == tileType) {
          var newRegion = GetRegionTiles(x, y, map);
          regions.push(newRegion);
          for (var i = 0; i < newRegion.length; i++) {
            mapFlags[newRegion[i][0]][newRegion[i][1]] = 1;
          }
        }
      }
    }
    return regions;
  };

  // Get wall regions
  var wallRegions = GetRegions(1, this.geometry);
  var wallThresholdSize = 50;
  for (var i = 0; i < wallRegions.length; i++) {
    if (wallRegions[i].length < wallThresholdSize) {
      for (var n = 0; n < wallRegions[i].length; n++) {
        this.geometry[wallRegions[i][n][0]][wallRegions[i][n][1]] = 0;
      }
    }
  }

  // Get room regions
  var roomRegions = GetRegions(0, this.geometry);
  var survivingRooms = [];
  var roomThresholdSize = 50;
  for (var i = 0; i < roomRegions.length; i++) {
    if (roomRegions[i].length < roomThresholdSize) {
      for (var n = 0; n < roomRegions[i].length; n++) {
        this.geometry[roomRegions[i][n][0]][roomRegions[i][n][1]] = 1;
      }
    } else {
      survivingRooms.push(new Room(roomRegions[i], this.geometry));
    }
  }
  survivingRooms.sort();
  survivingRooms[0].isMainRoom = true;
  survivingRooms[0].isAccessibleFromMainRoom = true;
  ConnectClosestRooms(survivingRooms, false, this.geometry);

  var borderSize = 10;
  var borderedMap = new Array(width + borderSize * 2);
  for (var i = 0; i < width + borderSize * 2; i++) {
    borderedMap[i] = new Array(height + borderSize * 2);
  }

  for (var x = 0; x < borderedMap.length; x++) {
    for (var y = 0; y < borderedMap[x].length; y++) {
      if (x >= borderSize && x < width + borderSize && y >= borderSize && y < height + borderSize) {
        borderedMap[x][y] = this.geometry[x - borderSize][y - borderSize];
      }
      else {
        borderedMap[x][y] = 1;
      }
    }
  }
};


// Map.prototype = {
//   EmitSeed: function(io, socketID) {
//     io.sockets.socket(socket.id).emit("seed", seed);
//   }
// };

module.exports = Map;