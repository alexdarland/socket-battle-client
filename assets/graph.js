var Graph = function (rootElement, model) {
  this.elements = {
    root: rootElement,
    canvas: null
  }

  this.settings = {}

  this.settings.fontSizes = {
    large: 24,
    base: 16,
    small: 10
  }
  this.settings.container = {
    padding: 100,
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  }
  this.settings.lineGraph = {
    top: 150,
    bottom: (this.settings.container.height *.85) - 70,
    height: (this.settings.container.height *.85) - 150 - 70,
    left: 70,
    right: (this.settings.container.width / 2) - 35,
    width: (this.settings.container.width / 2) - 70 - 35
  }
  this.settings.board = {
    left: this.settings.lineGraph.right + 262,
    top: this.settings.lineGraph.top,
    tileWidth: 80,
    tileHeight: 80
  }
  this.settings.percentage = {
    left: this.settings.lineGraph.right + 100,
    top: this.settings.board.top + (this.settings.board.tileHeight * 3) + 89,
    circleWidth: 100,
    circleHeight: 100
  }
  this.settings.errorMessages = {
    left: this.settings.lineGraph.left,
    top: this.settings.lineGraph.bottom + 45,
    width: this.settings.lineGraph.width,
    height: (this.settings.container.height *.15)
  }
  this.settings.colors = ['#98CD22','#F33530','#FAD718', '#0FC0EC']

  this.ctx = null
  this.model = model
  this.maxScore = 0
  this.playerIds = ['A', 'B', 'C', 'D']
  this.step = this.settings.lineGraph.width / this.model.length
  this.createCanvas()
  this.setMaxScore()
  this.animate()

}

Graph.prototype = {

  animate: function() {
    var _this = this
    var counter = 0
    var interval = null

    var stop = function() {
      clearInterval(interval)
      _this.drawFinalLineGraphValues()
      _this.registerEvents()
    }

    interval = setInterval(function () {
      _this.currentRound = _this.model[counter]
      _this.ctx.clearRect(0,0, _this.settings.container.width, _this.settings.container.height)

      try {
        _this.drawBackground()
        _this.drawGraph()
        _this.drawLines()
        _this.drawGraphErrors()
        _this.drawPercentages()
        _this.drawBoard()
      } catch (e) {
        console.log(e)
        stop()
      }

      counter++

      if(counter === _this.model.length) {
        stop()
      }
    }, 30)
  },

  scaleCanvas: function() {
    const devicePixelRatio = window.devicePixelRatio || 1;

    const backingStoreRatio = (
        this.ctx.webkitBackingStorePixelRatio ||
        this.ctx.mozBackingStorePixelRatio ||
        this.ctx.msBackingStorePixelRatio ||
        this.ctx.oBackingStorePixelRatio ||
        this.ctx.backingStorePixelRatio || 1
    );

    const ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
      this.elements.canvas.width = this.settings.container.width * ratio;
      this.elements.canvas.height = this.settings.container.height * ratio;
      this.elements.canvas.style.width = this.settings.container.width + 'px';
      this.elements.canvas.style.height = this.settings.container.height + 'px';
    }
    else {
      this.elements.canvas.width = this.settings.container.width;
      this.elements.canvas.height = this.settings.container.height;
      this.elements.canvas.style.width = '';
      this.elements.canvas.style.height = '';
    }
    this.ctx.scale(ratio, ratio);
  },

  createCanvas: function () {
    this.elements.root.innerHTML = ''
    this.elements.canvas = document.createElement('canvas')
    this.ctx = this.elements.canvas.getContext('2d')
    this.scaleCanvas()
    this.ctx.font = this.settings.fontSizes.base + 'px Helvetica Neue';
    this.ctx.fillStyle = "#fff";
    this.elements.root.appendChild(this.elements.canvas)
  },

  registerEvents() {
    this.elements.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
  },

  handleMouseMove: function(event) {
    this.ctx.clearRect(0,0, this.settings.container.width, this.settings.container.height)
    this.currentRound = this.model[this.model.length - 1]
    this.drawBackground()
    this.drawGraph()
    this.drawLines()
    this.drawGraphErrors()
    this.drawFinalLineGraphValues()

    // Set currentRound after rendering things that will not change
    var left = event.clientX - this.settings.lineGraph.left
    var roundedPosX = Math.floor(left / this.step) * this.step
    var roundIndex = Math.ceil(roundedPosX / this.step) - 1
    this.currentRound = this.model[roundIndex]

    this.drawMouseLine(event)
    this.drawErrorMessages()
    this.drawPercentages()
    this.drawBoard()
  },

  drawBackground: function() {
    this.ctx.fillStyle = '#232A30';
    this.ctx.fillRect(0, 0, this.settings.container.width, this.settings.container.height)
  },

  drawMouseLine: function(event) {
    var isWithinGraph =
        event.clientX >= this.settings.lineGraph.left &&
        event.clientX <= this.settings.lineGraph.right &&
        event.clientY >= this.settings.lineGraph.top &&
        event.clientY <= this.settings.lineGraph.bottom

    if(isWithinGraph) {
      var left = event.clientX - this.settings.lineGraph.left
      var roundedPosX = Math.floor(left / this.step) * this.step
      var roundIndex = Math.ceil(roundedPosX / this.step)

      this.ctx.lineWidth = .5
      this.ctx.strokeStyle = '#ccc'
      this.ctx.fillStyle = "#ccc";
      this.ctx.beginPath()
      this.ctx.moveTo(this.settings.lineGraph.left + roundedPosX, this.settings.lineGraph.bottom)
      this.ctx.lineTo(this.settings.lineGraph.left + roundedPosX, this.settings.lineGraph.top)
      this.ctx.stroke()

      this.ctx.fillStyle = "#fff";
      this.ctx.textAlign = "left"
      this.ctx.fillText("Round: " + roundIndex, roundedPosX + this.settings.lineGraph.left, this.settings.lineGraph.top - 10)

      // Draw hover dots for lines
      /*for(var i=0; i < this.playerIds.length; i++) {
        var player = this.currentRound['player' + this.playerIds[i]]
        var position = {
          x: roundedPosX + this.settings.lineGraph.left,
          y: this.settings.lineGraph.bottom - (this.settings.lineGraph.height * (player.totalScore/this.maxScore))
        }
        this.ctx.fillStyle = this.settings.colors[i]
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, 5, 0, 2 * Math.PI)
        this.ctx.fill()
      }*/

      /*if(roundIndex !== 0) {
        this.drawBoard(this.model.history[roundIndex - 1])
      }*/
    } else {
      this.currentRound = this.model[this.model.length - 1]
    }
  },

  drawArrowhead: function(context, from, to, radius) {
    var x_center = to.x;
    var y_center = to.y;

    var angle;
    var x;
    var y;

    context.beginPath();

    angle = Math.atan2(to.y - from.y, to.x - from.x)
    x = radius * Math.cos(angle) + x_center;
    y = radius * Math.sin(angle) + y_center;

    context.moveTo(x, y);

    angle += (1.0/3.0) * (2 * Math.PI)
    x = radius * Math.cos(angle) + x_center;
    y = radius * Math.sin(angle) + y_center;

    context.lineTo(x, y);

    angle += (1.0/3.0) * (2 * Math.PI)
    x = radius *Math.cos(angle) + x_center;
    y = radius *Math.sin(angle) + y_center;

    context.lineTo(x, y);

    context.closePath();

    context.fill();
  },

  drawBoard: function() {
    if(!this.currentRound) return

    this.ctx.font = "12pt Helvetica Neue";
    this.ctx.fillStyle = "#ccc";
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = '#333'
    this.ctx.rect(this.settings.board.left, this.settings.board.top, this.settings.board.tileWidth * 3, this.settings.board.tileHeight * 3)
    this.ctx.fillStyle = "#fff";

    for(var i=0; i < this.currentRound.tiles.length; i++) {
      var value = this.currentRound.tiles[i]
      var posX = this.settings.board.left + (this.settings.board.tileWidth * i) % (this.settings.board.tileWidth * 3)
      var posY = this.settings.board.top + (this.settings.board.tileHeight * (Math.floor(i / 3)))
      var tileIsPlayer = typeof value === 'string'
      var tileClaims = 0

      this.ctx.beginPath();
      this.ctx.lineWidth = 1
      this.ctx.fillStyle = typeof value === 'string' ? '#282B32' : '#2B2E35';

      for(var j=0; j < this.playerIds.length; j++) {
        var player = this.currentRound['player' + this.playerIds[j]]
        if(player.chosenTileIndex === i) {
          tileClaims++
        }
      }

      if(!tileIsPlayer && tileClaims > 0) {
        this.ctx.fillStyle = tileClaims === 1 ? '#2C362F' : '#522D2F'
      }

      this.ctx.fillRect(posX, posY, this.settings.board.tileWidth, this.settings.board.tileHeight)
      this.ctx.strokeStyle = '#656C72'
      this.ctx.rect(posX, posY, this.settings.board.tileWidth, this.settings.board.tileHeight)
      this.ctx.stroke()

      this.ctx.beginPath();
      this.ctx.fillStyle = '#656C72';
      this.ctx.font = "12pt Helvetica Neue";
      this.ctx.textAlign = "left"
      this.ctx.fillText(i, posX + 10, posY + 20);

      if(tileIsPlayer) {
        var colorIndex = value === 'A' ? 0 : value === 'B' ? 1 : value === 'C' ? 2 : 3
        this.ctx.fillStyle = this.settings.colors[colorIndex];
        this.ctx.beginPath();
        this.ctx.arc(posX + (this.settings.board.tileWidth / 2), posY + (this.settings.board.tileHeight / 2), this.settings.board.tileHeight / 4, 0, 2 * Math.PI)
        this.ctx.fill()
      } else {
        this.ctx.textAlign = "center";
        this.ctx.textBaseline
        this.ctx.fillStyle = '#ebebeb';
        this.ctx.fillText(value, posX + (this.settings.board.tileWidth / 2), posY + (this.settings.board.tileHeight / 2));
      }
    }

    for(var i=0; i < this.playerIds.length; i++) {
      var player = this.currentRound['player' + this.playerIds[i]]

      if(!player.error) {
        var playerTileCenter = this.getTileCenterOnBoard(player.position)
        var chosenTileCenter = this.getTileCenterOnBoard(player.chosenTileIndex)

        this.ctx.fillStyle = this.settings.colors[i];

        var delta = {
          x: chosenTileCenter.x - (chosenTileCenter.x - playerTileCenter.x) * .5,
          y: chosenTileCenter.y - (chosenTileCenter.y - playerTileCenter.y) * .5
        }

        delta.x = delta.x === chosenTileCenter.x ? delta.x : delta.x + (playerTileCenter.x > chosenTileCenter.x ? -6.5 : 6.5)
        delta.y = delta.y === chosenTileCenter.y ? delta.y : delta.y + (playerTileCenter.y > chosenTileCenter.y ? -6.5 : 6.5)

        // Draw line
        this.ctx.beginPath();
        this.ctx.fillStyle = this.settings.colors[i];
        this.ctx.strokeStyle = this.settings.colors[i];
        this.ctx.lineWidth = 5
        this.ctx.moveTo(playerTileCenter.x, playerTileCenter.y);
        this.ctx.lineTo(delta.x, delta.y);
        this.ctx.stroke()

        this.drawArrowhead(this.ctx, { x: playerTileCenter.x, y: playerTileCenter.y }, delta, 12)
      }
    }
  },

  getTileCenterOnBoard: function(tileIndex) {
    var x = this.settings.board.left + (this.settings.board.tileWidth * tileIndex) % (this.settings.board.tileWidth * 3)
    var y = this.settings.board.top + (this.settings.board.tileHeight * (Math.floor(tileIndex / 3)))
    return { x: x + (this.settings.board.tileWidth / 2), y: y  + (this.settings.board.tileHeight / 2)}
  },

  drawPercentages: function() {
    if(!this.currentRound) return

    for(var i=0; i < this.playerIds.length; i++) {
      var playerId = 'player' + this.playerIds[i]
      var player = this.currentRound[playerId]
      var percentage = player.totalWins / this.currentRound.number
      var degrees = 360 * percentage
      var position = {
        x: this.settings.percentage.left + (this.settings.percentage.circleWidth + 55) * i,
        y: this.settings.percentage.top + (this.settings.percentage.circleWidth / 2)
      }

      function degreesToRadians(deg) {
        return (deg/180) * Math.PI;
      }

      this.ctx.strokeStyle = '#373A3F';
      this.ctx.lineWidth = 7

      this.ctx.beginPath();
      this.ctx.arc(position.x + (this.settings.percentage.circleWidth / 2), position.y, this.settings.percentage.circleWidth / 2, 0, degreesToRadians(360))
      this.ctx.stroke()

      this.ctx.strokeStyle = this.settings.colors[i];
      this.ctx.lineCap = "round";

      this.ctx.beginPath();
      this.ctx.arc(position.x + (this.settings.percentage.circleWidth / 2), position.y, this.settings.percentage.circleWidth / 2, 0, degreesToRadians(degrees))
      this.ctx.stroke()

      this.ctx.fillStyle = '#fff'
      this.ctx.textAlign = "center";
      this.ctx.font = "bold 18pt Helvetica Neue";
      this.ctx.fillText(Math.floor(percentage*100) + '%', position.x + (this.settings.percentage.circleWidth / 2) + 5, position.y);
      this.ctx.font = "10pt Helvetica Neue";
      this.ctx.fillText('Win rate', position.x + (this.settings.percentage.circleWidth / 2), position.y + 20);

      this.ctx.font = "bold 12pt Helvetica Neue";
      this.ctx.fillText(player.name, position.x + (this.settings.percentage.circleWidth / 2), this.settings.percentage.top - 20);

      this.ctx.font = "10pt Helvetica Neue";

      var scoreValues = {}
      var j

      for(j = 0; j < this.currentRound.number; j++) {
        var pointsAwarded = this.model[j][playerId].pointsAwarded
        scoreValues[pointsAwarded] = scoreValues[pointsAwarded] ? scoreValues[pointsAwarded] + 1 : 1
        if(pointsAwarded !== 0) {
        }
      }

      var mostCommonValue = null

      for(j=0; j < Object.keys(scoreValues).length; j++) {
        var key = Object.keys(scoreValues)[j]
        var value = scoreValues[key]

        if (key !== '0' && (mostCommonValue == null || value > mostCommonValue.value)) {
          mostCommonValue = { key: key, value: value }
        }
      }

      var text = mostCommonValue ? mostCommonValue.key : 'NA'

      this.ctx.fillText(
          'Points mode: ' + text,
          position.x + (this.settings.percentage.circleWidth / 2),
          this.settings.percentage.top + this.settings.percentage.circleHeight + 30
      )
    }
  },

  setMaxScore: function() {
    var lastRound = this.model[this.model.length - 1]
    var maxScore = 0

    for(var i=0; i < this.playerIds.length; i++) {
      var player = lastRound['player' + this.playerIds[i]]
      if (player.totalScore > maxScore) {
        maxScore = player.totalScore
      }
    }

    this.maxScore = Math.ceil(maxScore / 100) * 100
  },

  drawGraph: function () {
    // Background
    var gradient = this.ctx.createLinearGradient(0, this.settings.lineGraph.bottom, 0, this.settings.lineGraph.top)
    gradient.addColorStop(0, '#373A3F');
    gradient.addColorStop(0.4, '#232A30');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(this.settings.lineGraph.left, this.settings.lineGraph.top, this.settings.lineGraph.width, this.settings.lineGraph.height)

    this.ctx.font = "12pt Helvetica Neue";
    this.ctx.strokeStyle = '#fff'
    this.ctx.fillStyle = '#fff';
    this.ctx.lineWidth = .5

    // Left line
    this.ctx.beginPath();
    this.ctx.moveTo(this.settings.lineGraph.left, this.settings.lineGraph.top);
    this.ctx.lineTo(this.settings.lineGraph.left, this.settings.lineGraph.bottom);
    this.ctx.stroke();

    // Bottom line
    this.ctx.beginPath();
    this.ctx.moveTo(this.settings.lineGraph.left, this.settings.lineGraph.bottom);
    this.ctx.lineTo(this.settings.lineGraph.right, this.settings.lineGraph.bottom);
    this.ctx.stroke();

    // 100th lines
    var numberOfLines = this.maxScore / 100

    this.ctx.strokeStyle = '#ccc'
    this.ctx.fillStyle = '#ccc';

    for(var i=0; i < numberOfLines; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.settings.lineGraph.left, this.settings.lineGraph.bottom - this.settings.lineGraph.height/numberOfLines * i);
      this.ctx.lineTo(this.settings.lineGraph.right, this.settings.lineGraph.bottom - this.settings.lineGraph.height/numberOfLines * i);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = '#fff'
    this.ctx.fillStyle = '#fff';

    // Labels
    this.ctx.save();
    this.ctx.translate(this.settings.lineGraph.left - 20, this.settings.lineGraph.top + (this.settings.lineGraph.height / 2));
    this.ctx.rotate(-Math.PI/2);
    this.ctx.textAlign = "center";
    this.ctx.fillText("Score", 0, 0);
    this.ctx.restore();

    /*this.ctx.textAlign = "center"
    this.ctx.fillText("Rounds", this.settings.container.width / 2, this.settings.lineGraph.bottom + 20);*/

    this.ctx.textAlign = "right";
    this.ctx.fillText(this.maxScore, this.settings.lineGraph.left - 10, this.settings.lineGraph.top + 16);
  },

  drawLines: function () {

    for(var i=0; i < this.playerIds.length; i++) {
      var playerId = this.playerIds[i]
      this.ctx.beginPath();
      this.ctx.moveTo(this.settings.lineGraph.left, this.settings.lineGraph.bottom);
      this.ctx.strokeStyle = this.settings.colors[i]
      this.ctx.lineWidth = 2

      for(var j=0; j < this.currentRound.number; j++) {
        var score = this.model[j]['player'+ playerId].totalScore
        var position ={
          x: this.settings.lineGraph.left + this.step * (j + 1),
          y: this.settings.lineGraph.bottom - (this.settings.lineGraph.height * (score/this.maxScore))
        }

        this.ctx.lineTo(position.x, position.y);

      }
      this.ctx.stroke();
    }
  },

  getErrorsInRound: function(roundIndex) {
    if(roundIndex < 0) return

    var errors = []

    for(var i=0; i < this.playerIds.length; i++) {
      var playerId = this.playerIds[i]
      var player = this.model[roundIndex]['player'+ playerId]

      if(player.error) {
        errors.push({ player: player, playerIndex: i })
      }
    }

    return errors
  },

  drawGraphErrors: function() {
    for(var i=0; i < this.currentRound.number; i++) {
      var errors = this.getErrorsInRound(i)

      // Render errors
      for(var j=0; j < errors.length; j++) {
        var error = errors[j]

        var position ={
          x: this.settings.lineGraph.left + this.step * (i + 1),
          y: this.settings.lineGraph.bottom + 10 + (j * 7)
        }

        this.ctx.fillStyle = this.settings.colors[error.playerIndex];
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, 3, 0, 2 * Math.PI)
        this.ctx.fill()
      }
    }
  },

  drawErrorMessages: function() {
    if(!this.currentRound) return

    var errors = this.getErrorsInRound(this.currentRound.number - 1)
    if(errors.length === 0) return

    for(var i=0; i < errors.length; i++) {
      var posX = this.settings.errorMessages.left + (i % 2 * this.settings.lineGraph.width / 2)
      var posY = this.settings.errorMessages.top + (Math.floor(i / 2) * 50)

      this.ctx.fillStyle = '#fff'
      this.ctx.font = "bold 10pt Helvetica Neue";
      this.ctx.fillText(errors[i].player.name + ':', posX + 20, posY + 30);
      this.ctx.font = "10pt Helvetica Neue";
      this.ctx.fillText(errors[i].player.error, posX + 20, posY + 15 + 30);
    }
  },

  drawFinalLineGraphValues: function () {
    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "left"
    this.ctx.font = "10pt Helvetica Neue";

    var lastRound = this.model[this.model.length - 1]
    var playerIds = ['A', 'B', 'C', 'D']
    for(var i=0; i < playerIds.length; i++) {
      var playerScore = lastRound['player' + playerIds[i]].totalScore
      var position = {
        x: this.settings.lineGraph.right + 10,
        y: this.settings.lineGraph.bottom + 5 - (this.settings.lineGraph.height * (playerScore/this.maxScore))
      }

      this.ctx.fillText(playerScore, position.x, position.y)
    }
  }
}
