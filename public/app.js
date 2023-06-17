// get elements
const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Establish a WebSocket connection with the server
const socket = io();
socket.on('message', (data) => {
  console.log('Received message:', data);
});



// ---------------------------------- //
// ---------- GAME VARIABLES -------- //
// ---------------------------------- //
let name;
let canvasSize = {
  width: window.innerWidth,
  height: window.innerHeight
}
var player = {
  // at the center of the screen
  x: canvasSize.width / 2,
  y: canvasSize.height / 2,
  // size
  radius: 30,
  // color
  color: 'purple',
  // regular hexagon
  vertices: [
    { x: 0, y: 1 },
    { x: 0.866, y: 0.5 },
    { x: 0.866, y: -0.5 },
    { x: 0, y: -1 },
    { x: -0.866, y: -0.5 },
    { x: -0.866, y: 0.5 },
  ],
  // rotation future implementation
  rotation: 0,
};

// enemy variables
let enemies = []; // array to hold enemies that are currently on the screen aka enemies that are alive
let enemyCount = 0; // number of enemies that are alive
let enemyHealth = 100; // health of the enemies
let enemyMax = 3; // max number of enemies that can be on the screen at once
let enemySpeed = 1; // speed of the enemies
let enemySpawnRate = 1000; // rate at which enemies spawn
let enemySpawnRateChange = 0; // change in spawn rate

// Parameters for particle system
let particles = []; // array to hold particles that are currently on the screen
const initialLifespan = 100; // Initial lifespan of particles
const deletionThreshold = 10; // Lifespan threshold for particle deletion
const velocityModifier = 0.98; // Velocity modifier for particles
let fireLines = []; // array to hold fire lines that should be drawn

// score 
let score = 0; // score of the player
let scoreMultiplier = 1; // multiplier for the score

let mouse = { // mouse position
  x: 0,
  y: 0,
  clicked: false,
};


// ---------------------------------- //
// ---------- GAME OBJECTS ---------- //
// ---------------------------------- //
// particles
class Particle {
  constructor(x, y, velocityX, velocityY, color, size, lifespan) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.color = color;
    this.size = size;
    this.lifespan = lifespan;
    this.opacity = 1;
  };

  // Update the particle's position and properties
  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.lifespan--;

    // Modify particle velocity
    this.velocityX *= velocityModifier;
    this.velocityY *= velocityModifier;

    // Modify particle opacity based on lifespan
    this.opacity = this.lifespan / initialLifespan;

    // Delete particle if lifespan is zero or negative
    if (this.lifespan <= 0) {
      const particleIndex = particles.indexOf(this);
      particles.splice(particleIndex, 1);
    }
  };

  // Render the particle on the canvas
  render() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
    ctx.fill();
    ctx.closePath();
  };
}

// fire line
function distanceToLineSegment(x1, y1, x2, y2, px, py) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lineLengthSquared = dx * dx + dy * dy;
  // If the line segment is degenerate (zero length), return the distance to the start point
  if (lineLengthSquared === 0) {
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  }
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lineLengthSquared));
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;
  return Math.sqrt((px - projectionX) * (px - projectionX) + (py - projectionY) * (py - projectionY));
}

class FireLine {
  constructor(x1, y1, x2, y2, width, color, lifespan) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.width = width;
    this.color = color;
    this.lifespan = lifespan;
  };

  // update fire line
  update() {
    this.lifespan--;
  
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
  
      // Calculate the distance from the enemy to the fire line
      const distance = distanceToLineSegment(this.x1, this.y1, this.x2, this.y2, enemy.x, enemy.y);
  
      // Check if the distance is less than or equal to the enemy's radius
      if (distance <= enemy.radius) {
        // Collision detected
        // particle effect
        for (let i = 0; i < 25; i++) {
          particles.push(new Particle(enemy.x, enemy.y, Math.random() * 10 - 5, Math.random() * 10 - 5, '255, 127, 80', 5, 50));
        }
        const enemyIndex = enemies.indexOf(enemy);
        enemies.splice(enemyIndex, 1);
        enemyCount--;
      }
    }
  
    if (this.lifespan <= 0) {
      const fireLineIndex = fireLines.indexOf(this);
      fireLines.splice(fireLineIndex, 1);
    }
  }

  // render fire line
  render() {
    drawLine(this.x1, this.y1, this.x2, this.y2, this.width, this.color);
  };
}

// enemy
class Enemy {
  constructor(x, y, radius, color, speed, health) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.health = health;
  };

  // update enemy position
  // move towards the center
  update() {
    // get angle between enemy and center
    let angle = Math.atan2(center.y - this.y, center.x - this.x);
    // move enemy towards center
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
    // check if enemy is close enough to center to be deleted
    if (Math.sqrt(Math.pow(center.x - this.x, 2) + Math.pow(center.y - this.y, 2)) < this.radius + player.radius) {
      // delete enemy
      const enemyIndex = enemies.indexOf(this);
      enemies.splice(enemyIndex, 1);
      // update enemy count
      enemyCount--;
      // update score
      score += 100 * scoreMultiplier;
      // update score multiplier
      scoreMultiplier += 0.1;
      // spawn particles
      for (let i = 0; i < 25; i++) {
        particles.push(new Particle(this.x, this.y, Math.random() * 10 - 5, Math.random() * 10 - 5, '255, 0, 0', 5, 50));
      }
    }
  };

  // render enemy on canvas
  render() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  };
}

// setup
canvas.width = canvasSize.width;
canvas.height = canvasSize.height;
let center = {
  x: canvasSize.width / 2,
  y: canvasSize.height / 2
}

// ---------------------------------- //
// ---------- DRAW FUNCTIONS ---------- //
// ---------------------------------- //
function drawLine(x1, y1, x2, y2, width, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawPolygon(x, y, radius, vertices, color, rotation) {
  ctx.beginPath();
  ctx.moveTo(x + radius * vertices[0].x, y + radius * vertices[0].y);
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(x + radius * vertices[i].x, y + radius * vertices[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// ---------------------------------- //
// ---------- GAME LOOP -------- //
// ---------------------------------- //

// update
function updateGame(){
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

  // summon enemies randomly outside of the screen
  // increase enemy speed and spawn rate over time in a linear fashion
  if (enemyCount < enemyMax) {
    // spawn enemy
    let spawnSide = Math.floor(Math.random() * 4);
    let x, y;
    switch (spawnSide) {
      case 0: // top
        x = Math.random() * canvasSize.width;
        y = -50;
        break;
      case 1: // right
        x = canvasSize.width + 50;
        y = Math.random() * canvasSize.height;
        break;
      case 2: // bottom
        x = Math.random() * canvasSize.width;
        y = canvasSize.height + 50;
        break;
      case 3: // left
        x = -50;
        y = Math.random() * canvasSize.height;
        break;
    }
    enemies.push(new Enemy(x, y, 10, 'red', enemySpeed, 100));
    enemyCount++;
    

    // ---------------------  need balancing --------------------- //
    enemySpeed += 0.001;
    enemyMax += 0.1;
    enemySpawnRate -= 10;
  }

  // update enemies
  for(let i = 0; i < enemies.length; i++){
    enemies[i].update(); 
    // check if the enemy was not killed/deleted
    if(enemies[i] != null){
      enemies[i].render();
    }
  }
  // update particles
  for(let i = 0; i < particles.length; i++){
    particles[i].update();
    if (particles[i] != null){
      particles[i].render();
    }
  }
  // update fire lines
  for(let i = 0; i < fireLines.length; i++){
    fireLines[i].update();
    if (fireLines[i] != null){
      fireLines[i].render();
    }
  }
  // update player rotate and render
  drawPolygon(player.x, player.y, player.radius, player.vertices, player.color, player.rotation);
  
  requestAnimationFrame(updateGame);
}

updateGame();

// onclick
document.addEventListener('click', (e) => {
  // get mouse position
  let mousePos = {
    x: e.clientX,
    y: e.clientY
  }
  fireLines.push(new FireLine(center.x, center.y, mousePos.x, mousePos.y, 2, 'magenta', 10));
  // spawn particles
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(mousePos.x, mousePos.y, Math.random() * 10 - 5, Math.random() * 10 - 5, '255,0,255', 5, 15));
  }
});

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
  // update player position
  player.x = center.x;
  player.y = center.y;
  // update enemy position
  for(let i = 0; i < enemies.length; i++){
    enemies[i].x = center.x;
    enemies[i].y = center.y;
  }
  // update mouse position
  mouse.x = center.x;
  mouse.y = center.y;
  // update fire lines
  for(let i = 0; i < fireLines.length; i++){
    fireLines[i].x1 = center.x;
    fireLines[i].y1 = center.y;
  }
  // update particles
  for(let i = 0; i < particles.length; i++){
    particles[i].x = center.x;
    particles[i].y = center.y;
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
  location.reload();
});