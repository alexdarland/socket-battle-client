var localSimulation = {}

localSimulation.simulate = function (playerInfo, payload) {
  var publicHistory = []
  payload.players[3].info = playerInfo

  for(var i=0; i < payload.history.length; i++) {

    var publicRound = JSON.parse(JSON.stringify(payload.history[i]))

    for(var j=0; j < publicRound.length; j++) {
      if(publicRound[j].type === 'coins') {
        publicRound[j].claims = []
      }
    }

    var playerIndex = 3
    var tilePosition = 7
    var availableTiles = [4, 6, 8]

    try {
      var tileIndex = logic(payload.players, tilePosition, availableTiles, publicRound, publicHistory)

      if(availableTiles.indexOf(tileIndex) === -1) {
        throw new Error('Tile index ' + tileIndex + ' is not valid')
      } else {
        payload.history[i][tileIndex].claims.push(playerIndex)
      }
    } catch (e) {
      payload.history[i][tilePosition].error = e.message
    }

    publicHistory.push(payload.history[i])
  }

  return localSimulation.evaluateGame(payload)
}

localSimulation.evaluateGame = function (payload) {
  var player, i, j, k

  for(i=0; i < payload.players.length; i++) {
    player = payload.players[i]
    player.scoreHistory = [0]
    player.score = 0
    player.wins = 0
  }

  for(i=0; i < payload.history.length; i++) {
    var round = payload.history[i]

    for(j=0; j < round.length; j++) {
      var tile = round[j]

      if(tile.type === 'coins' && tile.claims.length === 1 ) {
        player = payload.players[tile.claims[0]]
        player.score += tile.value
        player.scoreHistory.push(player.score)
        // player.wins++
      } else if(tile.type === 'coins' && tile.claims.length > 1 ) {
        for(k=0; k < tile.claims.length; k++) {
          player = payload.players[tile.claims[k]]
          player.scoreHistory.push(player.score)
        }
      } else if(tile.type === 'player' && tile.error) {
        payload.players[tile.playerIndex].scoreHistory.push(payload.players[tile.playerIndex].score)
      }
    }

  }
console.log(payload.players[0].scoreHistory.length, payload.players[1].scoreHistory.length, payload.players[2].scoreHistory.length, payload.players[3].scoreHistory.length)
console.log(payload)
  return payload
}
