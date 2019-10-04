class Opponent {
  constructor(playerTiles) {
    this.activeTiles = arrayOf(playerTiles);
    this.hitTiles = undefined;
    this.missTiles = undefined;
    this.difficulty = 1;
    this.hitTiles = []; //Could be useful for a smarter AI
    this.missTiles = []; //Could be useful for a smarter AI

    //Pop out elements as used
  }

  get numTiles() {
    return this.activeTiles.length;
  };

  getMove() { //decides on the strategy to use and then makes the move
    if (this.difficulty === 2) {
      return this.pickNearHits();
    }
    return this.pickRandom();
  };

  pickRandom() { //Level 1 AI
    //Picks a random tile in the array and pops it out:
    let guessedIndex = Math.floor(Math.random() * (this.numTiles - 1));
    let guessedVal = this.activeTiles[guessedIndex]; //This will be the returned value

    if (this.activeTiles[guessedIndex].state === "a") { //Was it an active tile?
      this.hitTiles.push(this.activeTiles.splice(guessedIndex, 1));

      //I could change the tile state here.
    } else {
      this.missTiles.push(this.activeTiles.splice(guessedIndex, 1));
    }

    return guessedVal;
  };

  pickNearHits() { //Level 2 AI
    return "A1";
  };

};

const arrayOf = function(obj) {
  //takes an object and makes an array
  let arr = []
  for (let key in obj) {
    arr.push(obj[key]);
  }
  return arr;
}



const placeOpponentShip = function() {
  /*
  Pick random locations and place the ships there. Always verify.
  While loop until done.

  POTENTIAL ISSUE: Could construct a scenario where its impossible to place all ships
  and AI is stuck in infinite loop. Add an exit case later if needed?
  */
  let breakCond = 0; //Just here in case it loops for too long trying to place pieces

  while (breakCond < 1000 && opponentShipsPlaced < NUM_SHIPS) {

    let x = Math.floor(Math.random() * GAME_SIZE); //0-9
    let y = Math.floor(Math.random() * GAME_SIZE) + 1;//1-10

    let a1 = getA1([x, y]);

    let tiles = getTiles(opponentShips[opponentShipsPlaced], a1, "opponent");

    if (tiles.length === 0) {
      continue; //try again
    }
    setTilesProperty(tiles, "state", "selected");

    let selectedTiles = getTilesProperty(opponentTiles, "state", "selected");


    if (selectedTiles.length > 0) {
      opponentShips[opponentShipsPlaced].tiles = selectedTiles;

      setTilesProperty(selectedTiles, "state", "a");
      setTilesProperty(selectedTiles, "ship", opponentShips[opponentShipsPlaced]);

      activeCell = undefined;
      opponentShipsPlaced++;
      displayTiles();

      if (opponentShipsPlaced === NUM_SHIPS) {
        break;
      }

    }
    breakCond++;
  }

  if (breakCond === 1000) {//Prevents game from continuing if the oppponent cannot place pieces
    log("ERROR, COULD NOT PLACE OPPONENT PIECES. PLEASE TRY AGAIN");
    gameState = "ERROR";
  }

  displayTiles();
}




