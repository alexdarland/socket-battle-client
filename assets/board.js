const Board = function (rootElementId) {
    this.elements = {
        rootElement: document.getElementById(rootElementId)
    }
}

Board.prototype = {
    build: function (model) {
        this.elements.rootElement.innerText = ''

        var container = document.createElement('div')
        container.classList.add('board')

        for(var i=0; i < model.length; i++) {
          for(var j=0; j < model[i].length; j++) {
            var tile = document.createElement('div')
            tile.classList.add('board__item')

              var value = model[i][j]

              if(typeof value === 'number') {
                  for(var k=0; k < value; k++) {
                    var coin = document.createElement('div')
                    coin.classList.add('coin')
                    tile.appendChild(coin)
                  }
              } else {
                  var player = document.createElement('div')
                  player.classList.add('player')
                  player.innerText = model[i][j]
                  tile.appendChild(player)
              }

            container.appendChild(tile)
          }
        }

        this.elements.rootElement.appendChild(container)
    }
}

const board = new Board('board')