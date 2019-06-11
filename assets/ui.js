var UI = function (state, requestGame, send) {
  this.state = state
  this.elements = {
    connectionStatus: document.getElementById('connection-status'),
    infoTeamName: document.getElementById('info-team-name'),
    infoTeamSocket: document.getElementById('info-team-socket'),
    infoTeamMembers: document.getElementById('info-team-members'),
    gameBoard: document.getElementById('game-board'),
    scoreBoard: document.getElementById('score-board'),
    controls: document.getElementById('controls'),
    rounds: document.getElementById('rounds'),
    simulateButton: document.getElementById('simulate-button'),
    graph: document.getElementById('graph'),
    savedGamesSelector: document.getElementById('saved-games-selector'),
    replayRoundButton: document.getElementById('replay')
  }
  this.elements.replayRoundButton.addEventListener('click', this.replayGame.bind(this))
  this.elements.simulateButton.addEventListener('click', requestGame)
  this.elements.savedGamesSelector.addEventListener('change', this.setGameVersion.bind(this))
  this.requestGame = requestGame
  this.send = send

  this.state.version = null
}

UI.prototype = {

  loadVersion: function() {
    var version = localStorage.getItem('version')

    if(this.versionExistsInSavedGames(version)) {
      this.state.version = version
      this.elements.replayRoundButton.classList.remove('replay--hidden')
    } else {
      this.state.version = null
      localStorage.removeItem('version')
      this.elements.replayRoundButton.classList.add('replay--hidden')
    }

    this.renderSavedGames()
  },

  versionExistsInSavedGames: function(version) {
    for(var i=0; i < this.state.info.savedGames.length; i++) {
      if(this.state.info.savedGames[i] === version) {
        return true
      }
    }

    return false
  },

  updateUI: function () {
    this.updateConnectionStatus()
    this.updateInfo()
    this.updateRounds()
    this.updateSimulateButton()
    this.renderSavedGames()
  },

  replayGame: function() {
    if(this.state.version) {
      this.send('request_replay_saved_game', this.state.version)
    }
  },

  updateConnectionStatus: function() {
    if(this.state.connected) {
      this.elements.connectionStatus.classList.add('connection-status--connected')
    } else {
      this.elements.connectionStatus.classList.remove('connection-status--connected')
    }
  },

  setVersion: function(version) {
    this.state.version = version
    localStorage.setItem('version', this.state.version)
  },

  renderSavedGames: function() {
    if(!this.state.info) return
    this.elements.savedGamesSelector.innerHTML = ''

    var option = document.createElement('option')
    option.innerText = 'Default'
    option.setAttribute('value', '')
    this.elements.savedGamesSelector.appendChild(option)

    for(var i=0; i < this.state.info.savedGames.length; i++) {
      var game = this.state.info.savedGames[i]
      option = document.createElement('option')
      option.setAttribute('value', game)
      option.innerText = 'Round ' + (i + 1)

      if(this.state.version === game) {
        option.setAttribute('selected', '')
      }

      this.elements.savedGamesSelector.appendChild(option)
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

  setGameVersion: function(event) {
    if(event.target.value) {
      this.state.version = event.target.value
      localStorage.setItem('version', this.state.version)
      this.elements.replayRoundButton.classList.remove('replay--hidden')
    } else {
      this.state.version = null
      localStorage.removeItem('version')
      this.elements.replayRoundButton.classList.add('replay--hidden')
    }

    this.requestGame()
  },

  updateInfo: function () {
    if(!this.state.info) return

    this.elements.infoTeamName.innerHTML = this.state.info.teamName
    this.elements.infoTeamMembers.innerHTML = ''

    for(var i=0; i < this.state.info.authors.length; i++) {
      this.elements.infoTeamMembers.innerHTML += '<li>' + this.state.info.authors[i] + '</li>'
    }

    this.renderSavedGames()
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
