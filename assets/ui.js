var UI = function (state, requestGame) {
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
  this.elements.simulateButton.addEventListener('click', requestGame)
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
    if(this.state.isDebug) {
      this.elements.gameStatus.classList.remove('game-status--testing')
    } else {
      this.elements.gameStatus.classList.add('game-status--playing')
    }
  },

  updateInfo: function () {
    if(!this.state.info) return

    this.elements.infoTeamName.innerHTML = this.state.info.teamName
    // this.elements.infoTeamSocket.innerHTML = 'Socket: ' + this.state.info.socketId
    this.elements.infoTeamMembers.innerHTML = ''

    for(var i=0; i < this.state.info.authors.length; i++) {
      this.elements.infoTeamMembers.innerHTML += '<li>' + this.state.info.authors[i] + '</li>'
    }
  },

  renderSimulatedGame: function () {
    this.graph = new Graph(this.elements.graph, this.state.simulatedGame)
  },

  renderGame: function(payload) {
    this.clearGraph()
    this.graph = new Graph(this.elements.graph, payload)
  },

  clearGraph: function() {
    this.graph = null
    this.elements.graph.innerHTML = ''
  },

  updateSimulateButton: function () {
    if(this.state.isDebug) {
      this.elements.simulateButton.classList.remove('simulate-button--hidden')
    } else {
      this.elements.simulateButton.classList.add('simulate-button--hidden')
    }
  }
}
