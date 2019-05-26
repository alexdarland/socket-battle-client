var Graph = function (rootElementId, model) {
  this.elements = {
    root: document.getElementById(rootElementId),
    canvas: null
  }
  this.ctx = null
  this.model = model
  this.maxScore = 0
  this.colors = ['#FB0000','#C200FB','#00FB4B','#000FFB']
  this.step = (window.innerWidth - 200) / this.model.history.length

  this.createCanvas()
  this.setMaxScore()
  this.registerEvents()

  this.drawGraph()
  this.drawLines()
  this.drawLegend()
}

Graph.prototype = {
  createCanvas: function () {
    this.elements.canvas = document.createElement('canvas')
    this.elements.canvas.setAttribute('width', window.innerWidth)
    this.elements.canvas.setAttribute('height', window.innerHeight)

    this.ctx = this.elements.canvas.getContext('2d')
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#333";
    this.elements.root.appendChild(this.elements.canvas)
  },

  registerEvents() {
    this.elements.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
  },

  handleMouseMove: function(event) {
    this.ctx.clearRect(0,0, window.innerWidth, window.innerHeight)
    this.drawMouseLine(event)
    this.drawGraph()
    this.drawLines()
    this.drawLegend()
  },

  drawMouseLine: function(event) {
    if(event.screenX >= 100 && event.screenX <= window.innerWidth - 100) {
      var roundedPosX = Math.floor(event.screenX / this.step) * this.step
      var round = Math.ceil((roundedPosX - 100) / this.step)

      this.ctx.strokeStyle = '#ccc'
      this.ctx.beginPath()
      this.ctx.moveTo(roundedPosX, window.innerHeight - 100)
      this.ctx.lineTo(roundedPosX, 100)
      this.ctx.stroke()

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
        var teamName = this.model.players[tile.playerIndex].info.teamName
        this.ctx.fillStyle = this.colors[tile.playerIndex];
        this.ctx.fillText(teamName, posX + (tileWidth / 2), posY + (tileHeight / 2));
      }
    }
  },

  drawLegend: function() {
    var baseX = 100
    var baseY = window.innerHeight - 60
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
        this.maxScore = player.score
    }
  },

  drawGraph: function () {
    // Left line
    this.ctx.strokeStyle = '#333'
    this.ctx.fillStyle = '#333';

    this.ctx.beginPath();
    this.ctx.moveTo(100, 100);
    this.ctx.lineTo(100, window.innerHeight - 100);
    this.ctx.stroke();

    // Bottom line
    this.ctx.beginPath();
    this.ctx.moveTo(100, window.innerHeight - 100);
    this.ctx.lineTo(window.innerWidth - 100, window.innerHeight - 100);
    this.ctx.stroke();

    // Labels
    this.ctx.save();
    this.ctx.translate(80, window.innerHeight/2);
    this.ctx.rotate(-Math.PI/2);
    this.ctx.textAlign = "center";
    this.ctx.fillText("Score", 0, 0);
    this.ctx.restore();

    this.ctx.fillText("Rounds", window.innerWidth / 2, window.innerHeight - 80);

    this.ctx.textAlign = "right";
    this.ctx.fillText(this.maxScore,90, 116);
  },

  drawLines: function () {
    var baseX = 100
    var baseY = window.innerHeight - 100

    var height = window.innerHeight - 200

    for(var i=0; i < this.model.players.length; i++) {
      var player = this.model.players[i]

      this.ctx.beginPath();
      this.ctx.strokeStyle = this.colors[i]

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
