/*

TODO:
- Add allow user to submit a username
    -Show leaderboard once done (how many times they've beaten computer)
        -Display at endstate
        -Allow soft restart game (don't need to enter username?)

- Comment code
- Make it look nice
- Add images if possible

-Work on stretch stuff
*/


let isWaiting = false;
let gameState = "Not Started";
let activeCell;
let playerTiles;
let opponentTiles;


const GAME_SIZE = 10;
const TICK_RATE = 500;//1 s before another action can be taken
const NUM_SHIPS = 1;
let PLAYER_NAME = "NO_NAME";

let playerShips = [];
let playerShipsPlaced = 0;

let opponentShips = [];
let opponentShipsPlaced = 0;

let myOpponent;//Object storing opponent behaviour.AI

const getArr = function(a1) {
  // Takes A1 notation and coverts it to a 2d index
  //Returns an array i,j indicating the index.
  a1 = a1.toUpperCase();
  let letToNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return [letToNum.indexOf(a1[0]), Number(a1.slice(1))];
};

const getA1 = function(arr) {
  // Inverse of getArr. Takes array and converts it to A1 notation
  let letToNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letToNum[arr[0]] + arr[1];
};


const startGame = function(opts) {
  //Resets the board:
  //loadTitleScreen();

  loadGameScreen();
  PLAYER_NAME = opts.username;
  clearBoard();
  clearLog();

  gameState = "started";

  $(`#startRestart`).text("Restart");

  log("Welcome to battleship!");
  //Displays tiles and creates tile objects
  //Could look into seperating this functionality out
  playerTiles = generateEmptyBoard(GAME_SIZE, "playerBoard");
  opponentTiles = generateEmptyBoard(GAME_SIZE, "opponentBoard");
  myOpponent = new Opponent(playerTiles);
  //Load ship types:

  playerShips.push(new Ship("Carrier[5]", 5, "h", "player"));
  //playerShips.push(new Ship("Battleship[4]", 4, "v", "player"));

  opponentShips.push(new Ship("Carrier[5]", 5, "v", "opponent"));
  //  opponentShips.push(new Ship("Battleship[4]", 4, "v", "opponent"));

  //opponentShips[1].isSunk = true;
  gameState = "setup";

  placeOpponentShip();
  trackShips();

  log(`Please click on the player board (left) on the space where you'd like to place your ${playerShips[playerShipsPlaced].type} (${playerShips[playerShipsPlaced].size} spaces)...`);
};

const loadTitle = function() {
  $(".gameboard").empty(); //resets the board
  //I could save the code below in a textfile... I just don't want to deal with async right now :)
  $(".gameboard").append(
    `    <div class="container">
<h2>Welcome to battleship!</h2>
<form class="justify-content-center" id="options">
  <div class="form-group">
    <label> Username</label>
    <input type="text" name="username">
  </div>
  <!-- A Carrier, which is 5 tiles long
A Battleship, which is 4 tiles long
A Cruiser, which is 3 tiles long
A Submarine, which is 3 tiles long
A Destroyer, which is 2 tiles long
-->
  <hr>

  <div class="form-group">
    <label>Ship Options:</label>
  </div>

  <div class="form-group">
    <label>Number of Carriers (5 tiles)</label>
    <input type="number" name="numCarrier" min="1" max="5" value="1">
  </div>

  <div class="form-group">
    <label>Number of Battleships (4 tiles)</label>
    <input type="number" name="numBattle" min="1" max="5" value="1">
  </div>
  <div class="form-group">
    <label>Number of Cruisers (3 tiles)</label>
    <input type="number" name="numCruiser" min="1" max="5" value="1">
  </div>
  <div class="form-group">
    <label>Number of Submarine (3 tiles)</label>
    <input type="number" name="numSub" min="1" max="5" value="1">
  </div>
  <div class="form-group">
    <label>Number of Destroyers (2 tiles)</label>
    <input type="number" name="numDest" min="1" max="5" value="1">
  </div>

  <hr>
  <label>Other Options </label>

  <div class="form-group">
    <label>Board size: </label>
    <input type="number" name="boardSize" min="8" max="20" value="10">
  </div>

  <div class="form-group">
    <label>Number of shots per turn</label>
    <input type="number" name="numShots" min="1" max="100" value="1">
  </div>

  <input type="submit">
</form>
<text id="msg" style="color:red">Hey</text>
</div>`
  );
  $("#options").submit((e) => {
    e.preventDefault(); //prevents refreshing the page
    console.log("PRESSED");
    let inputs = $('#options :input');
    console.log(inputs);
    let opts = {};
    inputs.each(function() {
      opts[this.name] = $(this).val();
    });

    let errMsg = verifyOptions(opts)
    if (!errMsg) { //Empty string == we're good
      startGame(opts);
    } else {
      $("#msg").text(errMsg);
    }
  }

  );
}



const loadGameScreen = function() {


  $(".gameboard").empty(); //resets the board
  $(".gameboard").append(
    `<div class="playerArea">
  <div class="board" id="playerBoard"></div>
  <div class="tracker" id="playerTracker">
    <ul></ul>
  </div>
</div>

<div id="controlArea">
  <button id="okButton" onClick="okayPressed()">OKAY</button>
  <button id="startRestart" onClick="startGame()">START</button>
</div>

<div class="playerArea">
  <div class="board" id="opponentBoard"></div>
  <div class="tracker" id="opponentTracker">
    <ul></ul>
  </div>
</div>

<textarea readonly type="text" class="console"></textarea>
`);
};

const loadEndScreen = function(blnWon = true) {
  $(".gameboard").empty(); //resets the board
  $(".gameboard").append(`Loading...`);

  let fs = require('fs');
  let score = getScore(opponentShips, playerShips);
  fs.readFile('/leaderboard.csv', function(err, contents) {

    if (!contents) {
      contents = "";
    }
    contents = contents.split(","); //array of users and scores
    contents = highestScores(contents, PLAYER_NAME, score);
    $(".gameboard").empty(); //resets the board
    //Display your score
    $(".gameboard").append(`<h3> Game over, you ${blnWon ? "Won" : "Lost"}. Your score was ${score} </h3>`);


    //Display highscores (highlight player name)


    let writeContents = contents.join(",");
    fs.writeFile('/leaderboard.txt', writeContents, function(err) {

      console.log("DONE WRITE");
    });
  });



};



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

      console.log("here");
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
    console.log(selectedTiles);
    if (selectedTiles.length > 0) {
      playerShips[playerShipsPlaced].tiles = selectedTiles;
      console.log(playerShips[playerShipsPlaced]);
      setTilesProperty(selectedTiles, "state", "a");
      setTilesProperty(selectedTiles, "ship", playerShips[playerShipsPlaced]);
      activeCell = undefined;
      playerShipsPlaced++;
      displayTiles();

      if (playerShipsPlaced === NUM_SHIPS) {
        log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        log("Let's begin!!");

        gameState = "playing";
        //Randomize who goes first
        if (Math.random() > 0.5) { //flip a coin
          checkOpponentMoves();//Opponent moves
          displayTiles();
          log("We flipped a coin and you lost :(. Opponent went first.");
        } else {
          log("We flipped a coin, and you get to go first! Please pick a location");
        }

        $("#okButton").hide();

      }
    }
  }
};


const playerTilePressed = function(a1) {
  // A tile has been pressed
  if (isWaiting) return;


  isWaiting = true;
  setTimeout(() => isWaiting = false, TICK_RATE);//Will block tile from being pressed again immediately
  if (gameState === "setup") {
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

  isWaiting = true;
  setTimeout(() => isWaiting = false, TICK_RATE);//Will block tile from being pressed again immediately

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

    //Check if all opponent ships are sunk (Gameover state)
    if (allShipsSunk(opponentShips)) {
      log(`Player has won! CONGRATULATIONS`);
      gameState = "gameover";
      loadEndScreen(true);//load victory screen
    } else {
      //Make opponent moves:
      checkOpponentMoves();
    }
  }
};

const checkOpponentMoves = function() {
  let chosenTile = myOpponent.getMove();
  //  console.log(chosenTile);
  let a1 = chosenTile.a1();
  chosenTile.guessed = true;

  if (chosenTile.state === "a") {
    log(`Opponent shoots at ${a1}: HIT`);
    chosenTile.state = 'd'; //Mark it as destroyed
    chosenTile.hitState = 'h';
    chosenTile.ship.setShipState(); //decides if ship is sunk.
    if (chosenTile.ship.isSunk) {
      trackShips(playerShips, opponentShips);
      log(`Oh no! the opponent has sunk your battleship!"`);
      gameState = "gameover";
    }
  } else {
    log(`Opponent shoots at ${a1}: MISS`);
    chosenTile.hitState = 'm';
  }

  displayTiles();

  //Check if all opponent ships are sunk (Gameover state)
  if (allShipsSunk(playerShips)) {
    log(`The opponent has won :(. Press replay to try again`);
    gameState = "gameover";
    loadEndScreen(false);//load defeat
  }


}

const trackShips = function() {
  //Prints out th the tracker area the active ships
  // $(`#playerTracker ul`).empty();
  $(`ul`).empty();

  for (let ship of playerShips) {
    //tmpText += "<ul>" + ship.type;
    if (ship.isSunk) {
      $(`#playerTracker ul`).append(`<li><strike>${ship.type}<strike></li>`);
    } else {
      $(`#playerTracker ul`).append(`<li>${ship.type}</li>`);
    }
  }

  for (let ship of opponentShips) {
    if (ship.isSunk) {
      $(`#opponentTracker ul`).append(`<li><strike>${ship.type}<strike></li>`);
    } else {
      $(`#opponentTracker ul`).append(`<li>${ship.type}</li>`);
    }
  }

};

const log = function(msg) {
  //Given a string, logs a message to the logger area
  let myConsole = $('.console');
  myConsole.append(msg + "\n");
  myConsole.scrollTop(myConsole[0].scrollHeight);
  // $(`.console`).scrollTop;

}
const clearLog = function() {
  $(`.console`).text("");
}
const clearBoard = function() {
  $('.tile').remove();

  //Visual empty
  setTilesProperty(playerTiles, "state", "w"); //reset player tiles
  setTilesProperty(opponentTiles, "state", "w"); //reset player tiles
  $(`.board`).empty();
  $(`ul`).empty();
  $("#okButton").show();


  //Logically empty
  opponentShips = [];
  playerShips = [];
  playerShipsPlaced = 0;
  opponentShipsPlaced = 0;

  displayTiles();
};

const generateEmptyBoard = function(n, boardName) {
  let p = Math.floor(100 / n) + "%"; //Percent of space to take up
  let tiles = {};
  for (let j = 1; j < n + 1; j++) {
    for (let i = 0; i < n; i++) {
      let a1Not = getA1([i, j]);
      //Create a tile object for each divider
      // id = a1 notation of the space
      // id also contains whether player or opponent
      if (boardName === "playerBoard") {
        tiles[a1Not] = new Tile(i, j, "player"); //Creates tile objects
        $(`.board#${boardName}`).append(`<div class="defaultTile" id="${a1Not}P"
      style="height:${p};width:${p}">${a1Not}</div>`);
        $(`.defaultTile#${a1Not}P`).bind("click",
          () => {
            playerTilePressed(a1Not);
          });
      } else {
        //tiles.push(Tile(i, j, "opponent")); //Creates tile objects
        tiles[a1Not] = new Tile(i, j, "player");
        $(`.board#${boardName}`).append(`<div class="defaultTile" id="${a1Not}O"
      style="height:${p};width:${p}">${a1Not}</div>`);
        $(`.defaultTile#${a1Not}O`).bind("click",
          () => {
            opponentTilePressed(a1Not);
          });
      }

    }
  }
  return tiles;
};


