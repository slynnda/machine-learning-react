var React = require('react')
var _ = require('lodash')
var keypress = require('keypress')

var BOARD_INITIAL_X = 0
var BOARD_INITIAL_Y = 0
var BOARD_WIDTH = 100
var BOARD_HEIGHT = 100
var BOARD_FINAL_X = BOARD_INITIAL_X + BOARD_WIDTH
var BOARD_FINAL_Y = BOARD_INITIAL_Y + BOARD_HEIGHT
var PADDLE_HEIGHT = 20
var PADDLE_WIDTH = 3
var PADDLE_HALF_WIDTH = PADDLE_WIDTH/2
var PADDLE_INSET = 2
var PADDLE_MOVE_SPEED = 1

var BALL_DEFAULT_SPEED = 1

var LEFT = "left"
var RIGHT = "right"
var UP = "up"
var DOWN = "down"
var STAY = "stay"

var keysPressed = {
    w: false,
    s: false,
    i: false,
    k: false
}

var intentions = {
    left: STAY,
    right: STAY
}


var initialBallDirection = (Math.random() > .5) ? LEFT : RIGHT
var gameState = initialGameState(initialBallDirection)

// VIEW

var GameBoard = React.createClass({
    render: function() {
        var viewBox = [BOARD_INITIAL_X, BOARD_INITIAL_Y, BOARD_WIDTH, BOARD_HEIGHT].join(" ")
        return (
            <svg {...this.props} viewBox={viewBox}>
                <Paddle paddle={this.props.gameState.leftPaddle}/>
                <Paddle paddle={this.props.gameState.rightPaddle}/>
                <Ball ball={this.props.gameState.ball}/>
            </svg>
        )
    }
})

var Paddle = React.createClass({
    render: function() {
        var paddle = this.props.paddle
        var x = paddle.x - PADDLE_HALF_WIDTH
        var y = paddleInitialY(paddle)
        return (
            <rect x={x} y={y} width={PADDLE_WIDTH} height={paddle.height}/>
        )
    }
})

var Ball = React.createClass({
    render: function() {
        var x = this.props.ball.position.x
        var y = this.props.ball.position.y
        return (
            <circle cx={x} cy={y} r="1"/>
        )
    }
})


window.setInterval(function() {
    React.render(
        <GameBoard width="50%" gameState={gameState} >
        </GameBoard>, document.getElementById("react-here")
    )
}, 30)

//KEYBOARD STUFF
var W_KEYCODE = 87
var S_KEYCODE = 83
var I_KEYCODE = 73
var K_KEYCODE = 75

document.addEventListener("keydown", function(event) {
    var code = event.keyCode
    if (code == W_KEYCODE) {keysPressed.w = true; intentions.left = UP}
    if (code == S_KEYCODE) {keysPressed.s = true; intentions.left = DOWN}
    if (code == I_KEYCODE) {keysPressed.i = true; intentions.right = UP}
    if (code == K_KEYCODE) {keysPressed.k = true; intentions.right = DOWN}
})

document.addEventListener("keyup", function(event) {
    var code = event.keycode
    if (code == W_KEYCODE) {keysPressed.w = false; intentions.left = STAY}
    if (code == S_KEYCODE) {keysPressed.s = false; intentions.left = STAY}
    if (code == I_KEYCODE) {keysPressed.i = false; intentions.right = STAY}
    if (code == K_KEYCODE) {keysPressed.k = false; intentions.right = STAY}
})


window.setInterval(function() {
    // if (keysPressed.w && keysPressed.s) {}
    // else if (keysPressed.w) {movePaddleUp(gameState.leftPaddle)}
    // else if (keysPressed.s) {movePaddleDown(gameState.leftPaddle)}

    // if (keysPressed.i && keysPressed.k) {}
    // else if (keysPressed.i) {movePaddleUp(gameState.rightPaddle)}
    // else if (keysPressed.k) {movePaddleDown(gameState.rightPaddle)}
    gameState = nextGameState(gameState, intentions.left, intentions.right)
    console.log("gameState ball", gameState.ball.position, gameState.ball.velocity)

}, 30)




// GAME STATE MANIPULATION

function initialGameState(ballDirection) {
    var halfBoardHeight = BOARD_HEIGHT/2
    var halfBoardWidth = BOARD_WIDTH/2
    var halfPaddle = PADDLE_HEIGHT/2
    return {
        leftPaddle: {
            x: PADDLE_INSET,
            y: halfBoardHeight,
            height: halfPaddle
        },
        rightPaddle: {
            x: BOARD_WIDTH - PADDLE_INSET,
            y: halfBoardHeight,
            height: halfPaddle
        },
        ball: {
            position: {
                x: halfBoardWidth,
                y: halfBoardHeight
            },
            velocity: {
                x: (ballDirection == LEFT) ? -BALL_DEFAULT_SPEED : BALL_DEFAULT_SPEED,
                y: 0
            }
        }
    }
}

function nextGameState(currentState, leftIntention, rightIntention) {
    return {
        leftPaddle: nextPaddle(currentState.leftPaddle, leftIntention),
        rightPaddle: nextPaddle(currentState.rightPaddle, rightIntention),
        ball: nextBall(currentState.ball)
    }
}

function nextPaddle(currentPaddle, intention) {
    var halfPaddle = currentPaddle.height/2
    var dy;
    if (!intention || intention == STAY) dy = 0
    else if (intention == UP) dy = -PADDLE_MOVE_SPEED
    else if (intention == DOWN) dy = PADDLE_MOVE_SPEED
    else throw new Error("invalid intention " + intention)
    return {
        x: currentPaddle.x,
        y: forceInRange(currentPaddle.y + dy, BOARD_INITIAL_Y + halfPaddle, BOARD_FINAL_Y - halfPaddle),
        height: currentPaddle.height
    }
}

function nextBall(currentBall) {
    //TODO: handle collisions
    return {
        position: vAdd(currentBall.position, currentBall.velocity),
        velocity: currentBall.velocity
    }
}

// GAME CONVENIENCE METHODS

function paddleInitialY(paddle) {
    return paddle.y - paddle.height/2
}
function paddleFinalY(paddle) {
    return paddle.y + paddle.height/2
}

// MATH LIB
function forceInRange(num, min, max) {
    return Math.max(min, Math.min(num, max))
}

function vAdd(v1, v2) {
    return {x:v1.x+v2.x, y:v1.y+v2.y}
}
