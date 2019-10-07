const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require(`body-parser`);

//const cookieSession = require('cookie-session');

let playersConnected = false;
let numConnected = 0;

app.use(bodyParser.urlencoded({ extended: true }));//Parses the body of all requests as strings, and saves it as "requests.body"
/*
app.use(cookieSession({
  name: 'session',
  keys: ["kdoxk!012x", "adkekKey1"],
}));
app.use(methodOverride('_method')); //Allows for put requests
*/

//Middleware for cross-origin requests. You may change the prots
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // For testing purpose send request from port 5500
  //  res.header("Access-Control-Allow-Credentials", true); // For testing purpose send request from port 5500
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let p1Ships = {}; //First player to connect
let p2Ships = {}; //Second person to connect
app.post("/games", (req, res) => {
  //Creates a new game:
  let bod = req.body;

  numConnected++;
  if (numConnected === 2) { //AI mode
    console.log("Player 2 has connected");
    console.log("Their ship positions are: ")
    console.log(bod);
    playersConnected = true; //Don't need to wait for another player if against AI
    p2Ships = bod;
    res.send(p1Ships);
  } else {
    console.log("Player 1 has connected");
    console.log("Their ship positions are: ")
    console.log(bod);
    p1Ships = bod;
  }


  setInterval(() => {
    if (playersConnected) {
      res.send(p2Ships);
      clearInterval();
      return;
    }
  }, 5000);//checks every 5 seconds


});

/*
Assume 10x10
assume carrier,battleship,cruiser,destroyer
*/

app.post("/games/1", (req, res) => {
  //If two players are ready start
  let bod = req.body;


  if (playersConnected === 2) {
    //Start the game

  } else {
    response.send({
      status: "wait"
    });
  }

});


app.get("/urls/:shortURL", (req, res) => {
  //Pulls the shorturl for editing.

  let userID = req.session.user_id;
  let user = findUserById(userID, users);

  if (!user) {
    res.send(`<h1 style="color:red">Please login to access the url editor </p>`);
    return;
  }
  let filteredURLs = urlsForUser(userID, urlDatabase);

  let templateVars = {};
  if (filteredURLs && filteredURLs[req.params.shortURL]) { //If url exists
    templateVars = {
      shortURL: req.params.shortURL,
      longURL: filteredURLs[req.params.shortURL].longURL,
      date: filteredURLs[req.params.shortURL].date,
      numVisits: filteredURLs[req.params.shortURL].numVisits,
      visitedBy: filteredURLs[req.params.shortURL].visitedBy,
      user
    };//Must send as an object

  } else {
    templateVars = { //if it doesn't exist these parameters will display an error message that has a banner to login.
      shortURL: req.params.shortURL,
      longURL: undefined,
      user
    };
  }

  res.render("urls_show", templateVars); //don't need extension or path since /views is a standard
});

app.get("/urls.json", (req, res) => {
  //displays all urls as a JSON
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}!`);
});


const generateRandomString = function(numGenerate = 6) {
  //Generate a string of 6 alpha-numeric characters
  let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let retString = "";
  for (let i = 0; i < numGenerate; i++) {
    let rng = Math.floor(Math.random() * 62);
    retString += characters[rng];
  }

  return retString;
};
