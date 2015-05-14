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

var BALL_DEFAULT_SPEED = .5
var BALL_RADIUS = 2

var STATE_UPDATE_INTERVAL = 100
var VIEW_UPDATE_INTERVAL = 30

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

//collisionFunc (ball, collision) => ball


var initialBallDirection = (Math.random() > .5) ? LEFT : RIGHT
var gameState = initialGameState(initialBallDirection)
var gameBoard = {
    walls: [
        newWall(BOARD_INITIAL_X, BOARD_INITIAL_Y, BOARD_FINAL_X, BOARD_INITIAL_Y),
        newWall(BOARD_INITIAL_X, BOARD_FINAL_Y, BOARD_FINAL_X, BOARD_FINAL_Y),
    ]
}

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
        var cx = paddleInitialCX(paddle)
        var cy = paddleInitialCY(paddle)
        return (
            <rect x={cx} y={cy} width={paddle.width} height={paddle.height}/>
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


window.setInterval(function() {
    gameState = nextGameState(gameState, intentions.left, intentions.right, gameBoard)
}, STATE_UPDATE_INTERVAL)




// GAME STATE MANIPULATION

function initialGameState(ballDirection) {
    var halfBoardHeight = BOARD_HEIGHT/2
    var halfBoardWidth = BOARD_WIDTH/2
    var halfPaddleHeight = PADDLE_HEIGHT/2
    var halfPaddleWidth = PADDLE_WIDTH/2
    return {
        leftPaddle: {
            cx: PADDLE_INSET,
            cy: halfBoardHeight,
            height: halfPaddleHeight,
            width: halfPaddleWidth,
            collisionFunc: reflectOnCollision
        },
        rightPaddle: {
            cx: BOARD_WIDTH - PADDLE_INSET,
            cy: halfBoardHeight,
            height: halfPaddleHeight,
            width: halfPaddleWidth,
            collisionFunc: reflectOnCollision
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

function nextGameState(currentState, leftIntention, rightIntention, gameBoard) {
    return {
        leftPaddle: nextPaddle(currentState.leftPaddle, leftIntention),
        rightPaddle: nextPaddle(currentState.rightPaddle, rightIntention),
        ball: nextBall(currentState.ball, gameBoard.walls, currentState.leftPaddle, currentState.rightPaddle)
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
        cx: currentPaddle.cx,
        cy: forceInRange(currentPaddle.cy + dy, BOARD_INITIAL_Y + halfPaddle, BOARD_FINAL_Y - halfPaddle),
        height: currentPaddle.height,
        width: currentPaddle.width,
        collisionFunc: currentPaddle.collisionFunc
    }
}

function nextBall(currentBall, walls, leftPaddle, rightPaddle) {
    var leftPaddleSegments = shapeToSegments(paddleShape(leftPaddle))
    var rightPaddleSegments = shapeToSegments(paddleShape(rightPaddle))
    var leftPaddleCollisions = ballCollisions(currentBall, leftPaddleSegments)
    var rightPaddleCollisions = ballCollisions(currentBall, rightPaddleSegments)


    var ballAfterRights = handleCollisions(currentBall, rightPaddleCollisions, rightPaddle.collisionFunc)
    var ballAfterLefts = handleCollisions(ballAfterRights, leftPaddleCollisions, leftPaddle.collisionFunc)

    var ball = ballAfterLefts

    return {
        position: vAdd(ball.position, ball.velocity),
        velocity: ball.velocity,
        radius: ball.radius
    }
}

// Collision stuff
function handleCollisions(ball, collisions, collisionFunc) {
    // if (collisions.length < 1) return ball
    return collisions.reduce(function(b, c){
        return collisionFunc(b, c)
    }, ball)
}

function ballCollisions(ball, segments) {
    return _.compact(segments.map(function(s) {
        return ballCollision(ball, s)
    }))
}

function ballCollision(ball, segment) {
    var segLength = segmentLength(segment)
    var transOrigin = segment.p1
    var transV = vSubtract(segment.p2, transOrigin)
    var transBall = vSubtract(ball.position, transOrigin)
    var scalar = scalarProjection(transBall, transV)
    var transProjection = scalarMult(transV, scalar/segLength)
    var projection = vAdd(transProjection, transOrigin)
    var ballHeight = euclideanDistance(ball.position, projection)
    // console.log("ball", ball.position, "segment", segment.p1, segment.p2, "transV", transV,
    //     "transBall", transBall, "scalar", scalar, "transProjection", transProjection,
    //     "projection", projection, "ballHeight", ballHeight, "segLength", segLength
    // )


    var inSegmentShadow = Math.abs(scalar) < segLength
    var lowEnough = ballHeight <= ball.radius

    if (inSegmentShadow && lowEnough) {
        return {
            ballHeight: ballHeight,
            location: projection,
            percentOfSegment: Math.abs(scalar),  // /seglength
            segment: segment
        }
    } else return null
}

function reflectOnCollision(ball, collision) {
    var colliderVector = vSubtract(collision.segment.p1, collision.segment.p2)
    return {
        position: ball.position,
        velocity: vReflect(ball.velocity, colliderVector),
        radius: ball.radius
    }
}

function simplePaddleReflection(ball, collision) {
    var colliderVector = vSubtract(collision.segment.p1, collision.segment.p2)
    var maxScaleX = 2
    var scaleX = Math.abs(collision.percentOfSegment -.5)* 2 * (maxScaleX -1) + 1
    return {
        position: ball.position,
        velocity: vReflectWithMoreX(ball.velocity, colliderVector, scaleX)
    }
}

// GAME CONVENIENCE METHODS

function paddleInitialCY(paddle) {
    return paddle.cy - paddle.height/2
}
function paddleFinalCY(paddle) {
    return paddle.cy + paddle.height/2
}

function paddleInitialCX(paddle) {
    return paddle.cx - paddle.width/2
}
function paddleFinalCX(paddle) {
    return paddle.cx + paddle.width/2
}

function newWall(x1, y1, x2, y2) {
    return {
        segment: newSegment(x1, y1, x2, y2),
        collisionFunc: reflectOnCollision
    }
}

function newSegment(x1, y1, x2, y2) {
    return {
        p1: { x:x1, y:y1 },
        p2: { x:x2, y:y2 }
    }
}

function paddleShape(paddle) {
    return rectShape(paddle.cx, paddle.cy, paddle.width, paddle.height)
}

function rectShape(cx, cy, width, height) {
    var halfWidth = width/2
    var halfHeight = height/2
    return [  //note: order matters for building segments
        {x:cx+halfWidth, y:cy+halfHeight},
        {x:cx+halfWidth, y:cy-halfHeight},
        {x:cx-halfWidth, y:cy-halfHeight},
        {x:cx-halfWidth, y:cy+halfHeight},
    ]
}

function shapeToSegments (shape) {
    nextPoints = cycle(shape, 1)
    return _.zip(shape, nextPoints).map(function(pts) {
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
    return { x:v1.x+v2.x, y:v1.y+v2.y }
}

function vSubtract(v1, v2) {
    return { x:v1.x-v2.x, y:v1.y-v2.y }
}

function vNormalize(v) {
    return scalarMult(v, 1/euclideanNorm(v))
}

function vReflect(v, withRespectTo) {
    var projection = vProject(v, withRespectTo)
    var elevation = vSubtract(v, projection)
    return vAdd(vInvert(elevation), projection)
}

function vReflectWithMoreX(v, withRespectTo, scaleX) {
    var projection = vProject(v, withRespectTo)
    var elevation = vSubtract(v, projection)
    return vAdd(scalarMult(vInvert(elevation), scaleX), projection)
}

function vInvert(v) {
    return { x:-v.x, y:-v.y }
}

function vProject(v, onV) {
    return scalarMult(onV, scalarProjection(v, onV))
}

function scalarMult(v, s) {
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