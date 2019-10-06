
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
  <button id="restart" onClick="loadTitle()">Restart</button>
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


const loadTitle = function() {
  $(".gameboard").empty(); //resets the board
  //I could save the code below in a textfile... I just don't want to deal with async right now :)
  $(".gameboard").append(
    `    <div class="container">
<h2>Welcome to battleship!</h2>
<form class="justify-content-center" id="options">
  <div class="form-group">
    <label> Username</label>
    <input type="text" name="username" value="me">
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
    <input type="number" name="numCarrier" min="0" max="5" value="3">
  </div>

  <div class="form-group">
    <label>Number of Battleships (4 tiles)</label>
    <input type="number" name="numBattle" min="0" max="5" value="0">
  </div>
  <div class="form-group">
    <label>Number of Cruisers (3 tiles)</label>
    <input type="number" name="numCruiser" min="0" max="5" value="0">
  </div>
  <div class="form-group">
    <label>Number of Submarine (3 tiles)</label>
    <input type="number" name="numSub" min="0" max="5" value="0">
  </div>
  <div class="form-group">
    <label>Number of Destroyers (2 tiles)</label>
    <input type="number" name="numDest" min="0" max="5" value="0">
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

  <div class="form-group">
    <label>AI Diculty</label>
    <select name="difficulty">
    <option value="2">Hard</option>
    <option value="1">Easy</option>
</select>

  </div>

  <input type="submit">
</form>
<text id="msg" style="color:red"></text>
</div>`
  );
  $("#options").submit((e) => {
    e.preventDefault(); //prevents refreshing the page
    let inputs = $('#options :input');

    let opts = {};
    inputs.each(function() {
      if (this.name === "username")
        opts[this.name] = $(this).val();
      else {
        opts[this.name] = Number($(this).val());

      }
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



const loadEndScreen = function(blnWon = true) {
  $(".gameboard").empty(); //resets the board
  $(".gameboard").append(`Loading...`);

  let score = getScore(opponentShips, playerShips);
  //This is a synchronous operation so could be a delayed

  //localStorage.setItem("highscores", "elephant,1,cryptonites,2,me,3");
  let contents = localStorage.getItem("highscores");
  if (!contents) {
    contents = ""; //First time on browser
  }

  contents = contents.split(","); //array of users and scores
  contents = highestScores(contents, PLAYER_NAME, score, 10);
  $(".gameboard").empty(); //resets the board
  //Display your score
  $(".gameboard").append(`<h3> Game over, you ${blnWon ? "won!" : "lost :(."} Your score was ${score} </h3>`);

  $(".gameboard").append(`<h3> Here is the top 10 leaderboard </h3>`);

  for (let i = 0; i < contents.length; i += 2) {
    if (contents[i] === PLAYER_NAME) {
      $(".gameboard").append(`<b style="color:green">${contents[i]}</b>  -   ${contents[i + 1]} <br>`);
    } else {
      $(".gameboard").append(`${contents[i]}  -  ${contents[i + 1]} <br>`);
    }
  }
  $(".gameboard").append(`<button id="restart" onClick="loadTitle()">Restart</button>`);


  //Display highscores (highlight player name)
  let writeContents = contents.join(",");

  localStorage.setItem("highscores", writeContents);

};



const log = function(msg) {
  //Given a string, logs a message to the logger area
  let myConsole = $('.console');
  myConsole.append(msg + "\n");
  myConsole.scrollTop(myConsole[0].scrollHeight);

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
  isWaiting = false;
  gameState = "Not Started";
  opponentShips = [];
  playerShips = [];
  playerShipsPlaced = 0;
  opponentShipsPlaced = 0;
  let myOpponent = undefined;

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


