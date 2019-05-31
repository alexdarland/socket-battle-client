# Socket Battle Client

Welcome to the socket battle client! It's quick and easy to get up and running.

## Getting started
1. Download this repository from Github
2. Fill in your teams details in the info.js file.
2. Build your algorithm in the logic.js file
3. Open up your index.html and click simulate to test your code

## How to play
The game consists of a 3x3 board with 4 players standing around the middle tiles on each side.
On all other tiles are coins in varying amount that a player can take. But there's a catch - if two or more players pick the same pile of coins, nobody gets anything.
Your task is to write an AI that predicts patterns of how your opponents choose to maximise your points.
For a more visual example see [Super Mario Party - Air To A Fortune](https://www.youtube.com/watch?v=zP8WrEG_aVU) ;)

## Payload
```js
const game = {
    number: 100,
    tiles: [ 3, 'C', 4, 'D', 7, 'A', 2, 'B', 1 ],
    position: 5,
    availableTiles: [ 2, 4, 8 ],
    history: [
        {
            number: 1,
            tiles: [ 1, 'A', 3, 'D', 7, 'B', 7, 'C', 4 ],
            playerA: {
                id: "A",
                name: "The Hoffs",
                position: 1,
                availableTiles: (3) [0, 2, 4],
                chosenTileIndex: 2,
                pointsAwarded: 3,
                error: null,
                totalLosses: 0,
                totalScore: 3,
                totalWins: 1
            },
            playerB: ...,
            playerC: ...,
            playerD: ... 
        },
        ...
    ]
}
```

### game.number
The current round iteration

### game.tiles
Describes the game board

## Code examples

### Check what all players did the last round

```js
for(var i=0; i < game.tiles.length; i++) {
  var tile = game.tiles[i]
  
  if(typeof tile === 'string') {
    var lastRoundInfo = game.history[game.number - 1]['player' + tile]
  }
}
```

### Check what a specific player did the last round

```js
for(var i=0; i < game.tiles.length; i++) {
  var playerALastRoundInfo = game.history[game.number - 1]['playerA']
}
```

### Return highest availableTiles values

```js
var highestTileIndex = null

for(var i=0; i < game.availableTiles.length; i++) {
  var availableTile = game.availableTiles[i]
  var value = game.tiles[availableTile]
  
  if(!highestTileIndex || value > game.tiles[highestTileIndex]) {
    highestTileIndex = availableTile
  }
}

return highestTileIndex
```
