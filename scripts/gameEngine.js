class GameEngine {
  //This class will handle communication between the player and the opponent

  //Properties
  playerTiles;
  opponentTiles;

  constructor(playerShips, opponentShips) {
    //Has A1 notation of all the playerShips and opponent ships

  }

  set playerTiles(playerShips) {
    let arr = [];
    this.playerShips = playerShips;

    for (let ship of playerShips) {
      arr.push(ship.tiles);
    }
    this.playerTiles = arr;
  }

  set opponentTiles(oppShips) {
    let arr = [];
    this.opponentShips = oppShips;

    for (let ship of oppShips) {
      arr.push(ship.tiles);
    }
    this.oppTiles = arr;
  }

  checkHit(player) {
    let tiles = player === "player" ? this.playerTiles : this.opponentTiles;




  }
}
