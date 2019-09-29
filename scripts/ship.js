class Ship {
  constructor(type, size, orientation, owner) {
    //Ship constructor
    this.owner = owner;
    this.type = type;
    this.size = size;
    this.orientation = orientation;
    this.toggleOrientation = function() {
      if (this.orientation === "v") {
        this.orientation = "h";
      } else {
        this.orientation = "v";
      }


    }
    this.tiles = [];
    this.isSunk = false;


  };

  setShipState = function() {
    //Checks whether a ship has sunk
    let isSunk = true;
    for (let tile of this.tiles) {
      if (tile.state !== "d") {
        isSunk = false;
      }
    }

    if (isSunk) {
      this.isSunk = true;
    }

    return isSunk;
  };
}

allShipsSunk = function(ships) {
  console.log(ships);
  for (let ship of ships) {
    if (!ship.isSunk)//if any ship left, the game isn't over
      return false;
  }

  return true;
}
