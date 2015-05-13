module.exports = {
  game: {
    tick: {
      paddleStep: 1
    },
    board: {
     dimensions: {
      x: {
        min: 0,
        max: 200
      },
      y: {
        min: 0,
        max: 150
      }
     }
    }
  },
  meta: {
    game: {
      name: "React Pong",
      version: 0.001
    }
  }
};
