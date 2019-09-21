
const getArr = function(a1) {
  // Takes A1 notation and coverts it to a 2d index
  //Returns an array i,j indicating the index.
  a1 = a1.toUpperCase();
  let letToNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return [letToNum.indexOf(a1[0]), Number(a1.slice(1))];
};

const getA1 = function(arr) {
  // Inverse of getArr. Takes array and converts it to A1 notation
  let letToNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letToNum[arr[0]] + arr[1];
};

console.log(getA1([0, 10]));

const startGame = function() {
  const GAME_SIZE = 10;
  clearBoard();
  generateEmptyBoard(GAME_SIZE, "playerBoard");
  generateEmptyBoard(GAME_SIZE, "opponentBoard");

  const playerShips = [];
  playerShips.push(Ship("Carrier", 5, "v"));
  playerShips.push(Ship("Battleship", 4, "v"));

  const opponentShips = [];
  opponentShips.push(Ship("Carrier", 5, "v"));
  opponentShips.push(Ship("Battleship", 4, "v"));

};

const clearBoard = function() {
  $('.tile').remove();
}

const generateEmptyBoard = function(n, boardName) {
  let p = Math.floor(100 / n) + "%"; //Percent of space to take up
  let tiles = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let a1Not = getA1([i, j]);
      //Create a tile object for each divider
      // id = a1 notation of the space
      // id also contains whether player or opponent
      tiles.push(Tile(i, j, boardName));
      $(`.board#${boardName}`).append(`<div class="tile" id=${a1Not}
      style="height:10%;width:10%">${a1Not}</div>`);
    }
  }

  return tiles;
};

function Ship(type, size, orientation, owner) {
  //Ship constructor
  this.owner = owner;
  this.type = type;
  this.size = size;
  this.orientation = orientation;
  this.tiles = []

  //A tile has a location
  this.setTiles = function(startTile) {
    //This function should set all the tile locations
    // A ship will have an array of tiles
    /*  {
    x: undefined,
      y: undefined,
        status: "invis"
  };*/
  };

  this.isHit = function(tile) {
    //Checks if the tile chosen contains a battleship
    // If it does show it!
  };

};

function Tile(x, y, boardName) {
  this.x = x;
  this.y = y;
  this.hasShip = false; //Behaviour of tile depends on whether it has a ship or not
  this.a1 = getA1(x, y); //Not sure if I'll really need this, shortcut
  this.state = "w"; //w = water, a = active ship, d = destroyed ship
  this.boardName = boardName;//Says which player we're dealing with

}




// const createShips = function() {
//   /*
//   Creates the   battleships that will be used.
//   Right now the ships are static, but we can optionally change this
//   */
//   return ships = [
//     {
//       type: "Carrier",
//       tiles: 5,
//       orientation: "v",
//     },
//     {
//       type: "Battleship",
//       tiles: 4
//     },
//     {
//       type: "Cruiser",
//       tiles: 3
//     },
//     {
//       type: "Submarine",
//       tiles: 3
//     },
//     {
//       type: "Destroyer",
//       tiles: 2
//     }
//   ];
// };

