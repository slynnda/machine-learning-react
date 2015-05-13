var Config = require('./GameConfig.js');

var movePaddleUp = function(paddle) {
  var currentPos = paddle.getPos();
  var dy = Config.game.tick.paddleStep;
  paddle.setPos(currentPos.x, currentPos.y - dy;
};

var movePaddleDown = function() {
  var currentPos = paddle.getPos();
  var dy = Config.game.tick.paddleStep;
  paddle.setPos(currentPos.x, currentPos.y + dy;
};

module.exports = {
  movePaddleUp: movePaddleUp,
  movePaddleDown: movePaddleDown
}
