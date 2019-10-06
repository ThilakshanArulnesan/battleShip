class GameLog {
  //currently not required

  constructor() {
    this.log = [];
  }

  logEntry = function(a1, player) {
    //Logs the entry in A1 notation. Can be used later for a replay feature.
    if (player === "player") {
      this.log.push("P" + a1);
    } else {
      this.log.push("O" + a1);
    }
  }

  //Save to log
  saveLog = function() {
    //writes the log to a file
  }

  clearLog = function() {
    this.log = [];
  }

}
