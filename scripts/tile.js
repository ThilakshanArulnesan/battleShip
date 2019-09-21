function Tile(x, y, player) {
  this.x = x;
  this.y = y;
  this.hasShip = false; //Behaviour of tile depends on whether it has a ship or not
  this.a1 = function() {
    return getA1([this.x, this.y]);
  }; //Not sure if I'll really need this, shortcut
  this.state = "w"; //w = water, a = active ship, d = destroyed ship
  this.player = player;//Says which player we're dealing with
};


const getTiles = function(ship, startTile) {
  let arr = getArr(startTile);
  let x = arr[0];
  let y = arr[1];

  let tiles = [];

  let size = ship.size;
  /* Check if there is ship can be placed in the
   given orientation, o/w flip it and try. If both don't work send error*/

  if ((!checkShipFitVertical(x, y, size)) && (!checkShipFitHorizontal(x, y, size))) {
    log(`Cannot place the ship in cell ${startTile} try another locaiton`);
    return [];
  }
  console.log('here')

  if (!checkShipFitVertical(x, y, size)) {
    ship.orientation = "h";
  }
  console.log('here')

  if (!checkShipFitHorizontal(x, y, size)) {
    ship.orientation = "v";
  }
  let orientation = ship.orientation;


  if (orientation === "v") {
    for (let i = y; i < y + ship.size; i++) {
      tiles.push(playerTiles[getA1([x, i])]);
    }
  } else if (orientation === "h") {
    for (let i = x; i < x + ship.size; i++) {
      tiles.push(playerTiles[getA1([i, y])]);
    }

  }
  return tiles;
};

const checkShipFitHorizontal = function(x, y, size) {
  boardFit = x + size <= GAME_SIZE;
  if (!boardFit) return false; //Doesn't fit on board, no need to check anything else

  //Check if all tiles are filled with water:
  for (let i = x; i < x + size; i++) {
    if (playerTiles[getA1([i, y])].state !== "w") {
      //Must be a water tile
      return false;
    }
  }


  return true;

};

const checkShipFitVertical = function(x, y, size) {
  boardFit = y + size <= GAME_SIZE + 1;
  if (!boardFit) return false; //Doesn't fit on board, no need to check anything else

  for (let i = y; i < y + size; i++) {
    if (playerTiles[getA1([x, i])].state !== "w") {
      //Must be a water tile
      return false;
    }
  }
  return true;

};





const setTilesProperty = function(tiles, property, value) {
  //Given an array or object containing tiles, will change all the tiles in the
  //object or array to have the property of value (e.g. change all the tiles to water)
  for (let tile in tiles) {
    //console.log(tile);
    tiles[tile][property] = value;
  }
};

const getTilesProperty = function(tiles, property, searchVal) {
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


