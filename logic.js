function logic(game) {

  function getPlayerPosition(playerId) {
    return game.tiles.indexOf(playerId)
  }

  function getAvailableTiles (playerPosition) {
    return playerPosition === 1 ? [0,2,4] :
           playerPosition === 3 ? [0,4,6] :
           playerPosition === 5 ? [2,4,8] :
           playerPosition === 7 ? [4,6,8] : null
  }

  function predictMove(playerId) {

  }

  function isNeighbour(playerId, ) {

  }

  var playerIds = ['A', 'B', 'C', 'D']
  var playerPosition = getPlayerPosition(game.playerId)
  var availableTiles = getAvailableTiles(playerPosition)
  var predictions = []

  playerIds.map(playerId => { predictions.push(playerId) })

  return availableTiles[Math.floor(Math.random() * availableTiles.length)]
}
