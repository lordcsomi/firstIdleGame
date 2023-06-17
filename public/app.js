// get elements
const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Establish a WebSocket connection with the server
const socket = io();

// Handle server messages
socket.on('message', (data) => {
  console.log('Received message:', data);
});

// Send a message to the server
socket.emit('message', 'Hello, server!');

// variables
let name; // the name of the player
let canvasSize = {
  width: window.innerWidth,
  height: window.innerHeight
}

// enemy variables
let enemies = []; // array to hold enemies that are currently on the screen aka enemies that are alive
let enemyCount = 0; // number of enemies that are alive
let enemySpeed = 1; // speed of the enemies
let enemySpawnRate = 1000; // rate at which enemies spawn
let enemySpawnRateChange = 0; // change in spawn rate

let particles = []; // array to hold particles that are currently on the screen
let fireLines = []; // array to hold fire lines that are currently on the screen

let score = 0; // score of the player
let scoreMultiplier = 1; // multiplier for the score

let player; // the player
let mousePos = { // the position of the mouse
  x: 0,
  y: 0
}


// setup
canvas.width = canvasSize.width;
canvas.height = canvasSize.height;
let center = {
  x: canvasSize.width / 2,
  y: canvasSize.height / 2
}

// onclick
document.addEventListener('click', (e) => {
  // get mouse position
  let mousePos = {
    x: e.clientX,
    y: e.clientY
  }
  console.log(mousePos);
  drawLine(center.x, center.y, mousePos.x, mousePos.y, 10, 'white');

});

function drawLine(x1, y1, x2, y2, width, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}


// on resize
window.addEventListener('resize', () => {
  console.log('Resizing window...');
  // update canvas size
  canvasSize = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;
  center = {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
  location.reload();
});