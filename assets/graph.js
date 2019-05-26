var Graph = function (rootElementId, model) {
  this.elements = {
    root: document.getElementById(rootElementId),
    canvas: null
  }
  this.settings = {
    fontSizes: {
      large: 24,
      base: 16,
      small: 10
    },
    container: {
      padding: 100,
      width: window.innerWidth,
      height: window.innerHeight
    },
    colors: ['#FB0000','#C200FB','#00FB4B','#000FFB']
  }
  this.ctx = null
  this.model = model
  this.maxScore = 0
  this.colors = ['#FB0000','#C200FB','#00FB4B','#000FFB']
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
        _this.model.players[i].scoreHistory = copy[i].scoreHistory.slice(0, counter)
      }

      _this.ctx.clearRect(0,0, _this.settings.container.width, _this.settings.container.height)
      _this.drawGraph()
      _this.drawLines()
      _this.drawLegend()

      counter++

      if(counter === _this.model.history.length) {
        clearInterval(interval)
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
    this.elements.canvas = document.createElement('canvas')
    this.ctx = this.elements.canvas.getContext('2d')
    this.scaleCanvas()
    this.ctx.font = this.settings.fontSizes.base + 'px Helvetica Neue';
    this.ctx.fillStyle = "#333";
    this.elements.root.appendChild(this.elements.canvas)
  },

  registerEvents() {
    this.elements.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
  },

  handleMouseMove: function(event) {
    this.ctx.clearRect(0,0, this.settings.container.width, this.settings.container.height)
    this.drawGraph()
    this.drawLines()
    this.drawLegend()
    this.drawMouseLine(event)
  },

  drawMouseLine: function(event) {
    if(event.screenX >= 100 && event.screenX <= this.settings.container.width - 100) {
      var roundedPosX = Math.floor(event.screenX / this.step) * this.step
      var round = Math.ceil((roundedPosX - 100) / this.step)

      this.ctx.lineWidth = .5
      this.ctx.strokeStyle = '#ccc'
      this.ctx.fillStyle = "#ccc";
      this.ctx.beginPath()
      this.ctx.moveTo(roundedPosX, this.settings.container.height - 100)
      this.ctx.lineTo(roundedPosX, 100)
      this.ctx.stroke()

      this.ctx.fillStyle = "#333";
      this.ctx.textAlign = "left"
      this.ctx.fillText("Round: " + round, roundedPosX, 95)

      this.drawBoard(round)
    }
  },

  drawBoard: function(round) {
    var baseX = 120
    var baseY = 120
    var tileWidth = 100
    var tileHeight = 100

    this.ctx.fillStyle = "#ccc";
    this.ctx.strokeStyle = '#333'
    this.ctx.rect(baseX, baseY, tileWidth * 3, tileHeight * 3)
    this.ctx.fillStyle = "#333";

    var data = this.model.history[round]

    if(!data) return

    for(var i=0; i < data.length; i++) {
      var tile = data[i]
      var posX = baseX + (tileWidth * i) % (tileWidth * 3)
      var posY = baseX + (tileHeight * (Math.floor(i / 3)))

      this.ctx.fillStyle = tile.type === 'player' ? '#bebebe' : '#ebebeb';
      this.ctx.fillRect(posX, posY, tileWidth, tileHeight)
      this.ctx.rect(posX, posY, tileWidth, tileHeight)
      this.ctx.stroke()

      this.ctx.fillStyle = '#999';
      this.ctx.fillText(tile.id, posX + 10, posY + 20);

      if(tile.type === 'coins') {
        this.ctx.textAlign = "center";
        this.ctx.textBaseline
        this.ctx.fillStyle = '#333';
        this.ctx.fillText(tile.value, posX + (tileWidth / 2), posY + (tileHeight / 2));

        for(var j=0; j < tile.claims.length; j++) {
          this.ctx.fillStyle = this.colors[tile.claims[j]];
          this.ctx.fillRect((posX + 10) + j * 10, posY + tileHeight - 15, 10, 10)
        }
      } else {
        this.ctx.fillStyle = this.colors[tile.playerIndex];
        this.ctx.beginPath();
        this.ctx.arc(posX + (tileWidth / 2), posY + (tileHeight / 2), tileHeight / 4, 0, 2 * Math.PI)
        this.ctx.fill()
        this.ctx.fillStyle = '#333'
        var teamName = this.model.players[tile.playerIndex].info.teamName
        this.ctx.fillText(teamName, posX + (tileWidth / 2), posY + (tileHeight - 5));
      }
    }
  },

  drawLegend: function() {
    var baseX = 100
    var baseY = this.settings.container.height - 60
    this.ctx.textAlign = "left";

    for(var i=0; i < this.model.players.length; i++) {
      var player = this.model.players[i]

      this.ctx.fillStyle = this.colors[i];
      this.ctx.fillRect(baseX + (i * 100), baseY, 20, 20)
      this.ctx.fillStyle = '#333';
      this.ctx.fillText(player.info.teamName, baseX + (i * 100) + 30, baseY + 15);
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
    var gradient = this.ctx.createLinearGradient(
      0,
      this.settings.container.height + this.settings.container.padding,
      0,
      this.settings.container.padding
    );

    gradient.addColorStop(0, '#bebebe');
    gradient.addColorStop(0.4, 'white');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      this.settings.container.padding,
      this.settings.container.padding,
      this.settings.container.width - (this.settings.container.padding * 2),
      this.settings.container.height - (this.settings.container.padding * 2)
    );

    this.ctx.strokeStyle = '#333'
    this.ctx.fillStyle = '#333';
    this.ctx.lineWidth = .5

    this.ctx.beginPath();
    this.ctx.moveTo(100, 100);
    this.ctx.lineTo(100, this.settings.container.height - 100);
    this.ctx.stroke();

    // Bottom line
    this.ctx.beginPath();
    this.ctx.moveTo(100, this.settings.container.height - 100);
    this.ctx.lineTo(this.settings.container.width - 100, this.settings.container.height - 100);
    this.ctx.stroke();

    var numberOfLines = this.maxScore / 100
    var height = this.settings.container.height - this.settings.container.padding * 2
    var baseY = this.settings.container.height - this.settings.container.padding
    this.ctx.strokeStyle = '#ccc'
    this.ctx.fillStyle = '#ccc';
    for(var i=0; i < numberOfLines; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(100, baseY - height/numberOfLines * i);
      this.ctx.lineTo(this.settings.container.width - 100, baseY - height/numberOfLines * i);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = '#333'
    this.ctx.fillStyle = '#333';

    // Labels
    this.ctx.save();
    this.ctx.translate(80, this.settings.container.height/2);
    this.ctx.rotate(-Math.PI/2);
    this.ctx.textAlign = "center";
    this.ctx.fillText("Score", 0, 0);
    this.ctx.restore();

    this.ctx.fillText("Rounds", this.settings.container.width / 2, this.settings.container.height - 80);

    this.ctx.textAlign = "right";
    this.ctx.fillText(this.maxScore,90, 116);
  },

  drawLines: function () {

    var baseX = 100
    var baseY = this.settings.container.height - 100

    var height = this.settings.container.height - 200

    for(var i=0; i < this.model.players.length; i++) {
      var player = this.model.players[i]

      this.ctx.beginPath();
      this.ctx.strokeStyle = this.colors[i]
      this.ctx.lineWidth = 2

      for(var j=0; j < player.scoreHistory.length; j++) {
        var prevScore = player.scoreHistory[j - 1] || 0
        var nextScore = player.scoreHistory[j]

        var prevPosition = { x: baseX + this.step * j, y: baseY - (height * (prevScore/this.maxScore)) }
        var nextPosition = { x: baseX + this.step * (j + 1), y: baseY - (height * (nextScore/this.maxScore)) }


        this.ctx.moveTo(prevPosition.x, prevPosition.y);
        this.ctx.lineTo(nextPosition.x, nextPosition.y);

      }
      this.ctx.stroke();
    }
  }
}
