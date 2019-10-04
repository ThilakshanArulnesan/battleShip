# Battleship

## Description
Battleship is an in-browser battleship game using HTML, CSS, Javascript, and JQuery. A basic AI is provided to play against.
Rules for battleship are found [here](https://www.cs.nmsu.edu/~bdu/TA/487/brules.htm)

## Getting Started
Run npm install to install dependencies (browserFS)
Open index.html in a browser to get started.

## Options

### Placement phase
During this phase of the game you are placing your ships. The order of ship placement is in a pre-defined order from largest ship to smallest. 

Click on a tile to place a ship that starts on that tile. Ships will either be placed vertically with the user-selected tile at the top or horizontally with the user selected tile on the left. You will not be able to place a tile if the ship is too large to fit either vertically or horizontally. Click the same tile again to rotate it (if it is possible to rotate). At any time before locking you may change your selection by clicking on another tile. Press the lock button to lock that ships placement. Continue placing ships until all the ships have been exhausted.

### Playing phase
Select a square on the opponents board to be able to make a guess. The console will display whether there was a hit or miss and a visual indicator will show any tiles that have already been selected. The AI will make a move immediately after any player move. The game is over once all ships have been sunk.

## Scoring
The local highscore is being tracked (tied to the browser) using the username provided in the options screen. The score is calculated as follows: (Number of enemy ship pieces detroyed) - (Number of player ship pieces left). If a score is negative (i.e. the player lost the game) a score of zero will be assigned instead. Note: If you would like an accurate leaderboard keep the number of ships and boardsize constant (otherwise there is a potential of scoring more points when there are more ships).

## Dependecies
- JQuery (imported using CDN)
- Bootstrap (for styling)



## Known bugs/Issues


## Future Features
- Multiplayer features
- User accounts
- Smarter AI 




## Image sources:
