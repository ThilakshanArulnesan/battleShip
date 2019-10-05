/*
TODO:
- Make it look nice
- Work on stretch stuff
- Hide opponent ships
*/


let isWaiting = false;
let gameState = "Not Started";
let activeCell;

let playerTiles;
let opponentTiles;

let isPlayerTurn;

let GAME_SIZE = 10;
const TICK_RATE = 500;//num of milliseconds before another move can  be made
let NUM_SHIPS;
let SHOTS_PER_TURN;
let PLAYER_NAME;
let shotsSoFar = 0;
let playerShips = [];
let playerShipsPlaced = 0;

let opponentShips = [];
let opponentShipsPlaced = 0;

let myOpponent;//Object storing opponent behaviour.AI

const startGame = function(opts) {
  //Resets the board:
  //loadTitleScreen();

  loadGameScreen();

  //Get options:
  PLAYER_NAME = opts.username;
  GAME_SIZE = opts.boardSize;
  SHOTS_PER_TURN = opts.numShots;
  let diff = opts.difficulty;

  let numCarrier = opts.numCarrier;
  let numBattle = opts.numBattle;
  let numCruiser = opts.numCruiser;
  let numSub = opts.numSub;
  let numDest = opts.numDest;
  NUM_SHIPS = numCarrier + numBattle + numCruiser + numSub + numDest;

  clearBoard();
  clearLog();

  gameState = "started";

  log("Welcome to battleship!");
  //Displays tiles and creates tile objects
  //Could look into seperating this functionality out
  playerTiles = generateEmptyBoard(GAME_SIZE, "playerBoard");
  opponentTiles = generateEmptyBoard(GAME_SIZE, "opponentBoard");
  myOpponent = new Opponent(playerTiles, diff);
  //Load ship types:

  addShip("Carrier [5]", 5, numCarrier);
  addShip("Battleship [4]", 4, numBattle);
  addShip("Cruiser [3]", 3, numCruiser);
  addShip("Submarine [3]", 3, numSub);
  addShip("Destroyer [2]", 2, numDest);
  /*
    playerShips.push(new Ship("Carrier[5]", 5, "v", "player"));
    opponentShips.push(new Ship("Carrier[5]", 5, "v", "opponent"));
    */

  //opponentShips[1].isSunk = true;
  gameState = "setup";

  placeOpponentShip();
  trackShips();

  log(`Please click on the player board (left) on the space where you'd like to place your ${playerShips[playerShipsPlaced].type} (${playerShips[playerShipsPlaced].size} spaces)...`);
  highlightPlayerBoard();

};

const addShip = function(name, size, number) {
  for (let i = 0; i < number; i++) {
    playerShips.push(new Ship(name, size, "h", "player"));
    opponentShips.push(new Ship(name, size, "h", "opponent"));
  }

}

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

    if (selectedTiles.length > 0) {
      playerShips[playerShipsPlaced].tiles = selectedTiles;

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
          log("We flipped a coin and you lost :(. Opponent went first.");
          isPlayerTurn = false;

          highlightPlayerBoard();
          log("Waiting for opponent...")
          checkOpponentMoves();//Opponent moves
          displayTiles();
          isPlayerTurn = true;
          highlightOpponentBoard();
        } else {
          log("We flipped a coin, and you get to go first! Please pick a location");
          highlightOpponentBoard();
        }

        $("#okButton").hide();

      } else {
        log(`Great! Now please select where you'd like to place your ${playerShips[playerShipsPlaced].type} (${playerShips[playerShipsPlaced].size} spaces)...`);
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
    shotsSoFar++;

    //Check if all opponent ships are sunk (Gameover state)
    if (allShipsSunk(opponentShips)) {
      log(`Player has won! CONGRATULATIONS`);
      gameState = "gameover";
      loadEndScreen(true);//load victory screen
    } else if (shotsSoFar >= SHOTS_PER_TURN) {
      shotsSoFar = 0;
      log(`Opponents turn, please wait...`);
      //Make opponent moves:
      highlightPlayerBoard();
      isWaiting = true;
      highlightOpponentBoard();
      checkOpponentMoves(SHOTS_PER_TURN);
      if (gameState === "gameover") {
        return;  //Don't log any more, game is over, opponent won
      }
      let numShotsLeft = SHOTS_PER_TURN - shotsSoFar;
      log(`Your turn! Take another shot, you have ${numShotsLeft} shot${numShotsLeft > 1 ? "s" : ""} left this turn.`);
      isWaiting = false;
    } else {
      let numShotsLeft = SHOTS_PER_TURN - shotsSoFar;
      log(`You may take another shot, you have ${numShotsLeft} shot${numShotsLeft > 1 ? "s" : ""} left this turn.`);
    }
  }
};

const checkOpponentMoves = function(numMoves) {

  let j = 0;
  while (j < numMoves) { //opponent makes a certain number of moves
    let chosenTile = myOpponent.getMove();

    let a1 = chosenTile.a1();
    chosenTile.guessed = true;

    if (chosenTile.state === "a") {
      log(`Opponent shoots at ${a1}: HIT`);
      chosenTile.state = 'd'; //Mark it as destroyed
      chosenTile.hitState = 'h';

      let isSunk = chosenTile.ship.setShipState(); //decides if ship is sunk.
      myOpponent.getInfo(chosenTile, true, isSunk, chosenTile.ship.size);

      if (chosenTile.ship.isSunk) {
        trackShips(playerShips, opponentShips);
        log(`Oh no! the opponent has sunk your battleship!"`);
      }
    } else {
      log(`Opponent shoots at ${a1}: MISS`);
      chosenTile.hitState = 'm';
    }
    let prevBG = $(`#${chosenTile.a1().toUpperCase()}P`).css("backgroundColor");
    $(`#${chosenTile.a1().toUpperCase()}P`).animate({
      "backgroundColor": 'yellow'
    }, TICK_RATE / 3, () => {
      $(`#${chosenTile.a1().toUpperCase()}P`).animate({
        "backgroundColor": prevBG
      }, TICK_RATE / 3);
    });
    displayTiles();


    //Check if all opponent ships are sunk (Gameover state)
    if (allShipsSunk(playerShips)) {
      log(`The opponent has won :(. Press replay to try again`);
      gameState = "gameover";
      loadEndScreen(false);//load defeat
      break;
    }
    j++;
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
