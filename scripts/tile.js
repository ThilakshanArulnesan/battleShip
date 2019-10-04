class Tile {
  constructor(x, y, player) {
    this.x = x;
    this.y = y;
    this.a1 = function() {
      return getA1([this.x, this.y]);
    }; //Not sure if I'll really need this, shortcut
    this.state = "w"; //w = water, a = active ship, d = destroyed ship,
    this.guessed = false;
    this.hitState = "n";
    this.ship = null;
    this.player = player;//Says which player we're dealing with
  };

}
getTiles = function(ship, startTile, owner) {
  let arr = getArr(startTile);
  let x = arr[0];
  let y = arr[1];

  let tiles = [];

  let size = ship.size;
  /* Check if there is ship can be placed in the
   given orientation, o/w flip it and try. If both don't work send error*/
  console.log("The ship size is" + ship.size);
  console.log("The ship size owner" + ship.owner);

  if ((!checkShipFitVertical(x, y, size, owner)) && (!checkShipFitHorizontal(x, y, size, owner))) {
    log(`Cannot place the ship in cell ${startTile} try another location.`);
    return [];
  }
  console.log('here')

  if (!checkShipFitVertical(x, y, size, owner)) {
    ship.orientation = "h";
  }
  console.log('here')

  if (!checkShipFitHorizontal(x, y, size, owner)) {
    ship.orientation = "v";
  }
  let orientation = ship.orientation;


  if (orientation === "v") {
    for (let i = y; i < y + ship.size; i++) {
      if (owner === "player") {
        tiles.push(playerTiles[getA1([x, i])]);
      } else if (owner === "opponent") {
        tiles.push(opponentTiles[getA1([x, i])]);
      }

    }
  } else if (orientation === "h") {
    for (let i = x; i < x + ship.size; i++) {
      if (owner === "player") {
        tiles.push(playerTiles[getA1([i, y])]);
      } else if (owner === "opponent") {
        tiles.push(opponentTiles[getA1([i, y])]);
      }
    }

  }
  return tiles;
};


checkShipFitHorizontal = function(x, y, size, owner) {
  boardFit = x + size <= GAME_SIZE;
  if (!boardFit) return false; //Doesn't fit on board, no need to check anything else

  //Check if all tiles are filled with water:
  for (let i = x; i < x + size; i++) {
    if (owner === "player") {
      if (playerTiles[getA1([i, y])].state !== "w") {
        //Must be a water tile
        return false;
      }
    } else if (owner === "opponent") {
      if (opponentTiles[getA1([i, y])].state !== "w") {
        //Must be a water tile
        return false;
      }
    }
  }


  return true;

};

checkShipFitVertical = function(x, y, size, owner) {
  boardFit = y + size <= GAME_SIZE + 1;
  if (!boardFit) return false; //Doesn't fit on board, no need to check anything else

  for (let i = y; i < y + size; i++) {
    if (owner === "player") {
      if (playerTiles[getA1([x, i])].state !== "w") {
        //Must be a water tile
        return false;
      }
    } else if (owner === "opponent") {
      if (opponentTiles[getA1([x, i])].state !== "w") {
        //Must be a water tile
        return false;
      }
    }
  }
  return true;

};





setTilesProperty = function(tiles, property, value) {
  //Given an array or object containing tiles, will change all the tiles in the
  //object or array to have the property of value (e.g. change all the tiles to water)
  for (let tile in tiles) {
    //console.log(tile);
    tiles[tile][property] = value;
  }
};

getTilesProperty = function(tiles, property, searchVal) {
  // returns as array
  let retArr = [];
  for (let tile in tiles) {
    //console.log(tile);
    if (tiles[tile][property] === searchVal) {
      retArr.push(tiles[tile]);
    }
  }

  return retArr;

}

