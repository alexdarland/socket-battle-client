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

    var tileIndex = logic(payload.players, 8, [4, 6, 8], publicRound, publicHistory)
    payload.history[i][tileIndex].claims.push(3)
    publicHistory.push(payload.history[i])
  }

  return localSimulation.evaluateGame(payload)
}

localSimulation.evaluateGame = function (payload) {
  for(var i=0; i < payload.history.length; i++) {
    var round = payload.history[i]

    for(var j=0; j < round.length; j++) {
      var tile = round[j]

      if(tile.type === 'coins' && tile.claims.length === 1 ) {

        var player = payload.players[tile.claims[0]]
        player.score += tile.value
        player.scoreHistory.push(player.score)
        player.wins++

      } else if(tile.type === 'coins' && tile.claims.length > 1 ) {

        for(var k=0; k < tile.claims.length; k++) {
          var player = payload.players[tile.claims[k]]
          player.scoreHistory.push(player.score)
        }

      }
    }
  }
  return payload
}
