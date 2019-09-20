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
}

console.log(getA1([0, 10]));

const startGame = function() {
  const GAME_SIZE = 10;
  generateEmptyBoard(GAME_SIZE);
  const playerShips = [];
  playerShips.push(Ship("Carrier", 5, "v"));
  playerShips.push(Ship("Battleship", 4, "v"));

  const opponentShips = [];
  playerShips.push(Ship("Carrier", 5, "v"));
  playerShips.push(Ship("Battleship", 4, "v"));

};

const generateEmptyBoard = function(n) {
  let p = Math.floor(90 / n) + "%"; //Percent of space to take up

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let a1Not = getA1([i, j]);
      $('.board').append(`<div class="tile" id=${a1Not}
      style="height:10%;width:10%">${a1Not}</div>`);
    }
  }


};





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

function Ship(type, size, orientation, owner) {
  //Ship constructor
  this.owner = owner;
  this.type = type;
  this.size = size;
  this.orientation = orientation;
  this.tiles = {
    x: undefined,
    y: undefined,
    status: "invis"
  };

  //A tile has a location
  this.setTiles = function(startTile) {
    //This function should set all the tile locations
  };

  this.isHit = function(tile) {
    //Checks if the tile chosen contains a battleship
    // If it does show it!
  };

};
