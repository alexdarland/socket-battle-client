const Connection = function () {

  this.state = {
    connected: false,
    info: null,
    game: null,
    simulatedGame: null
  }

  this.socket = io('http://alex-mbp.local')
  this.socket.on('connect', this.handleConnect.bind(this));
  this.socket.on('disconnect', this.handleDisconnect.bind(this));
  this.socket.on('register_user_success', this.handleRegisterUserSuccess.bind(this));
  this.socket.on('game_updated', this.handleGameUpdated.bind(this));
  this.socket.on('start_game', this.startGame.bind(this));
  this.socket.on('request_simulated_games_success', this.handleRequestSimulatedGamesSuccess.bind(this));

  this.ui = new UI(this.state, this.requestSimulatedGames.bind(this))

}

Connection.prototype = {

  handleConnect: function () {
    this.state.connected = true
    this.ui.updateUI()
    this.socket.emit('register_user', info)
  },

  handleDisconnect: function () {
    this.state.connected = false
    this.ui.updateConnectionStatus()
  },

  handleRegisterUserSuccess: function (payload) {
    this.state.info = payload
    this.ui.updateInfo()

    if(this.state.info.isDebug) {
      this.socket.emit('request_debug_data')
    } else {
      this.socket.emit('request_game')
    }
  },

  handleGameUpdated: function (payload) {
    this.state.game = payload
    this.ui.updateGame()
  },

  requestMove: function (payload) {
    this.socket.emit('request_move', payload)
  },

  requestNextRound: function () {
    this.socket.emit('request_next_round')
  },

  startGame: function (payload) {
    console.log(payload)
  },

  requestSimulatedGames: function () {
    this.socket.emit('request_simulated_games')
  },

  handleRequestSimulatedGamesSuccess: function (payload) {
    this.state.simulatedGame = localSimulation.simulate(this.state.info, payload)
    // this.ui.updateSimulateButton()
    this.ui.renderSimulatedGame()
  }
}

new Connection()
