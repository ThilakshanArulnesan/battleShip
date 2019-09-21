
function Ship(type, size, orientation, owner) {
  //Ship constructor
  this.owner = owner;
  this.type = type;
  this.size = size;
  this.orientation = orientation;
  this.tiles = [];
  this.isSunk = false;

  //A tile has a location
  this.setTiles = function(startTile) {
    //This function should set all the tile locations
    // A ship will have an array of tiles
    /*  {
    x: undefined,
      y: undefined,
        status: "invis"
  };*/
  };

  this.isHit = function(tile) {
    //Checks if the tile chosen contains a battleship
    // If it does show it!
  };

};
