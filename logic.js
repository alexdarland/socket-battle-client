function logic(players, tilePosition, availableTiles, tiles, history) {

  // tilePosition: Your position on the board
  // availableTiles: Tiles that are available for you to claim
  // tiles: All tiles on the board with values and players
  // history: All games up until this round

  // TODO: Add your logic here
  // See readme.md for a detailed description of the payload object and instructions for return value
  // Hint: Analyse history and try to figure out how other players have coded their algorithm

  // console.log(players, tilePosition, availableTiles, tiles, history)

  var betterOptionForAggressive = tiles[0].value > tiles[4].value || tiles[2].value > tiles[4].value

  return betterOptionForAggressive && tiles[4].value > tiles[6].value ? 4 : tiles[6].value > tiles[8].value ? 6 : 8

  // return availableTiles[Math.floor(Math.random() * 3)]

}

function overrideAI1() {

}

function overrideAI2() {

}

function overrideAI3() {

}