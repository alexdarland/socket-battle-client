function logic(round, players, tilePosition, availableTiles, tiles, history) {

  // tilePosition: Your position on the board
  // availableTiles: Tiles that are available for you to claim
  // tiles: All tiles on the board with values and players
  // history: All games up until this round

  // TODO: Add your logic here
  // See readme.md for a detailed description of the payload object and instructions for return value
  // Hint: Analyse history and try to figure out how other players have coded their algorithm

  // console.log(players, tilePosition, availableTiles, tiles, history)

  console.log(tiles)
  var highValueTile = 4
  var middleValueTile = 6
  var lowValueTile = 8

  var aggressivePlayerWillNotPickMiddle = tiles[0].value > tiles[4].value || tiles[2].value > tiles[4].value
  var middleValueTileHasBadProfit = tiles[6].value < 4
  var highValueTileIsGreaterThanMiddleValueTile = tiles[4].value > tiles[6].value
  var middleValueTileIsGreaterThanLowValueTile = tiles[6].value > tiles[8].value

  var round = [1, 'A', 3, 'B', 7, 'C', 5, 'D', 3]
  var round = [[], 'A', [], 'B', ['A'], 'C', ['C','B'], 'D', ['D']]

  round
  if(!aggressivePlayerWillNotPickMiddle && middleValueTileHasBadProfit) {
    return highValueTile
  } else {
    return aggressivePlayerWillNotPickMiddle && highValueTileIsGreaterThanMiddleValueTile ? highValueTile :
        middleValueTileIsGreaterThanLowValueTile ? middleValueTile : lowValueTile
  }

  // return availableTiles[Math.floor(Math.random() * 3)]

  // return 'asd'

}

function overrideAI1() {

}

function overrideAI2() {

}

function overrideAI3() {

}