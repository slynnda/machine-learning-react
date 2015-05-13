var GameState = require('./GameState.js');

var leftPaddle = {
  getPos: function() {
    return GameState.leftPaddle.pos;
  },
  setPos: function(_x, _y) {
    GameState.leftPaddle.pos = { x: _x, y: _y };
  }
};

var rightPaddle  {
  getPos: function() {
    return GameState.rightPaddle.pos;
  },
  setPos: function(_x, _y) {
    GameState.rightPaddle.pos = { x: _x, y: _y }; 
  }
};

var ball = {
  getPos: function() {
    return GameState.ball.pos;
  },
  setPos: function(_x, _y) {
    GameState.ball.pos = { x: _x, y: _y };
  },
  getVel: function() {
    return GameState.ball.vel;
  },
  setVel: function(_x, _y) {
    GameState.ball.vel = { x: _x, y: _y };
  }
};

module.exports = {
  leftPaddle: leftPaddle,
  rightPaddle: rightPaddle,
  ball: ball
};
