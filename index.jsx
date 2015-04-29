var React = require('react')
var _ = require('lodash')
var keypress = require('keypress')

var GAMEBOARD_WIDTH = 100
var PADDLE_HEIGHT = 20
var HALF_PADDLE_HEIGHT = PADDLE_HEIGHT/2
var PADDLE_WIDTH = 3
var HALF_PADDLE_WIDTH = PADDLE_WIDTH/2
var PADDLE_MOVE_SPEED = 1

var keysPressed = {
    w: false,
    s: false,
    i: false,
    k: false
}

var gameState = {
    leftPaddle: {
        x:2,
        y:50
    },
    rightPaddle: {
        x:98,
        y:50
    },
    ball: {

    }
}

var HelloWorld = React.createClass({
    render: function() {
        return (<div>Hello {this.props.personsName}</div>)
    }
})


var GameBoard = React.createClass({

    render: function() {
        var viewBox = "0 0 " + GAMEBOARD_WIDTH + " " + GAMEBOARD_WIDTH
        return (
            <svg {...this.props} viewBox={viewBox}>
                <Paddle paddle={this.props.gameState.leftPaddle}/>
                <Paddle paddle={this.props.gameState.rightPaddle}/>
            </svg>
        )
    }
})

var Paddle = React.createClass({
    render: function() {
        var x = this.props.paddle.x - HALF_PADDLE_WIDTH
        var y = this.props.paddle.y - HALF_PADDLE_HEIGHT
        return (
            <rect x={x} y={y} width={PADDLE_WIDTH} height={PADDLE_HEIGHT}/>
        )
    }
})


window.setInterval(function() {
    React.render(
        <GameBoard width="50%" gameState={gameState} >
        </GameBoard>, document.getElementById("react-here")
    )
}, 100)

//KEYBOARD STUFF
var W_KEYCODE = 87
var S_KEYCODE = 83
var I_KEYCODE = 73
var K_KEYCODE = 75

document.addEventListener("keydown", function(event) {
    var code = event.keyCode
    if (code == W_KEYCODE) {keysPressed.w = true}
    if (code == S_KEYCODE) {keysPressed.s = true}
    if (code == I_KEYCODE) {keysPressed.i = true}
    if (code == K_KEYCODE) {keysPressed.k = true}
})

document.addEventListener("keyup", function(event) {
    var code = event.keycode
    if (code == W_KEYCODE) {keysPressed.w = false}
    if (code == S_KEYCODE) {keysPressed.s = false}
    if (code == I_KEYCODE) {keysPressed.i = false}
    if (code == K_KEYCODE) {keysPressed.k = false}
        console.log("keyup")
})


window.setInterval(function() {
    if (keysPressed.w && keysPressed.s) {}
    else if (keysPressed.w) {movePaddleUp(gameState.leftPaddle)}
    else if (keysPressed.s) {movePaddleDown(gameState.leftPaddle)}

    if (keysPressed.i && keysPressed.k) {}
    else if (keysPressed.i) {movePaddleUp(gameState.rightPaddle)}
    else if (keysPressed.k) {movePaddleDown(gameState.rightPaddle)}

}, 30)




// GAME STATE MANIPULATION

function movePaddleDown(paddle) {
    movePaddle(paddle, PADDLE_MOVE_SPEED)
}

function movePaddleUp(paddle) {
    movePaddle(paddle, -1*PADDLE_MOVE_SPEED)
}

function movePaddle(paddle, amount) {
    paddle.y = paddle.y + amount
}
