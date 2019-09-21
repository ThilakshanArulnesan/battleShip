function Tile(x, y, player) {
  this.x = x;
  this.y = y;
  this.hasShip = false; //Behaviour of tile depends on whether it has a ship or not
  this.a1 = function() {
    return getA1([this.x, this.y]);
  }; //Not sure if I'll really need this, shortcut
  this.state = "w"; //w = water, a = active ship, d = destroyed ship
  this.player = player;//Says which player we're dealing with
};

const getTile = function(a1, player) {

}

const getTiles = function(ship, startTile) {

};


