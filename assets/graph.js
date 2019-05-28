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
    top: 100,
    bottom: this.settings.container.height - 300,
    left: 100,
    right: this.settings.container.width - 100,
    height: this.settings.container.height - 400,
    width: this.settings.container.width - 200
  }
  this.settings.board = {
    left: this.settings.lineGraph.right - 80 * 3,
    top: this.settings.lineGraph.bottom + 30,
    tileWidth: 80,
    tileHeight: 80
  }
  this.settings.percentage = {
    left: this.settings.lineGraph.left,
    top: this.settings.lineGraph.bottom + 100,
    circleWidth: 100,
    circleHeight: 100
  }
  this.settings.colors = ['#F33530','#FAD718','#98CD22','#0FC0EC']

  this.ctx = null
  this.model = model
  this.maxScore = 0
  this.colors = ['#F33530','#FAD718','#98CD22','#0FC0EC']
  this.step = (this.settings.container.width - (this.settings.container.padding * 2)) / this.model.history.length

  this.createCanvas()
  this.setMaxScore()
  this.animate()
}

Graph.prototype = {

  animate: function() {
    var _this = this
    var copy = JSON.parse(JSON.stringify(this.model.players))
    var counter = 0
    var interval = null

    interval = setInterval(function () {
      for(var i=0; i < copy.length; i++) {
        var player = _this.model.players[i]
        player.scoreHistory = copy[i].scoreHistory.slice(0, counter)

        var currentScore = player.scoreHistory[player.scoreHistory.length - 1]
        var previousScore = player.scoreHistory[player.scoreHistory.length - 2]

        player.wins = currentScore > previousScore ? player.wins + 1 : player.wins
      }

      _this.ctx.clearRect(0,0, _this.settings.container.width, _this.settings.container.height)
      _this.drawBackground()
      _this.drawGraph()
      _this.drawLines()
      // _this.drawLegend()
      _this.drawPercentages()
      _this.drawBoard(_this.model.history[counter])

      counter++

      if(counter === _this.model.history.length) {
        clearInterval(interval)
        _this.drawFinalLineGraphValues()
        _this.registerEvents()
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
    this.drawBackground()
    this.drawGraph()
    this.drawLines()
    // this.drawLegend()
    this.drawMouseLine(event)
    this.drawPercentages()
    this.drawFinalLineGraphValues()
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
      var roundedPosX = Math.floor(event.clientX / this.step) * this.step
      var roundIndex = Math.ceil((roundedPosX - 100) / this.step)

      this.ctx.lineWidth = .5
      this.ctx.strokeStyle = '#ccc'
      this.ctx.fillStyle = "#ccc";
      this.ctx.beginPath()
      this.ctx.moveTo(roundedPosX, this.settings.lineGraph.bottom)
      this.ctx.lineTo(roundedPosX, this.settings.lineGraph.top)
      this.ctx.stroke()

      this.ctx.fillStyle = "#fff";
      this.ctx.textAlign = "left"
      this.ctx.fillText("Round: " + roundIndex, roundedPosX, 95)

      for(var i=0; i < this.model.players.length; i++) {
        var score = this.model.players[i].scoreHistory[roundIndex]
        var position = { x: roundedPosX, y: this.settings.lineGraph.bottom - (this.settings.lineGraph.height * (score/this.maxScore)) }
        this.ctx.fillStyle = this.colors[i]
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, 5, 0, 2 * Math.PI)
        this.ctx.fill()
      }

      if(roundIndex !== 0) {
        this.drawBoard(this.model.history[roundIndex - 1])
      }
    }
  },

  drawBoard: function(roundData) {
    this.ctx.font = "12pt Helvetica Neue";
    this.ctx.fillStyle = "#ccc";
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = '#333'
    this.ctx.rect(this.settings.board.left, this.settings.board.top, this.settings.board.tileWidth * 3, this.settings.board.tileHeight * 3)
    this.ctx.fillStyle = "#fff";

    if(!roundData) return

    for(var i=0; i < roundData.length; i++) {
      var tile = roundData[i]
      var posX = this.settings.board.left + (this.settings.board.tileWidth * i) % (this.settings.board.tileWidth * 3)
      var posY = this.settings.board.top + (this.settings.board.tileHeight * (Math.floor(i / 3)))

      this.ctx.beginPath();
      this.ctx.fillStyle = tile.type === 'player' ? '#282B32' : '#2B2E35';
      this.ctx.fillRect(posX, posY, this.settings.board.tileWidth, this.settings.board.tileHeight)
      this.ctx.rect(posX, posY, this.settings.board.tileWidth, this.settings.board.tileHeight)
      this.ctx.stroke()

      this.ctx.beginPath();
      this.ctx.fillStyle = '#373A41';
      this.ctx.font = "12pt Helvetica Neue";
      this.ctx.fillText(tile.id, posX + 10, posY + 20);

      if(tile.type === 'coins') {
        this.ctx.textAlign = "center";
        this.ctx.textBaseline
        this.ctx.fillStyle = '#ebebeb';
        this.ctx.fillText(tile.value, posX + (this.settings.board.tileWidth / 2), posY + (this.settings.board.tileHeight / 2));

        for(var j=0; j < tile.claims.length; j++) {
          this.ctx.fillStyle = this.colors[tile.claims[j]];
          this.ctx.fillRect((posX + 10) + j * 10, posY + this.settings.board.tileHeight - 15, 10, 10)
        }
      } else {
        this.ctx.fillStyle = this.colors[tile.playerIndex];
        this.ctx.beginPath();
        this.ctx.arc(posX + (this.settings.board.tileWidth / 2), posY + (this.settings.board.tileHeight / 2), this.settings.board.tileHeight / 4, 0, 2 * Math.PI)
        this.ctx.fill()
        this.ctx.fillStyle = '#fff'
        this.ctx.font = "bold 8pt Helvetica Neue";
        var teamName = this.model.players[tile.playerIndex].info.teamName
        this.ctx.fillText(teamName, posX + (this.settings.board.tileWidth / 2), posY + (this.settings.board.tileHeight - 5));

        if(tile.error) {
          this.ctx.beginPath();
          this.ctx.fillStyle = 'red'
          this.ctx.fillRect(posX + 15, posY + (this.settings.board.tileHeight / 2) - 10, this.settings.board.tileWidth - 30, 20)
          this.ctx.fillStyle = '#fff'
          this.ctx.fillText('ERROR', posX + (this.settings.board.tileWidth / 2), posY + (this.settings.board.tileHeight / 2) + 6);

          // TODO: Print errors
        }
      }
    }
  },

  drawLegend: function() {
    var baseX = 100
    var baseY = this.settings.container.height - 60
    this.ctx.textAlign = "left";
    this.ctx.font = "10pt Helvetica Neue";
    for(var i=0; i < this.model.players.length; i++) {
      var player = this.model.players[i]

      this.ctx.fillStyle = this.colors[i];
      this.ctx.fillRect(baseX + (i * 150), baseY, 20, 20)
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(player.info.teamName + ' (' + player.scoreHistory[player.scoreHistory.length - 1] + ' points)', baseX + (i * 150) + 25, baseY + 15);
    }
  },

  drawPercentages: function() {
    for(var i=0; i < this.model.players.length; i++) {
      var player = this.model.players[i]
      var percentage = (player.wins / player.scoreHistory.length)
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
      this.ctx.fillText(player.info.teamName, position.x + (this.settings.percentage.circleWidth / 2), this.settings.percentage.top - 20);

      this.ctx.font = "10pt Helvetica Neue";


      var total = 0;
      for(var j = 0; j < player.scoreHistory.length; j++) {
        total += player.scoreHistory[i];
      }
      var avg = total / player.scoreHistory.length;

      this.ctx.fillText(
          'Avg win: ' + avg,
          position.x + (this.settings.percentage.circleWidth / 2),
          this.settings.percentage.top + this.settings.percentage.circleHeight + 30
      )
    }
  },

  setMaxScore: function() {
    for(var i=0; i < this.model.players.length; i++) {
      var player = this.model.players[i]

      if(player.score > this.maxScore)

        this.maxScore = Math.ceil(player.score / 100) * 100
    }
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

    this.ctx.textAlign = "center"
    this.ctx.fillText("Rounds", this.settings.container.width / 2, this.settings.lineGraph.bottom + 20);

    this.ctx.textAlign = "right";
    this.ctx.fillText(this.maxScore,90, 116);
  },

  drawLines: function () {
    for(var i=0; i < this.model.players.length; i++) {
      var player = this.model.players[i]

      this.ctx.beginPath();
      this.ctx.strokeStyle = this.colors[i]
      this.ctx.lineWidth = 2

      for(var j=0; j < player.scoreHistory.length; j++) {
        var currentScore = player.scoreHistory[j]
        var nextScore = player.scoreHistory[j + 1]

        var currentPosition = { x: this.settings.lineGraph.left + this.step * j, y: this.settings.lineGraph.bottom - (this.settings.lineGraph.height * (currentScore/this.maxScore)) }
        var nextPosition = { x: this.settings.lineGraph.left + this.step * (j + 1), y: this.settings.lineGraph.bottom - (this.settings.lineGraph.height * (nextScore/this.maxScore)) }

        this.ctx.moveTo(currentPosition.x, currentPosition.y);
        this.ctx.lineTo(nextPosition.x, nextPosition.y);
      }

      this.ctx.stroke();
    }
  },

  drawFinalLineGraphValues: function () {
    this.ctx.fillStyle = "#fff";
    this.ctx.textAlign = "left"
    this.ctx.font = "10pt Helvetica Neue";

    for(var i=0; i < this.model.players.length; i++) {
      var player = this.model.players[i]
      var lastScore = player.scoreHistory[player.scoreHistory.length - 1]
      var position = { x: this.settings.lineGraph.right + 10, y: this.settings.lineGraph.bottom + 5 - (this.settings.lineGraph.height * (lastScore/this.maxScore)) }

      this.ctx.fillText(lastScore, position.x, position.y)
    }
  }
}
