var UI = function (state, requestSimulatedGames) {
  this.state = state
  this.elements = {
    connectionStatus: document.getElementById('connection-status'),
    infoTeamName: document.getElementById('info-team-name'),
    infoTeamSocket: document.getElementById('info-team-socket'),
    infoTeamMembers: document.getElementById('info-team-members'),
    gameStatus: document.getElementById('game-status'),
    gameBoard: document.getElementById('game-board'),
    scoreBoard: document.getElementById('score-board'),
    controls: document.getElementById('controls'),
    rounds: document.getElementById('rounds'),
    simulateButton: document.getElementById('simulate-button'),
    graph: document.getElementById('graph')
  }
  this.graph = null
  this.elements.simulateButton.addEventListener('click', requestSimulatedGames)
}

UI.prototype = {

  updateUI: function () {
    this.updateConnectionStatus()
    this.updateGameStatus()
    this.updateInfo()
    this.updateRounds()
    this.updateSimulateButton()
  },

  updateConnectionStatus: function() {
    if(this.state.connected) {
      this.elements.connectionStatus.classList.add('connection-status--connected')
    } else {
      this.elements.connectionStatus.classList.remove('connection-status--connected')
    }
  },

  updateRounds: function() {
    if(!this.state.game) return
    this.elements.rounds.innerHTML = 'Round: ' + this.state.game.round + '/' + this.state.game.maxRounds
  },

  updateGameStatus: function() {
    if(this.state.connected) {
      this.elements.gameStatus.classList.add('game-status--playing')
    } else {
      this.elements.gameStatus.classList.remove('game-status--testing')
    }
  },

  updateGame: function() {
    this.updateScoreBoard()
    this.updateBoard()
    this.updateRounds()
    console.log(this.state)
  },

  updateScoreBoard: function() {
    this.elements.scoreBoard.innerHTML = ''
    
    for(var i=0; i < this.state.game.players.length; i++) {
      var player = this.state.game.players[i]
      this.elements.scoreBoard.innerHTML += '<li><span>' + player.info.teamName + '</span> <span>' + player.score + '</span></li>'
    }
  },

  updateBoard: function() {
    this.elements.gameBoard.innerHTML = ''

    for(var i=0; i < this.state.game.tiles.length; i++) {
      this.elements.gameBoard.appendChild(this.createTile(this.state.game.tiles[i]))
    }
  },

  createTile: function(tileData) {
    var tile = document.createElement('div')
    tile.classList.add('game-board__tile')
    tile.setAttribute('data-tile-number', tileData.id)

    if(tileData.type === 'coins') {
      tile.innerHTML = tileData.value
    } else {
      tile.innerHTML = '<img src="assets/img/player.png"/><span>' + this.state.game.players[tileData.playerIndex].info.teamName + '</span>'
      if(tileData.faultyMove) {
        tile.classList.add('game-board__tile--faulty-move')
      } else if(tileData.claimedTile) {
        setTimeout(function () {
          tile.classList.add('game-board__tile--move-' + tileData.direction)
        }, 10)
      } else if(tileData.direction) {
        tile.classList.add('game-board__tile--bounce-' + tileData.direction)
      }
    }

    return tile
  },

  updateInfo: function () {
    if(!this.state.info) return

    this.elements.infoTeamName.innerHTML = this.state.info.teamName
    this.elements.infoTeamSocket.innerHTML = 'Socket: ' + this.state.info.socket
    this.elements.infoTeamMembers.innerHTML = ''

    for(var i=0; i < this.state.info.authors.length; i++) {
      this.elements.infoTeamMembers.innerHTML += '<li>' + this.state.info.authors[i] + '</li>'
    }
  },

  renderSimulatedGame: function () {
    this.graph = new Graph(this.elements.graph, this.state.simulatedGame)
  },

  clearGraph: function() {
    this.graph = null
    this.elements.graph.innerHTML = ''
  },

  updateSimulateButton: function () {
    if(this.state.simulatedGame) {
      this.elements.simulateButton.classList.add('simulate-button--hidden')
    } else {
      this.elements.simulateButton.classList.remove('simulate-button--hidden')
    }
  }
}
