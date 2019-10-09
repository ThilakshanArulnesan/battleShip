class GameLog {
  //currently not required

  constructor(opts) {
    this.p1log = [];
    this.p2log = [];
    this.opts = opts;
    this.SHOTS_PER_TURN = opts.numShots;
    this.playerTiles = [];
    this.playerShips = [];
    this.opponentShips = [];
    this.opponentTiles = [];
    this.GAME_SIZE = opts.boardSize;
    this.curMove = 0;
    this.playerMoveCounter = 0;
    this.opponentMoveCounter = 0;
  }


  logEntry = function(a1, player) {
    //Logs the entry in A1 notation. Can be used later for a replay feature.
    if (player === "player") {
      this.p1log.push("P" + a1);
    } else {
      this.p2log.push("O" + a1);
    }
  }

  replayGame = function() {

    loadGameScreen();


    clearLog();

    //Reset the board based on settings
    generateEmptyBoard(GAME_SIZE, "playerBoard");
    generateEmptyBoard(GAME_SIZE, "opponentBoard");

    trackShips(this.playerShips, this.opponentShips);
    $("#okButton").hide();
    $("#controlArea").append(
      `
      <button id="for" onClick="gameLog.moveForward()"> > </button>
      <button id="back" onClick="gameLog.moveBack()"> < </button>
      `);

    for (let a1 in opponentTiles) { //Reset tile state
      let tile = opponentTiles[a1];
      tile.guessed = false;
      tile.hitState = 'n';

      if (tile.state === 'd') {
        tile.state = 'a';
        tile.ship.isSunk = false;
      }
    }

    for (let a1 in playerTiles) { //Reset tile state
      let tile = playerTiles[a1]
      tile.guessed = false;
      tile.hitState = 'n';
      if (tile.state === 'd') {
        tile.state = 'a';
        tile.ship.isSunk = false;

      }
    }
    displayTiles("setup");
  };

  moveForward = function() {
    let chosenTile;
    if (Math.floor(this.curMove / this.SHOTS_PER_TURN) % 2 === 0) { //player move
      let move = this.playerMoveCounter;
      let a1 = this.p1log[move];
      if (a1) {
        chosenTile = opponentTiles[a1];
        if (chosenTile.state === "a") {
          log(`Player shoots at ${a1}: HIT`);
          chosenTile.state = 'd'; //Mark it as destroyed
          chosenTile.hitState = 'h';
          chosenTile.ship.setShipState();

          if (chosenTile.ship.isSunk) {
            trackShips(this.playerShips, this.opponentShips);
            log(`Opponent: "You sunk my battleship!"`);
          }
        } else {
          log(`Player shoots at ${a1}: MISS`);
          chosenTile.hitState = 'm';
        }
        displayTiles("playing");
        this.playerMoveCounter++;
      } else {
        if (a1 === null) {
          this.curMove++;
          this.playerMoveCounter++;
          this.moveForward();
          return;
        } else {
          log(`End of replay`);
        }
      }

    } else { //opponent move
      let move = this.opponentMoveCounter;
      let a1 = this.p2log[move];
      if (a1) {

        chosenTile = playerTiles[a1];
        if (chosenTile.state === "a") {
          log(`Opponent shoots at ${a1}: HIT`);
          chosenTile.state = 'd'; //Mark it as destroyed
          chosenTile.hitState = 'h';
          chosenTile.ship.setShipState();

          if (chosenTile.ship.isSunk) {
            trackShips(this.playerShips, this.opponentShips);
            log(`Player: "You sunk my battleship!"`);
          }
        } else {
          log(`Opponent shoots at ${a1}: MISS`);
          chosenTile.hitState = 'm';
        }
        displayTiles("playing");
        this.opponentMoveCounter++;
      } else {
        log(`End of replay.`);
      }
    }
    this.curMove++;
  };

  moveBack = function() {
    this.curMove--; //move counter down

    let chosenTile;
    //We are checking if it is currently the players move (taking into account multiple moves per turn)
    if (Math.floor(this.curMove / this.SHOTS_PER_TURN) % 2 === 0) { //Check if it is the players move
      this.playerMoveCounter--;
      let move = this.playerMoveCounter;
      let a1 = this.p1log[move];
      if (a1) {
        chosenTile = opponentTiles[a1];
        if (chosenTile.state === "d") {

          chosenTile.state = 'a'; //Mark it as destroyed
          chosenTile.hitState = 'n';
          chosenTile.ship.setShipState();
          trackShips(this.playerShips, this.opponentShips);
        } else {
          chosenTile.state = 'w';
          chosenTile.hitState = 'n';
        }
        displayTiles("playing");

      } else {
        log(`Beginning of replay`);
        this.curMove = 0;
      }
    } else { //opponent move
      this.opponentMoveCounter--;
      let move = this.opponentMoveCounter;
      let a1 = this.p2log[move];
      if (a1) {
        chosenTile = playerTiles[a1];
        if (chosenTile.state === "d") {
          chosenTile.state = 'a'; //Mark it as destroyed
          chosenTile.hitState = 'n';
          chosenTile.ship.setShipState();
          trackShips(this.playerShips, this.opponentShips);
        } else {
          chosenTile.state = 'w';
          chosenTile.hitState = 'n';
        }
        displayTiles("playing");

      } else {
        log(`Beginning of replay`);
        this.curMove = 0;
      }
    }

  };

}


