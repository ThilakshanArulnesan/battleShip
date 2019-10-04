
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

const highlightPlayerBoard = function() {
  $("[id*=O]").fadeTo(TICK_RATE * 2, 0.5);
  $("[id*=P]").fadeTo(TICK_RATE * 2, 1.0);
}
const highlightOpponentBoard = function() {
  $("[id*=O]").fadeTo(TICK_RATE * 2, 1.0);
  $("[id*=P]").fadeTo(TICK_RATE * 2, 0.5);
}

const verifyOptions = function(opts) {
  let retS = "";
  console.log(opts);
  if (!opts.username) {
    return "Please enter a valid name";
  }
  //if(isNaN(Number()))

  if (!enoughSpace(opts)) {
    return "Please either increase the number of tiles or decrease the number of ships. There is not enough space on the board to proceed";
  }
  if (opts.numBattle + opts.numCarrier + opts.numCruiser + opts.numDest + opts.numSub === 0) {
    return "You must have at least one ship to play!";
  }

  //if(0<Number(opts.numCarrier) && )

  return retS;
}


const getScore = function(opShips, plShips) {
  //Score will be defined as num
  let positivePoints = getPoints(opShips);
  let negativePoints = getPoints(plShips);

  let score = positivePoints - negativePoints;

  return score > 0 ? score : 0;//will never get negative scores
}

const getPoints = function(ships) {
  let points = 0;
  for (let ship of ships) {
    //get the tiles:
    for (let tile of ship.tiles) {
      if (tile.state === "d") {
        points++;
      }
    }
  }
  return points;
}

const highestScores = function(arr, player, score, maxPlayers) {
  const numPlayers = maxPlayers;
  //Adds the player to the list of players IF their score is higher than the rest. Adds them in order.
  let blnAdded = false;
  if (!arr || arr.length < 2) {
    arr = [];
    arr.push(player);
    arr.push(score);
  } else {
    for (let i = 1; i < arr.length; i += 2) {
      if (score >= arr[i]) { //Add the player in place. our array is in order since we're the only ones manipulating it
        arr.splice(i - 1, 0, score);
        arr.splice(i - 1, 0, player);
        blnAdded = true;
        break;
      }
    }

    //If the score is the lowest so far, but there is still room left in the leaderboard:
    if (!blnAdded && arr.length < numPlayers * 2) {//Times 2 because for each player we have two entries, the score and the player name
      arr.push(player);
      arr.push(score);
    }
    if (arr.length > numPlayers) {
      arr = arr.slice(0, numPlayers * 2); //Only take the top numPlayers
    }
  }

  return arr;
}



const enoughSpace = function(opts) {
  //Returns false if the amount of space taken by the ships is greater than 60% of the board space
  //I am using 60% to ensure there is very little the AI or player ends up in a state where they can no longer place pieces on the board due to the location of other pieces (even if there is technically enough space)

  let totSpaceAvail = opts.boardSize * opts.boardSize; //square board
  let totShipSpace =
    opts.numCarrier * 5 +
    opts.numBattle * 4 +
    opts.numCruiser * 3 +
    opts.numSub * 3 +
    opts.numDest * 2;
  console.log(totSpaceAvail);
  console.log(totShipSpace);
  return totSpaceAvail * 0.6 > totShipSpace;
};
