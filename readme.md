# Socket Battle Client

Welcome to the socket battle client! It's quick and easy to get up and running.

## Getting started
1. Download this repository from Github
2. Fill in info in the credentials.js file.
2. Add your logic in the index.js file where there are comments
3. Open up your index.html to test

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

## Ideas
* Only gets to test during battles - coding in the dark
* Should a player get concatinated logic or should they generate that themselves (wins, losses, score)?
* Varying amounts!
* Increasing speed - end with analytics
* Add link to Super Mario
* Takeaway - You have now build