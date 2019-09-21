let isWaiting = false;
let gameState = "Not Started";
let activeCell;
let playerTiles;
let opponentTiles;

const GAME_SIZE = 10;
const TICK_RATE = 500;//1 s before another action can be taken

const NUM_SHIPS = 2;

const playerShips = [];
let playerShipsPlaced = 0;

const opponentShips = [];
let opponentShipsPlaced = 0;

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

const startGame = function() {
  //Resets the board:
  clearBoard();
  clearLog();

  gameState = "started";

  $(`#startRestart`).text("Restart");

  log("Welcome to battleship!");
  //Displays tiles and creates tile objects
  //Could look into seperating this functionality out
  playerTiles = generateEmptyBoard(GAME_SIZE, "playerBoard");
  opponentTiles = generateEmptyBoard(GAME_SIZE, "opponentBoard");

  //Load ship types:

  playerShips.push(new Ship("Carrier", 5, "h", "player"));
  playerShips.push(new Ship("Battleship", 4, "v", "player"));

  opponentShips.push(new Ship("Carrier", 5, "v", "opponent"));
  opponentShips.push(new Ship("Battleship", 4, "v", "opponent"));

  opponentShips[1].isSunk = true;
  trackShips(playerShips, opponentShips);
  gameState = "setup";

  log(`Please click on the player board (left) on the space where you'd like to place your ${playerShips[playerShipsPlaced].type} (${playerShips[playerShipsPlaced].size} spaces)...`);
};


const playerTilePressed = function(a1) {
  // A tile has been pressed
  if (isWaiting) return;


  isWaiting = true;
  setTimeout(() => isWaiting = false, TICK_RATE);//Will block tile from being pressed again immediately
  console.log(`${a1}`);
  if (gameState === "setup") {
    if (a1 !== activeCell) {
      let tiles = getTilesProperty(playerTiles, "state", "selected");
      setTilesProperty(tiles, "state", "w");
    } else {
      let tiles = getTilesProperty(playerTiles, "state", "selected");
      setTilesProperty(tiles, "state", "w");
      playerShips[playerShipsPlaced].toggleOrientation();
    }

    activeCell = a1;

    playerTiles[a1].state = "selected";
    let tiles = getTiles(playerShips[playerShipsPlaced], a1);
    setTilesProperty(tiles, "state", "selected");
    log(`Press okay if you are happy with the position.
    Select the same tile again if you want to change the orientation.
    Otherwise select another cell.`);
    displayTiles();
  }
};


const displayTiles = function() {
  if (gameState === "setup") {
    for (let key in playerTiles) { //Display player info
      let tile = playerTiles[key];
      let a1 = tile.a1();
      let myTile = $(`#${a1}P`);

      myTile.removeClass('selectedTile'); //May be useful

      if (tile.state === "selected") {
        myTile.addClass('selectedTile'); //May be useful
      } else if (tile.state === "hiddenShip") {
        myTile.addClass('lockedTile');
      }


    }

  }
};

const okayPressed = function() {
  if (gameState === "setup") {
    let selectedTiles = getTilesProperty(playerTiles, "state", "selected");
    console.log(selectedTiles);
    if (selectedTiles.length > 0) {
      playerShips[playerShipsPlaced].tiles = selectedTiles;
      console.log(playerShips[playerShipsPlaced]);
      setTilesProperty(selectedTiles, "state", "hiddenShip");
      activeCell = undefined;
      playerShipsPlaced++;
      displayTiles();

      if (playerShipsPlaced === NUM_SHIPS) {
        log("~~~~~~~~~~~~~~~");
        log("~~~~~~~~~~~~~~~");
        log("~~~~~~~~~~~~~~~");
        log("Let's begin!!");
        gameState = "PLAYING";
      }

    }
  }
};


const opponentTilePressed = function(a1) {
  if (isWaiting) return;

  isWaiting = true;
  setTimeout(() => isWaiting = false, TICK_RATE);//Will block tile from being pressed again immediately

};

const trackShips = function(playerShips, opponentShips) {
  //Prints out th the tracker area the active ships

  for (let ship of playerShips) {
    //tmpText += "<ul>" + ship.type;
    if (ship.isSunk) {
      $(`#playerTracker ul`).append(`<li><strike>${ship.type}<strike></li>`);
    } else {
      $(`#playerTracker ul`).append(`<li>${ship.type}</li>`);
    }
  }

  for (let ship of opponentShips) {
    if (ship.isSunk) {
      $(`#opponentTracker ul`).append(`<li><strike>${ship.type}<strike></li>`);
    } else {
      $(`#opponentTracker ul`).append(`<li>${ship.type}</li>`);
    }
  }

};

const log = function(msg) {
  //Given a string, logs a message to the logger area
  let myConsole = $('.console');
  myConsole.append(msg + "\n");
  myConsole.scrollTop(myConsole[0].scrollHeight);
  // $(`.console`).scrollTop;

}
const clearLog = function() {
  $(`.console`).text("");
}
const clearBoard = function() {
  $('.tile').remove();
};

const generateEmptyBoard = function(n, boardName) {
  let p = Math.floor(100 / n) + "%"; //Percent of space to take up
  let tiles = {};
  for (let j = 1; j < n + 1; j++) {
    for (let i = 0; i < n; i++) {
      let a1Not = getA1([i, j]);
      //Create a tile object for each divider
      // id = a1 notation of the space
      // id also contains whether player or opponent
      if (boardName === "playerBoard") {
        tiles[a1Not] = new Tile(i, j, "player"); //Creates tile objects
        $(`.board#${boardName}`).append(`<div class="defaultTile" id="${a1Not}P"
      style="height:${p};width:${p}">${a1Not}</div>`);
        $(`.defaultTile#${a1Not}P`).bind("click",
          () => {
            playerTilePressed(a1Not);
          });
      } else {
        //tiles.push(Tile(i, j, "opponent")); //Creates tile objects
        tiles[a1Not] = new Tile(i, j, "player");
        $(`.board#${boardName}`).append(`<div class="defaultTile" id="${a1Not}O"
      style="height:${p};width:${p}">${a1Not}</div>`);
        $(`.defaultTile#${a1Not}O`).bind("click",
          () => {
            opponentTilePressed(a1Not);
          });
      }


    }
  }
  console.log(tiles);
  return tiles;
};


