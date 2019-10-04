/*
TODO:
- Add allow user to submit a username
    -Show leaderboard once done (how many times they've beaten computer)
        -Allow soft restart game (don't need to enter username?)
- Comment code
- Make it look nice
- Add images if possible
- Work on stretch stuff
*/


let isWaiting = false;
let gameState = "Not Started";
let activeCell;
let playerTiles;
let opponentTiles;


const GAME_SIZE = 10;
const TICK_RATE = 500;//1 s before another action can be taken
const NUM_SHIPS = 1;
let PLAYER_NAME = "NO_NAME";

let playerShips = [];
let playerShipsPlaced = 0;

let opponentShips = [];
let opponentShipsPlaced = 0;

let myOpponent;//Object storing opponent behaviour.AI

const startGame = function(opts) {
  //Resets the board:
  //loadTitleScreen();

  loadGameScreen();
  PLAYER_NAME = opts.username;
  clearBoard();
  clearLog();

  gameState = "started";

  $(`#startRestart`).text("Restart");

  log("Welcome to battleship!");
  //Displays tiles and creates tile objects
  //Could look into seperating this functionality out
  playerTiles = generateEmptyBoard(GAME_SIZE, "playerBoard");
  opponentTiles = generateEmptyBoard(GAME_SIZE, "opponentBoard");
  myOpponent = new Opponent(playerTiles);
  //Load ship types:

  playerShips.push(new Ship("Carrier[5]", 5, "h", "player"));
  //playerShips.push(new Ship("Battleship[4]", 4, "v", "player"));

  opponentShips.push(new Ship("Carrier[5]", 5, "v", "opponent"));
  //  opponentShips.push(new Ship("Battleship[4]", 4, "v", "opponent"));

  //opponentShips[1].isSunk = true;
  gameState = "setup";

  placeOpponentShip();
  trackShips();

  log(`Please click on the player board (left) on the space where you'd like to place your ${playerShips[playerShipsPlaced].type} (${playerShips[playerShipsPlaced].size} spaces)...`);
};

const displayTiles = function() {
  if (gameState === "setup") { //Setup view

    for (let key in playerTiles) { //Display player info
      let tile = playerTiles[key];
      let a1 = tile.a1();
      let myTile = $(`#${a1}P`);

      myTile.removeClass('selectedTile');

      if (tile.state === "selected") {
        myTile.addClass('selectedTile');
      } else if (tile.state === "a") {
        myTile.addClass('activeShipPiece');
      }
    }

    for (let key in opponentTiles) {//temporary for testing purposes
      let tile = opponentTiles[key];
      let a1 = tile.a1();
      let myTile = $(`#${a1}O`);

      myTile.removeClass('selectedTile');

      if (tile.state === "selected") {
        myTile.addClass('selectedTile');
      } else if (tile.state === "a") {
        myTile.addClass('activeShipPiece');
      }

      console.log("here");
      if (tile.hitState === "h") {
        myTile.text("HIT");
      } else if (tile.hitState === "m") {
        myTile.text("MISS");
      }
    }

  }

  if (gameState === "playing") {

    for (let key in opponentTiles) {//temporary for testing purposes
      let tile = opponentTiles[key];
      let a1 = tile.a1();
      let myTile = $(`#${a1}O`);

      if (tile.hitState === "h") {
        myTile.text("HIT").addClass("hit");
      } else if (tile.hitState === "m") {
        myTile.text("MISS").addClass("miss");
      }
    }
    for (let key in playerTiles) {//temporary for testing purposes
      let tile = playerTiles[key];
      let a1 = tile.a1();
      let myTile = $(`#${a1}P`); //Show grab the relevant player tile to display

      if (tile.hitState === "h") {
        myTile.text("HIT").addClass("hit");
      } else if (tile.hitState === "m") {
        myTile.text("MISS").addClass("miss");
      }
    }

  }
};

const okayPressed = function() {
  /*
  Button will only be used in the setup phase
  */
  if (gameState === "setup") {
    let selectedTiles = getTilesProperty(playerTiles, "state", "selected");
    console.log(selectedTiles);
    if (selectedTiles.length > 0) {
      playerShips[playerShipsPlaced].tiles = selectedTiles;
      console.log(playerShips[playerShipsPlaced]);
      setTilesProperty(selectedTiles, "state", "a");
      setTilesProperty(selectedTiles, "ship", playerShips[playerShipsPlaced]);
      activeCell = undefined;
      playerShipsPlaced++;
      displayTiles();

      if (playerShipsPlaced === NUM_SHIPS) {
        log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        log("Let's begin!!");

        gameState = "playing";
        //Randomize who goes first
        if (Math.random() > 0.5) { //flip a coin
          checkOpponentMoves();//Opponent moves
          displayTiles();
          log("We flipped a coin and you lost :(. Opponent went first.");
        } else {
          log("We flipped a coin, and you get to go first! Please pick a location");
        }

        $("#okButton").hide();

      }
    }
  }
};

const playerTilePressed = function(a1) {
  // A tile has been pressed
  if (isWaiting) return;


  isWaiting = true;
  setTimeout(() => isWaiting = false, TICK_RATE);//Will block tile from being pressed again immediately
  if (gameState === "setup") {
    if (a1 !== activeCell) {

      let tiles = getTilesProperty(playerTiles, "state", "selected");
      if (tiles.length !== 0) {

        setTilesProperty(tiles, "state", "w");
      }
    } else {
      let tiles = getTilesProperty(playerTiles, "state", "selected");
      setTilesProperty(tiles, "state", "w");
      playerShips[playerShipsPlaced].toggleOrientation();
    }

    activeCell = a1;

    //playerTiles[a1].state = "selected";
    let tiles = getTiles(playerShips[playerShipsPlaced], a1, "player");
    if (tiles.length === 0) {
      displayTiles();
      return;
    }
    setTilesProperty(tiles, "state", "selected");
    log(`Press okay if you are happy with the position.
    Select the same tile again if you want to change the orientation.
    Otherwise select another cell.`);
    displayTiles();
  }
};

const opponentTilePressed = function(a1) {
  //If this is pressed the game has begun
  if (isWaiting) return;

  isWaiting = true;
  setTimeout(() => isWaiting = false, TICK_RATE);//Will block tile from being pressed again immediately

  if (gameState === "playing") {
    //Player turn:
    activeCell = a1;

    //Check if the tile contains an opponent ship
    let chosenTile = opponentTiles[a1];

    if (chosenTile.guessed) {
      log(`Already guessed this tile, try again`);
      displayTiles();
      return;
    }

    chosenTile.guessed = true;

    if (chosenTile.state === "a") {
      log(`Player shoots at ${a1}: HIT`);
      chosenTile.state = 'd'; //Mark it as destroyed
      chosenTile.hitState = 'h';
      chosenTile.ship.setShipState();
      if (chosenTile.ship.isSunk) {
        trackShips(playerShips, opponentShips);
        log(`Opponent: "You sunk my battleship!"`);
      }
    } else {
      log(`Player shoots at ${a1}: MISS`);
      chosenTile.hitState = 'm';
    }

    displayTiles();

    //Check if all opponent ships are sunk (Gameover state)
    if (allShipsSunk(opponentShips)) {
      log(`Player has won! CONGRATULATIONS`);
      gameState = "gameover";
      loadEndScreen(true);//load victory screen
    } else {
      //Make opponent moves:
      checkOpponentMoves();
    }
  }
};

const checkOpponentMoves = function() {
  let chosenTile = myOpponent.getMove();
  //  console.log(chosenTile);
  let a1 = chosenTile.a1();
  chosenTile.guessed = true;

  if (chosenTile.state === "a") {
    log(`Opponent shoots at ${a1}: HIT`);
    chosenTile.state = 'd'; //Mark it as destroyed
    chosenTile.hitState = 'h';
    chosenTile.ship.setShipState(); //decides if ship is sunk.
    if (chosenTile.ship.isSunk) {
      trackShips(playerShips, opponentShips);
      log(`Oh no! the opponent has sunk your battleship!"`);
      gameState = "gameover";
    }
  } else {
    log(`Opponent shoots at ${a1}: MISS`);
    chosenTile.hitState = 'm';
  }

  displayTiles();

  //Check if all opponent ships are sunk (Gameover state)
  if (allShipsSunk(playerShips)) {
    log(`The opponent has won :(. Press replay to try again`);
    gameState = "gameover";
    loadEndScreen(false);//load defeat
  }


}

const trackShips = function() {
  //Prints out th the tracker area the active ships
  // $(`#playerTracker ul`).empty();
  $(`ul`).empty();

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
