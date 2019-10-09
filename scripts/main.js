
const HOST = "http://localhost:3000"

let isWaiting = false;
let gameState = "Not Started";
let activeCell;

let playerTiles;
let opponentTiles;
let multiPlayerID = undefined; //Either p1 or p2;


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
let gameLog;

const startGame = function(opts) {
  //Resets the board:
  //loadTitleScreen();

  loadGameScreen();

  //Get options:
  let numCarrier;
  let numBattle;
  let numCruiser;
  let numSub;
  let numDest;
  let diff;

  if (opts.difficulty === 3) {//HUMAN GAME

    //Use default settings:
    PLAYER_NAME = opts.username;
    GAME_SIZE = 10;
    SHOTS_PER_TURN = 1;
    diff = 3;
    numCarrier = 1;
    numBattle = 1;
    numCruiser = 1;
    numSub = 1;
    numDest = 1;
    NUM_SHIPS = 5;

  } else {

    PLAYER_NAME = opts.username;
    GAME_SIZE = opts.boardSize;
    SHOTS_PER_TURN = opts.numShots;
    diff = opts.difficulty;

    numCarrier = opts.numCarrier;
    numBattle = opts.numBattle;
    numCruiser = opts.numCruiser;
    numSub = opts.numSub;
    numDest = opts.numDest;
    NUM_SHIPS = numCarrier + numBattle + numCruiser + numSub + numDest;
  }
  gameLog = new GameLog(opts);
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
  addShip("Carrier [5]", 5, numCarrier, "car");
  addShip("Battleship [4]", 4, numBattle, "bat");
  addShip("Cruiser [3]", 3, numCruiser, "cru");
  addShip("Submarine [3]", 3, numSub, "sub");
  addShip("Destroyer [2]", 2, numDest, "des");

  gameLog.playerShips = playerShips.slice(0);
  gameLog.opponentShips = opponentShips.slice(0);

  gameState = "setup";

  //Make a request to start the game
  trackShips(playerShips, opponentShips);

  log(`Please click on the player board (left) on the space where you'd like to place your ${playerShips[playerShipsPlaced].desc} (${playerShips[playerShipsPlaced].size} spaces)...`);
  highlightPlayerBoard();

};

const addShip = function(name, size, number, type) {
  for (let i = 0; i < number; i++) {
    playerShips.push(new Ship(name, size, "h", "player", type));
    opponentShips.push(new Ship(name, size, "h", "opponent", type));
  }

}

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
        $("#okButton").fadeTo(20, 0);

        isWaiting = true;//no actions until response is heard

        log(`Searching for opponent, please wait...`);
        let promisedPlaceShips = promisifiedOpponentShips(playerShips);

        promisedPlaceShips.then((first) => {
          log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          log("Let's begin!!");

          isWaiting = false;
          gameState = "playing";
          if (first === undefined) {
            first = Math.random() > 0.5;
          }
          console.log(playerTiles);

          gameLog.playerTiles = playerTiles;
          gameLog.opponentTiles = opponentTiles;

          //Randomize who goes first
          if (!first) { //Server flips coin
            gameLog.first = true;
            log("We flipped a coin and you lost :(. Your opponent is first.");
            for (let i = 0; i < SHOTS_PER_TURN; i++) {
              gameLog.p1log.push(null);
            }
            isWaiting = true;

            highlightPlayerBoard();
            log("Waiting for opponent...")
            let thePromisedMove = checkOpponentMoves(SHOTS_PER_TURN);//Opponent moves
            thePromisedMove.then(() => {
              displayTiles();
              isWaiting = false;
              highlightOpponentBoard();
            });
          } else {

            log("We flipped a coin, and you get to go first! Please pick a location");
            highlightOpponentBoard();
          }
        })
      } else {
        log(`Great! Now please select where you'd like to place your ${playerShips[playerShipsPlaced].type} (${playerShips[playerShipsPlaced].size} spaces)...`);
      }
    }
  }
};

const playerTilePressed = function(a1) {
  // A tile has been presse
  if (isWaiting) {
    return;
  }

  if (gameState === "setup") {
    isWaiting = true;
    setTimeout(() => isWaiting = false, TICK_RATE);//Will block tile from being pressed again immediately

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
    gameLog.p1log.push(a1);
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

    isWaiting = true;

    if (myOpponent.difficulty === 3) {
      $.post(`${HOST}/games/1/moves/${myOpponent.multiPlayerID}`, { move: chosenTile.a1() });
    }


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
      isWaiting = true; //Lock the player from moving

      let thePromisedMove = checkOpponentMoves(SHOTS_PER_TURN);

      thePromisedMove.then(() => {
        if (gameState === "gameover") {
          return;  //Don't log any more, game is over, opponent worn
        }
        let numShotsLeft = SHOTS_PER_TURN - shotsSoFar;
        log(`Your turn! Take another shot, you have ${numShotsLeft} shot${numShotsLeft > 1 ? "s" : ""} left this turn.`);
        highlightOpponentBoard();

        isWaiting = false;//Player can move
      });


    } else {
      let numShotsLeft = SHOTS_PER_TURN - shotsSoFar;
      log(`You may take another shot, you have ${numShotsLeft} shot${numShotsLeft > 1 ? "s" : ""} left this turn.`);
      isWaiting = false;
    }
  }


};

const task = function() {
  return new Promise((res, rej) => {
    promisedTile = myOpponent.getMove();
    promisedTile.then((chosenTile) => {
      let a1 = chosenTile.a1();
      gameLog.p2log.push(a1);
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
      /* OPTIONAL ANIMATION:
       let prevBG = $(`#${chosenTile.a1().toUpperCase()}P`).css("backgroundColor");
       $(`#${chosenTile.a1().toUpperCase()}P`).animate({
         "backgroundColor": 'yellow'
       }, TICK_RATE / 3, () => {
         $(`#${chosenTile.a1().toUpperCase()}P`).animate({
           "backgroundColor": prevBG
         }, TICK_RATE / 3);
       });*/
      displayTiles();


      //Check if all opponent ships are sunk (Gameover state)
      if (allShipsSunk(playerShips)) {
        log(`The opponent has won :(. Press replay to try again`);
        gameState = "gameover";
        loadEndScreen(false);//load defeat
        res(true);
      }

      res(true);
    }).catch(err => console.log(err));
  });

}

const checkOpponentMoves = function(numMoves) {
  let tasks = [];
  for (let j = 0; j < numMoves; j++) {
    tasks.push(task); //10 promises
  }

  let result = Promise.resolve();
  tasks.forEach(task => {
    result = result.then(() => task());
  });

  return result;

}

const trackShips = function(playerShips, opponentShips) {
  //Prints out th the tracker area the active ships
  // $(`#playerTracker ul`).empty();
  $(`.tracker`).empty();

  for (let ship of playerShips) {
    //tmpText += "<ul>" + ship.desc;
    if (ship.isSunk) {
      $(`#playerTracker`).append(`<p><s>${ship.desc}</p></s>`);
    } else {
      $(`#playerTracker`).append(`<p>${ship.desc}</p>`);
    }
  }

  for (let ship of opponentShips) {
    if (ship.isSunk) {
      $(`#opponentTracker`).append(`<s><p>${ship.desc}</p></s>`);
    } else {
      $(`#opponentTracker`).append(`<p>${ship.desc}</p>`);
    }
  }

};
