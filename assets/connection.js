const Connection = function () {

  this.state = {
    connected: false,
    info: null,
    game: null,
    simulatedGame: null,
    isDebug: true
  }

  this.socket = io('http://alex-mbp.local')
  this.socket.on('connect', this.handleConnect.bind(this));
  this.socket.on('disconnect', this.handleDisconnect.bind(this));
  this.socket.on('register_user_success', this.handleRegisterUserSuccess.bind(this));
  this.socket.on('game_updated', this.handleGameUpdated.bind(this));
  this.socket.on('start_game', this.startGame.bind(this));
  this.socket.on('request_simulated_game_success', this.handleRequestSimulatedGameSuccess.bind(this));
  this.socket.on('request_logic', this.handleRequestLogic.bind(this));
  this.socket.on('request_game_success', this.handleRequestGameSuccess.bind(this));
  this.socket.on('request_saved_game_success', this.handleRequestGameSuccess.bind(this));
  this.socket.on('saved_games_updated', this.savedGamesUpdated.bind(this));

  this.setId = this.setId.bind(this)

  this.ui = new UI(this.state, this.requestGame.bind(this), this.send.bind(this))

}

Connection.generateId = function() {
  var d = new Date().getTime();

  if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
    d += performance.now(); //use high-precision timer if available
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

Connection.prototype = {

  savedGamesUpdated: function(payload) {
    this.state.info.savedGames = payload
    this.ui.setVersion(payload[payload.length - 1])
    this.ui.renderSavedGames()
  },

  setId: function () {
    var existingId = localStorage.getItem('persistent-key')
    if(existingId) {
      info.id = existingId
    } else {
      var newPersistentId = Connection.generateId()
      localStorage.setItem('persistent-key', newPersistentId)
      info.id = newPersistentId
    }
  },

  handleConnect: function () {
    this.state.connected = true
    this.ui.updateUI()
    this.setId()
    this.socket.emit('register_user', info)
  },

  handleDisconnect: function () {
    this.state.connected = false
    this.ui.updateConnectionStatus()
  },

  handleRegisterUserSuccess: function (payload) {
    this.state.info = payload.user
    this.state.isDebug = payload.isDebug
    this.ui.updateInfo()
    this.ui.loadVersion()

    this.requestGame()
  },

  handleRequestGameSuccess: function(payload) {
    this.ui.renderGame(payload)
    console.log(payload)
  },

  handleRequestLogic: function(payload) {
    this.socket.emit('request_logic_success', Object.assign(payload, { logic: logic.toString() }))
  },

  handleGameUpdated: function (payload) {
    this.state.game = payload
  },

  startGame: function (payload) {
    this.state.isDebug = payload.isDebug
    this.state.simulatedGame = null
    this.ui.clearGraph()
    this.ui.updateSimulateButton()
    this.ui.updateGameStatus()
  },

  requestGame: function () {
    if(!this.validateLogic()) { return }

    if(this.state.version) {
      this.socket.emit('request_saved_game', { gameId: this.state.version, logic: logic.toString() })
    } else {
      this.socket.emit('request_game', { userIds: [info.id] })
    }
  },

  validateLogic: function() {
    var result = logic({
      playerId: 'A',
      tiles:[ 4, 'C', 4, 'B', 9, 'D', 2, 'A', 2 ],
      history:[
        {
          before: [ 3, 'B', 5, 'D', 3, 'C', 2, 'A', 3 ],
          after: [ 3, '', 'B', '', 'C,D', '', 2, 'A', 3 ]
        }
      ]
    })

    if(/^-?\d+\.?\d*$/.test(result.toString())) {
      return true
    } else {
      throw new Error(result + ' is not a valid output!')
    }
  },

  handleRequestSimulatedGameSuccess: function (payload) {
    this.state.simulatedGame = localSimulation.simulate(this.state.info, payload)
    this.ui.renderSimulatedGame()
  },

  send: function (event, payload) {
    this.socket.emit(event, payload)
  }
}

new Connection()















