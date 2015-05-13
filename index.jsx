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
var BALL_RADIUS = 1

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
        var r = this.props.ball.radius
        return (
            <circle cx={x} cy={y} r={r}/>
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
    var code = event.keyCode
    if (code == W_KEYCODE) {keysPressed.w = false; intentions.left = STAY}
    if (code == S_KEYCODE) {keysPressed.s = false; intentions.left = STAY}
    if (code == I_KEYCODE) {keysPressed.i = false; intentions.right = STAY}
    if (code == K_KEYCODE) {keysPressed.k = false; intentions.right = STAY}
})


window.setInterval(function() {
    gameState = nextGameState(gameState, intentions.left, intentions.right)
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
            },
            radius: BALL_RADIUS
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

function ballCollisions(ball, shape) {
    return
}

function ballCollision(ball, segment) {
    var segLength = segmentLength(segment)
    var transOrigin = segment.p1
    var transV = vSubtract(segment.p1, transOrigin)
    var scalar = scalarProjection(p, transV)
    var projection = vAdd(newV, transOrigin)
    var ballHeight = euclideanDistance(ball.position, projection)

    var inSegmentShadow = scalar < segLength
    var lowEnough = ballHeight < ball.radius

    if (inSegmentShadow && lowEnough) {
        return {
            ballHeight: ballHeight,
            location: projection,
            percentOfSegment: scalar/segLength
        }
    } else return null
}

// GAME CONVENIENCE METHODS

function paddleInitialY(paddle) {
    return paddle.y - paddle.height/2
}
function paddleFinalY(paddle) {
    return paddle.y + paddle.height/2
}

function paddleShape(paddle) {
    return
    // return {
    //     x1: paddle.x,
    //     x2: paddle.x,
    //     y1: paddleInitialY(paddle),
    //     y2: paddleFinalY(paddle)
    // }
}

function rectShape(cx, cy, width, height) {
    var halfWidth = width/2
    var halfHeight = height/2
    return [
        //WORKING HERE

    ]

}

function shapeToSegments (shape) {
    nextPoints = cycle(shape, 1)
    return _.zip(shape, nextPoints).map((pts) => {
        return {
            p1:pts[0],
            p2:pts[1]
        }
    })
}

// MATH LIB
function forceInRange(num, min, max) {
    return Math.max(min, Math.min(num, max))
}

function vAdd(v1, v2) {
    return {x:v1.x+v2.x, y:v1.y+v2.y}
}

function vSubtract(v1, v2) {
    return {x:v1.x-v2.x, y:v1.y-v2.y}
}

function scalarMult(v, s) {
    return {x:v.x*s, y:v.y*s}
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

function projectOnLine(p, segment) {
    var transOrigin = segment.p1
    var v = vSubtract(segment.p1, transOrigin)
    var scalar = scalarProjection(p, v)
    var newV = scalarMult(v, scalar)
    return vAdd(newV, transOrigin)
}

function scalarProjection(v, onV) {
    return dotProd(v, onV) / euclideanNorm(onV)
}

function dotProd(v1, v2) {
    return v1.x*v2.x + v1.y*v2.y
}

function segmentLength(segment) {
    return euclideanDistance(segment.p1, segment.p2)
}

//  MODASH
// function modIndex(array, index) {
//     return array()
// }

function cycle(array, rotation) {
    var index = rotation%array.length
    return _.drop(array, index).concat(_.take(array, index))
}