# Socket Battle Client

Welcome to the socket battle client! It's quick and easy to get up and running.

## Getting started
1. Download this repository from Github
2. Fill in your teams details in the info.js file.
2. Build your algorithm in the logic.js file
3. Open up your index.html and click simulate to test your code

## How to play
The game consists of a 3x3 board with 4 players standing around the middle tiles on each side.
On all other tiles there are coins in varying amount that a player can take. But there's a catch - if two players pick the same pile of coins nobody gets anything.
Your task is to write an AI that predicts patterns of how your opponents choose to maximise your income.
For a more visual example see [Super Mario Party - Air To A Fortune](https://www.youtube.com/watch?v=zP8WrEG_aVU)

## Socket events
This solution uses socket streams to connect to a game. There is only one event that you need to take into consideration - `input_requested`.
This event will trigger when the server wants to know which move you want to take.
To help you make a good decision which pile of coins to choose you will get data in this event (the payload parameter).
Here is how it looks and it's based on this data that you choose your strategy.
The amount of coins per tile will vary

## Payload
```js
const payload = {
    id: 'B',
    name: 'PuffyChair',
    history: [{ target: 3, didWin: true }, { target: 5, didWin: false }],
    availableValues: [1,5,2],
    board: [[1,'A',3],['B',5,'C'],[2,'D',1]],
    opponents: [
        {
            id: 'B',
            name: 'Fredrik och Alex',
            history: [{ target: 5, didWin: false }, { target: 5, didWin: true }]
        }
    ]
}
```

### Players
```js
var players = [{
    info: {
      id: 'fa086d4e-1fde-4746-86df-5c96b88bfd16',
      teamName: 'The Hoffs'
    },
    score: 10,
    scoreHistory: [0, 3, 7, 7],
    wins: 2
  },
  ...]
```

### tiles
`tiles` beskriver hur rutnätet ser ut och det finns 2 typer av rutor - En som innehåller pengar/poäng och en som innehåller spelare.
När typen är **"coin"** så finns det en egenskap som heter value. Denna beskriver hur många poäng man kan få.
När typen är **"player"** så finns det en egenskap som heter playerIndex.

```js
var tiles = [
    {
      id: 0,         // The tiles id
      type: 'coins', // Describes if the tile contains coins/points or a player
      value: 3,      // The amount of coins/points available for the taking
      claims: [],    // Does nothing during the current round
    },
    {
      id: 1,          // The tiles id
      type: 'player', // Describes if the tile contains coins/points or a player
      playerIndex: 0  // More info about the player using this index on the player array
    },
    ...
  ]
```

Vill man veta mer om denna spelaren så kan man skriva såhär.
```js
// Loop each tile
  for(var i=0; i < tiles.length; i++) {
    // Select the current tile in the loop
    var tile = tiles[i]
    // if the current tile is a player
    if (tile.type === 'player') {
      // Select the info from the players object
      var playerInfo = players[tile.playerIndex]
    }
  }
```