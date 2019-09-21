
const placeOpponentShip = function() {
  /*
  Pick random locations and place the ships there. Always verify.
  While loop until done.

  POTENTIAL ISSUE: Could construct a scenario where its impossible to place all ships
  and AI is stuck in infinite loop. Add an exit case later if needed?
  */
  let breakCond = 0;

  while (breakCond < 10 && opponentShipsPlaced < NUM_SHIPS) {

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
      setTilesProperty(selectedTiles, "state", "hiddenShip");
      activeCell = undefined;
      opponentShipsPlaced++;
      displayTiles();

      if (opponentShipsPlaced === NUM_SHIPS) {
        break;
      }

    }
    breakCond++;
  }
  displayTiles();
  // }
}


