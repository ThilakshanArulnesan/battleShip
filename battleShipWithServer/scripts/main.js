/*
TODO:
- Make it look nice
- Work on stretch stuff
- Hide opponent ships
*/
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
  let diff

  if (true) {//HUMAN GAME, check later
    GAME_SIZE = 10;
    SHOTS_PER_TURN = 1;
    diff = 2;//IRRELEVANT
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

  clearBoard();
  clearLog();

  gameState = "started";

  log("Welcome to battleship!");
  //Displays tiles and creates tile objects
  //Could look into seperating this functionality out
  playerTiles = generateEmptyBoard(GAME_SIZE, "playerBoard");
  opponentTiles = generateEmptyBoard(GAME_SIZE, "opponentBoard");
  myOpponent = new Opponent(playerTiles, diff, true); //human opponent

  //Load ship types:
  addShip("Carrier [5]", 5, numCarrier, "car");
  addShip("Battleship [4]", 4, numBattle, "bat");
  addShip("Cruiser [3]", 3, numCruiser, "cru");
  addShip("Submarine [3]", 3, numSub, "sub");
  addShip("Destroyer [2]", 2, numDest, "des");


  gameState = "setup";

  //Make a request to start the game
  trackShips();

  log(`Please click on the player board (left) on the space where you'd like to place your ${playerShips[playerShipsPlaced].desc} (${playerShips[playerShipsPlaced].size} spaces)...`);
  highlightPlayerBoard();

};

const addShip = function(name, size, number, type) {
  for (let i = 0; i < number; i++) {
    playerShips.push(new Ship(name, size, "h", "player", type));
    opponentShips.push(new Ship(name, size, "h", "opponent", type));
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
        $("#okButton").hide();
        isWaiting = true;//no actions until response is heard

        log(`Searching for opponent, please wait...`);
        let promisedPlaceShips = promisifiedOpponentShips(playerShips);

        promisedPlaceShips.then((first) => {
          log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          log("Let's begin!!");
          console.log(`${first ? "I am first" : "I am second"}`);
          isWaiting = false;
          gameState = "playing";
          if (first === undefined) {
            first = Math.random() > 0.5;
          }
          //Randomize who goes first
          if (!first) { //Server flips coin
            log("We flipped a coin and you lost :(. Your opponent is first.");
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

    $.post(`${HOST}/games/1/moves/${myOpponent.multiPlayerID}`, { move: chosenTile.a1() })


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
      console.log("You should be waiting " + isWaiting);
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
    }
  }


};

const task = function() {
  return new Promise((res, rej) => {
    promisedTile = myOpponent.getMove();
    promisedTile.then((chosenTile) => {
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
  /*
    return new Promise((res, rej) => {
      //Loops through all moves then returns true;



    });

    let myPromises = [];
    for (let j = 0; j < numMoves; j++) {
      myPromises.push(myOpponent.getMove);
    }

    function runSerial(tasks) {
      var result = Promise.resolve();
      tasks.forEach(task => {
        result = result.then(() => task());
      });
      return result;
    }

    while (j < numMoves) { //opponent makes a certain number of moves
      promisedTile = myOpponent.getMove();

      promisedTile.then((chosenTile) => {
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





      }).catch(err => console.log(err));

    }
  */
}

const trackShips = function() {
  //Prints out th the tracker area the active ships
  // $(`#playerTracker ul`).empty();
  $(`ul`).empty();

  for (let ship of playerShips) {
    //tmpText += "<ul>" + ship.desc;
    if (ship.isSunk) {
      $(`#playerTracker ul`).append(`<li><strike>${ship.desc}<strike></li>`);
    } else {
      $(`#playerTracker ul`).append(`<li>${ship.desc}</li>`);
    }
  }

  for (let ship of opponentShips) {
    if (ship.isSunk) {
      $(`#opponentTracker ul`).append(`<li><strike>${ship.desc}<strike></li>`);
    } else {
      $(`#opponentTracker ul`).append(`<li>${ship.desc}</li>`);
    }
  }

};
