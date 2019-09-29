class Opponent {
  constructor(playerTiles) {
    this.activeTiles = playerTiles;
    this.hitTiles = undefined;
    this.missTiles = undefined;
    this.difficulty = 1;
    //Pop out elements as used
  }

  // checkSquare(a1) {
  //   let arr = getArr(a1); //A3 ==> (1,3) ==> [1,4]
  //   arr[1] += 1;
  //   this.square = 1;
  // };

  getMove() { //decides on the strategy to use and then makes the move
    if (this.difficulty === 2) {
      return this.pickNearHits();
    }
    return this.pickRandom();
  }

  pickRandom() { //Level 1 AI
    //Picks a random tile in the array and pops it out:
    let guessedIndex = Math.floor(Math.random() * (this.activeTiles.length - 1));

    let guessedVal = this.activeTiles[guessedIndex].a1(); //This will be the returned value;
    if (this.activeTiles[guessedIndex].state === "a") {
      this.hitTiles.push(this.activeTiles.splice(guessedIndex, 1));
    } else {
      this.missTiles.push(this.activeTiles.splice(guessedIndex, 1));
    }

    return guessedVal;
  }

  pickNearHits() { //Level 2 AI
    return "A1";
  }

};




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
    console.log(tiles);
    setTilesProperty(tiles, "state", "selected");

    log(`Press okay if you are happy with the position.
  Select the same tile again if you want to change the orientation.
  Otherwise select another cell.`);


    let selectedTiles = getTilesProperty(opponentTiles, "state", "selected");


    if (selectedTiles.length > 0) {
      opponentShips[opponentShipsPlaced].tiles = selectedTiles;
      console.log(opponentShips[opponentShipsPlaced]);
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
  // }
}




