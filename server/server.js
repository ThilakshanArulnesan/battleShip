const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require(`body-parser`);


let playersConnected = false;
let numConnected = 0;

app.use(bodyParser.urlencoded({ extended: true }));//Parses the body of all requests as strings, and

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // For testing purpose send request from port 5500

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let p1Ships = {}; //First player to connect
let p2Ships = {}; //Second person to connect
let coinFlip;
let started = false;
app.post("/games", (req, res) => {
  //Creates a new game:
  let bod = req.body;
  numConnected++;
  if (numConnected === 2) {



    playersConnected = true; //Don't need to wait for another player if against AI
    p2Ships = bod;
    p2Ships.first = coinFlip >= 0.5;
    p2Ships.id = "p1"; //Player 1 is sent p2 ships
    res.send(p1Ships);
  } else {
    coinFlip = Math.random();


    p1Ships = bod;
    p1Ships.id = "p2"; //P2 is sent player 1 ships
    p1Ships.first = coinFlip < 0.5;
  }


  setInterval(() => {
    if (playersConnected && !started) {
      res.send(p2Ships);
      started = true;
      clearInterval();
      return;
    }
  }, 5000);//checks every 5 seconds


});

/*
Assume 10x10
assume carrier,battleship,cruiser,destroyer
*/
let p1Move;
let p2Move;
app.get("/games/1/moves/:id", (req, res) => {
  let id = req.params.id;



  if (id === "p1") {
    if (p2Move) {

      res.send({ p2Move });
    } else {
      let s = setInterval(() => {
        if (p2Move) {

          clearInterval(s);
          res.send({ move: p2Move });
          p2Move = undefined;
          return;
        }

      }, 1000);//checks every 5 seconds
    }
  } else {
    if (p1Move) {

      res.send({ p1Move });
    } else {
      let s = setInterval(() => {
        if (p1Move) {

          res.send({ move: p1Move });
          p1Move = undefined;
          clearInterval(s);
          return;
        }

      }, 1000);//checks every 5 seconds
    }


  }


});

app.post("/games/1/moves/:id", (req, res) => {
  let bod = req.body;
  let id = req.params.id;

  if (id === "p1") {
    p1Move = bod.move;
  } else {
    p2Move = bod.move;
  }

  res.send("OK");

});


app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}!`);
});

