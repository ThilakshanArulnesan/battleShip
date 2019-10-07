class Opponent {
  constructor(playerTiles, diff, hum = false) {
    this.activeTiles = arrayOf(playerTiles); //An array of the tiles, AI cannot read the properties of the tiles (that would be cheating!)
    this.human = hum;
    console.log("set human to " + this.human + hum);
    this.a1Tiles = playerTiles;

    this.hitTiles = undefined;
    this.missTiles = undefined;
    this.difficulty = diff;
    this.hitTiles = []; //Could be useful for a smarter AI
    this.missTiles = []; //Could be useful for a smarter AI
    this.unresolvedTiles = [];
    this.HOST = "http://localhost:3000"

    //Pop out elements as used
  }

  get numTiles() {
    return this.activeTiles.length;
  };

  getMove() { //decides on the strategy to use and then makes the move
    return new Promise((resolve, reject) => {
      if (this.human) {
        //Make get requests for the moves instead
        //Will get AI notation.
        $.get(myOpponent.HOST + "/games/1/moves/next", function(resp) {
          console.log(resp.move);
          resolve(playerTiles[resp.move]);
        });

      } else if (this.difficulty === 2) {
        setTimeout(() => {
          console.log("Done waiting");
          resolve(this.pickNearHits());
        }, 100);

      } else {
        resolve(this.pickRandom());
      }
    });

  };

  pickRandom() { //Level 1 AI
    //Picks a random tile in the array and pops it out:
    let guessedIndex = Math.floor(Math.random() * (this.numTiles - 1));
    let guessedVal = this.activeTiles[guessedIndex]; //This will be the returned value

    if (this.activeTiles[guessedIndex].state === "a") { //Was it an active tile?
      this.hitTiles.push(this.activeTiles.splice(guessedIndex, 1));

    } else {
      this.missTiles.push(this.activeTiles.splice(guessedIndex, 1));
    }

    return guessedVal;
  };

  getInfo(tile, isHit, isSunk, numTiles = 5) {
    if (!isSunk && isHit) {
      this.hitTiles.push(tile);
    }

    if (isSunk && isHit) {
      this.hitTiles.push(tile);
      this.unresolvedTiles = this.unresolvedTiles.concat(this.hitTiles.reverse().slice(numTiles)); //Reset guesses
      this.hitTiles = [];
      this.hitTiles.length = 0;
      //Add back in tiles that we have not sunk yet:
      this.unresolvedTiles.reverse().forEach(e => this.hitTiles.push(e));

      this.unresolvedTiles = [];
      this.unresolvedTiles.length = 0;
    }
  }

  pickNearHits() { //Level 2 AI

    let guessTile = undefined;

    //If there is a hit, shoot around the hit. Search until we're told we've sunk the ship. Keep track somewhere of the line we have found...
    if (this.hitTiles.length > 0) {
      //Look around the last tile that was found, in the direction of the previous tile:
      let lastTileFound = this.hitTiles[this.hitTiles.length - 1];

      let x = lastTileFound.x;
      let y = lastTileFound.y;

      console.log("Tryiing to guess smart");
      //Try around the tile
      //ONLY TRY 4 CASES! No reason try all 8...
      let guess;

      if (this.hitTiles.length > 1) {
        //Find the directionthe next tile will be in
        let xdir = this.hitTiles[this.hitTiles.length - 1].x - this.hitTiles[this.hitTiles.length - 2].x;
        let ydir = this.hitTiles[this.hitTiles.length - 1].y - this.hitTiles[this.hitTiles.length - 2].y;

        if (ydir !== 0) { //Move along vertically
          console.log(`${xdir}, ${ydir} : I am guessing to change y`);
          guess = this.a1Tiles[getA1([x, y + ydir])];
          if (guess && !guess.guessed) {
            return guess;
          }


          let backTracky = this.hitTiles[0].y;

          console.log(`${xdir}, ${ydir} : I had already guessed that, let's try backtracking to ${x},${backTracky}`);

          guess = this.a1Tiles[getA1([x, backTracky - ydir])];

          if (guess && !guess.guessed) {
            return guess;
          }
        } else if (xdir !== 0) {
          guess = this.a1Tiles[getA1([x + xdir, y])];
          if (guess && !guess.guessed) {
            return guess;
          }
          let backTrackx = this.hitTiles[0].x;

          guess = this.a1Tiles[getA1([backTrackx - xdir, y])];

          if (guess && !guess.guessed) {
            return guess;
          }
        }
        /*
        At this point the tiles found so far must be part of different ships. So my approach here is to remove the last tile and try again
        */

        //Move the last tile hit to unresolved (but has been guessed, and try again).

        //Try without the last hit tile.
        this.unresolvedTiles.push(this.hitTiles.pop());

        return this.pickNearHits(); //Try again
      }

      guess = this.a1Tiles[getA1([x, y + 1])];
      if (guess && !guess.guessed) {
        return guess;
      }

      guess = this.a1Tiles[getA1([x, y - 1])];
      if (guess && !guess.guessed) {
        return guess;
      }

      guess = this.a1Tiles[getA1([x + 1, y])];
      if (guess && !guess.guessed) {
        return guess;
      }

      guess = this.a1Tiles[getA1([x - 1, y - 1])];
      if (guess && !guess.guessed) {
        return guess;
      }

      if (this.hitTiles.length === 1) {
        //We've exhausted all posibilities at this point. This tile needs to be removed
        this.hitTiles = [];
        this.hitTiles.length = 0;

        this.hitTiles = this.unresolvedTiles.reverse(); //Try with the unresolved tiles

        this.unresolvedTiles = [];
        this.unresolvedTiles.length = 0;
      }

      guess = undefined;



      dance:
      for (let i = x - 1; i <= x + 1; i++) {
        if (i > GAME_SIZE - 1 || i < 0) continue;
        for (let j = y - 1; j <= y + 1; j++) {
          if (j < 1 || j > GAME_SIZE) continue;
          let myTile = this.a1Tiles[getA1([i, j])];
          if (!myTile.guessed) {
            guessTile = myTile;
            break dance;
          }
        }
      }
    }

    if (!guessTile) {

      //If there are no clues, pick only even tiles first (if none left then go to odd)
      //let arr = this.trackerArray;
      dance:
      for (let i = 0; i < GAME_SIZE; i++) {
        for (let j = 1; j <= GAME_SIZE; j++) {
          if ((i + j) % 2 === 0) {
            let myTile = this.a1Tiles[getA1([i, j])];
            if (!myTile.guessed) {
              guessTile = myTile;
              return guessTile;
            }
          }
        }
      }

      up:
      if (!guessTile) {
        for (let i = 0; i < GAME_SIZE; i++) {
          for (let j = 1; j < GAME_SIZE; j++) {
            if ((i + j) % 2 !== 0) {
              let myTile = this.a1Tiles[getA1([i, j])];
              if (!myTile.guessed) {
                guessTile = myTile;
                return guessTile;
              }
            }
          }
        }
      }
    }


    return guessTile;
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

const promisifiedOpponentShips = function(playerShips = null) {
  //Places the opponent ships.
  return new Promise((res, rej) => {
    console.log("human? " + this.human);
    if (myOpponent.human) {
      //should place  ships
      let car = [];
      let bat = [];
      let cru = [];
      let sub = [];
      let des = [];

      for (let ship of playerShips) {
        if (ship.type === "car") {
          for (let tile of ship.tiles) {
            car.push(tile.a1());
          }
        }
        else if (ship.type === "bat") {
          for (let tile of ship.tiles) {
            bat.push(tile.a1());
          }
        }
        else if (ship.type === "cru") {
          for (let tile of ship.tiles) {
            cru.push(tile.a1());
          }
        }
        else if (ship.type === "sub") {
          for (let tile of ship.tiles) {
            sub.push(tile.a1());
          }
        }
        else if (ship.type === "des") {
          for (let tile of ship.tiles) {
            des.push(tile.a1());
          }
        }

      }


      let req = {
        car,
        bat,
        cru,
        sub,
        des
      }
      //Create a request

      $.post(myOpponent.HOST + "/games", req, function(resp) {

        //Push the tiles into the relevant ship res
        console.log(resp);

        //Set the tiles state to "a"
        for (let key in resp) {
          if (key === "first") continue;
          resp[key] = resp[key].map(e => {
            //Find the opponent tile with that A1 notation
            let opTile = opponentTiles[e].state = "a";
            return opTile;
          });

          for (let ship of opponentShips) {
            if (ship.type === key && ship.tiles.length === 0) {
              ship.tiles = resp[key];
              break;
            }
          }
        }

        console.log("after map: ");
        console.log(resp);

        console.log("Ships: ");
        console.log(opponentShips);
        displayTiles();
        //increment opponent ships placed
        //display tiles


        console.log("GOT A RESPONSE!!")
        res(resp.first);
      },
      );


      //If the server says game is ready, we can return the promise


      //Keep checking the server until the game is ready


    } else {
      setTimeout(() => {
        placeOpponentShipAI();
        console.log("placed ships");
        res();
      }, 10000);
    }

  });

}

const placeOpponentShipAI = function() {

  /*
  Pick random locations and place the ships there. Always verify that it is possible to place the tile, if not try again. It should always be possible for the AI to place all the ships as we checked to ensure that the number of tiles the ships will take is less than 60% of the available board space.
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
    log("ERROR, COULD NOT PLACE OPPONENT PIECES. PLEASE TRY AGAIN (REFRESH THE PAGE OR PRESS RESTART)");
    gameState = "ERROR";
  }

  displayTiles();
  console.log("done placing ships");
}




