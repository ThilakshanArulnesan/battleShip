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

  let orientation = ship.orientation;

  if (orientation === "v") {
    //try vertical orientation
    for (let i = y; i < y + ship.size; i++) {
      // console.log(playerTiles[getA1([x, i])]);
      tiles.push(playerTiles[getA1([x, i])]);
    }
  } else if (orientation === "h") {
    for (let i = x; i < x + ship.size; i++) {
      // console.log(playerTiles[getA1([i, y])]);
      tiles.push(playerTiles[getA1([i, y])]);
    }

  }
  return tiles;
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


