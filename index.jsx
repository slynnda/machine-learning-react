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
var PADDLE_HALF_HEIGHT = PADDLE_HEIGHT/2
var PADDLE_INSET = 2
var PADDLE_MOVE_SPEED = 1

var BALL_DEFAULT_SPEED = 1
var BALL_RADIUS = 1
var BALL_COLLISION_AVOIDANCE_STEP = BALL_DEFAULT_SPEED / 2
var BALL_MIN_Y = BOARD_INITIAL_Y + BALL_RADIUS
var BALL_MAX_Y = BOARD_FINAL_Y - BALL_RADIUS

var PADDLE_BALL_MAX_COLLISION_SPREAD = PADDLE_HEIGHT + PADDLE_HEIGHT

var STATE_UPDATE_INTERVAL = 20
var VIEW_UPDATE_INTERVAL = 20

var MIN_ANGLE = Math.PI / 720
var LEFT_PADDLE_BOTTOM_ANGLE = (Math.PI / 2) - MIN_ANGLE
var LEFT_PADDLE_TOP_ANGLE = (-1 * Math.PI / 2) + MIN_ANGLE
var RIGHT_PADDLE_BOTTOM_ANGLE = (Math.PI / 2) + MIN_ANGLE
var RIGHT_PADDLE_TOP_ANGLE = (Math.PI * 3 / 2) - MIN_ANGLE

var LEFT = "left"
var RIGHT = "right"
var UP = "up"
var DOWN = "down"
var STAY = "stay"

var WIN_LEFT = "win left"
var WIN_RIGHT = "win right"
var IN_PLAY = "in play"
var BETWEEN_GAMES = "between games"

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
        var x = paddleInitialX(paddle)
        var y = paddleInitialY(paddle)
        return (
            <rect x={x} y={y} width={PADDLE_WIDTH} height={PADDLE_HEIGHT}/>
        )
    }
})

var Ball = React.createClass({
    render: function() {
        var x = this.props.ball.position.x
        var y = this.props.ball.position.y
        return (
            <circle cx={x} cy={y} r={BALL_RADIUS}/>
        )
    }
})


window.setInterval(function() {
    React.render(
        <GameBoard width="50%" gameState={gameState} >
        </GameBoard>, document.getElementById("react-here")
    )
}, VIEW_UPDATE_INTERVAL)

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
    var code = event.keyCode
    if (code == W_KEYCODE) {keysPressed.w = false; intentions.left = STAY}
    if (code == S_KEYCODE) {keysPressed.s = false; intentions.left = STAY}
    if (code == I_KEYCODE) {keysPressed.i = false; intentions.right = STAY}
    if (code == K_KEYCODE) {keysPressed.k = false; intentions.right = STAY}
})

function intention(upKey, downKey) {
    if (upKey && !downKey) return UP
    else if (downKey && !upKey) return DOWN
    else return STAY
}


window.setInterval(function() {
    gameState = nextGameState(gameState, intention(keysPressed.w, keysPressed.s), intention(keysPressed.i, keysPressed.k))
}, STATE_UPDATE_INTERVAL)




// GAME STATE MANIPULATION

function initialGameState(ballDirection) {
    var halfBoardHeight = BOARD_HEIGHT/2
    var halfBoardWidth = BOARD_WIDTH/2
    var halfPaddleHeight = PADDLE_HEIGHT/2
    var halfPaddleWidth = PADDLE_WIDTH/2
    return {
        leftPaddle: { // center of rect position
            x: PADDLE_INSET,
            y: halfBoardHeight,
        },
        rightPaddle: {
            x: BOARD_WIDTH - PADDLE_INSET,
            y: halfBoardHeight,
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

function nextGameState(state, leftIntention, rightIntention) {
    var newLeft = nextPaddle(state.leftPaddle, leftIntention)
    var newRight = nextPaddle(state.rightPaddle, rightIntention)
    return {
        leftPaddle: newLeft,
        rightPaddle: newRight,
        ball: nextBall(state.ball, newLeft, newRight) // We execute player's latest move before calculating ball collisions.
    }
}

function nextPaddle(paddle, intention) {
    var dy;
    if (!intention || intention == STAY) dy = 0
    else if (intention == UP) dy = -PADDLE_MOVE_SPEED
    else if (intention == DOWN) dy = PADDLE_MOVE_SPEED
    else throw new Error("invalid intention " + intention)
    return {
        x: paddle.x,
        y: forceInRange(paddle.y + dy, BOARD_INITIAL_Y + PADDLE_HALF_HEIGHT, BOARD_FINAL_Y - PADDLE_HALF_HEIGHT),
    }
}

function nextBall(ball, leftPaddle, rightPaddle) {
    ball = handlePaddleCollision(ball, leftPaddle, LEFT_PADDLE_TOP_ANGLE, LEFT_PADDLE_BOTTOM_ANGLE)
    ball = handlePaddleCollision(ball, rightPaddle, RIGHT_PADDLE_TOP_ANGLE, RIGHT_PADDLE_BOTTOM_ANGLE)
    ball = handleWallCollisions(ball)

    ball = handleBallMovement(ball)
    ball = clearColliders(ball, leftPaddle, rightPaddle)
    return ball
}

// Collision stuff

function collidesWithWall(ball) {
    return ball.position.y <= BALL_MIN_Y || ball.position.y >= BALL_MAX_Y
}

function collidesWithPaddle(ball, paddle) {
    return euclideanDistance(ball.position, nearestPaddlePoint(ball, paddle)) < BALL_RADIUS
}

function paddleReflect(ball, paddle, topAngle, bottomAngle) {
     var whereCollision = ((ball.position.y - paddle.y) / PADDLE_BALL_MAX_COLLISION_SPREAD) + .5  // interval [0,1], with 0 at top of paddle
     var returnAngle = linearEval(whereCollision, topAngle, bottomAngle)
     return vectorFromAngle(returnAngle, BALL_DEFAULT_SPEED)
}

function handleWallCollisions(ball) {
    if (collidesWithWall(ball)) {
        return {
            position: ball.position,
            velocity: vReflectY(ball.velocity)
        }
    } else {
        return ball
    }
}

function handlePaddleCollision(ball, paddle, topAngle, bottomAngle) {
    if (collidesWithPaddle(ball, paddle)) {
        return {
            position: ball.position,
            velocity: paddleReflect(ball, paddle, topAngle, bottomAngle)
        }
    } else {
        return ball
    }
}

function handleBallMovement(ball) {
    return {
        position: vAdd(ball.position, ball.velocity),
        velocity: ball.velocity
    }
}

function clearColliders(ball, leftPaddle, rightPaddle) {
    ball = clearWall(ball)
    ball = clearPaddles(ball, leftPaddle, rightPaddle)
    return ball

}

function clearPaddles(ball, leftPaddle, rightPaddle) {
    if (collidesWithPaddle(ball, leftPaddle) || collidesWithPaddle(ball, rightPaddle)) {
        var nearestLeft = nearestPaddlePoint(ball, leftPaddle)
        var nearestRight = nearestPaddlePoint(ball, rightPaddle)
        var minX = nearestLeft.x + vScalarMult(vNormalize(vSubtract(nearestLeft, ball.position)), BALL_RADIUS).x
        var maxX = nearestRight.x + vScalarMult(vNormalize(vSubtract(nearestRight, ball.position)), BALL_RADIUS).x
        return ballNewPosition(ball, forceInRange(ball.position.x, minX, maxX), ball.position.y)
    } else {
        return ball
    }

}

function clearWall(ball) {
    return ballNewPosition(ball, ball.position.x, forceInRange(ball.position.y, BALL_MIN_Y, BALL_MAX_Y))
}


// GAME CONVENIENCE METHODS

function ballNewPosition(ball, x, y) {
    return newBall({x:x, y:y}, ball.velocity)
}

function nearestPaddlePoint(ball, paddle) {
    return {
        x: forceInRange(ball.position.x, paddle.x - PADDLE_HALF_WIDTH, paddle.x + PADDLE_HALF_WIDTH),
        y: forceInRange(ball.position.y, paddle.y - PADDLE_HALF_HEIGHT, paddle.y + PADDLE_HALF_HEIGHT)
    }
}

function nearestPaddlePointOnLeft(ball, paddle) {
    return {
        x: paddle.x - PADDLE_HALF_WIDTH,
        y: forceInRange(ball.position.y, paddle.y - PADDLE_HALF_HEIGHT, paddle.y + PADDLE_HALF_HEIGHT)
    }
}

function nearestPaddlePointOnRight(ball, paddle) {
    return {
        x: paddle.x + PADDLE_HALF_WIDTH,
        y: forceInRange(ball.position.y, paddle.y - PADDLE_HALF_HEIGHT, paddle.y + PADDLE_HALF_HEIGHT)
    }
}

function newBall(pos, vel) {
    return {
        position: pos,
        velocity: vel
    }
}

function paddleInitialY(paddle) {
    return paddle.y - PADDLE_HALF_HEIGHT
}
function paddleFinalY(paddle) {
    return paddle.y + PADDLE_HALF_HEIGHT
}

function paddleInitialX(paddle) {
    return paddle.x - PADDLE_HALF_WIDTH
}
function paddleFinalX(paddle) {
    return paddle.x + PADDLE_HALF_WIDTH
}

// MATH LIB
function vReflectY(v) {
    return {
        x: v.x,
        y: -v.y
    }
}

function vectorFromAngle(radians, magnitude) {
    return {
        x: Math.cos(radians) * magnitude,
        y: Math.sin(radians) * magnitude
    }
}

function forceInRange(num, min, max) {
    return Math.max(min, Math.min(num, max))
}

function linearEval(x, yAt0, yAt1) {
    return (yAt1 - yAt0) * x + yAt0
}

function vAdd(v1, v2) {
    return { x:v1.x+v2.x, y:v1.y+v2.y }
}

function vSubtract(v1, v2) {
    return { x:v1.x-v2.x, y:v1.y-v2.y }
}

function vNormalize(v) {
    return vScalarMult(v, 1/euclideanNorm(v))
}

function vScalarMult(v, s) {
    return { x:v.x*s, y:v.y*s }
}

function euclideanDistance(p1, p2) {
    return pythagorean(p1.x-p2.x, p1.y-p2.y)
}

function euclideanNorm(v) {
    return pythagorean(v.x, v.y)
}

function pythagorean(x, y) {
    return Math.sqrt(x*x + y*y)
}