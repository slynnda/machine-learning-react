var PlayerApi = require('./PlayerApi.js')
var LeftPaddle = require('./GameState.js').leftPaddle
var RightPaddle = require('./GameState.js').rightPaddle
var Ball = require('./GameState.js').ball

function tick(leftPlayerIntention, rightPlayerIntention) {
    if (leftPlayerIntention === "up") {
        movePaddleUp(LeftPaddle)
    } else if (leftPlayerIntention === "down") {
        movePaddleDown(LeftPaddle)
    } else {
        throw new Error("invalid command " + leftPlayerIntention)
    }

    if (rightPlayerIntention === "up") {
        movePaddleUp(rightPaddle)
    } else if (rightPlayerIntention === "down") {
        movePaddleDown(rightPaddle)
    } else {
        throw new Error("invalid command " + rightPlayerIntention)
    }

    moveBall(Ball, LeftPaddle, RightPaddle)
}

module.exports = {
    tick: tick
}