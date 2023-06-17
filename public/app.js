// Establish a WebSocket connection with the server
const socket = io();

// Handle server messages
socket.on('message', (data) => {
  console.log('Received message:', data);
});

// Send a message to the server
socket.emit('message', 'Hello, server!');

// Function to create an enemy element
function createEnemy() {
  const enemy = document.createElement('div');
  enemy.className = 'enemy';
  document.getElementById('game-container').appendChild(enemy);

  return enemy;
}

// Function to move the enemy towards the center
function moveEnemy(enemy) {
  const container = document.getElementById('game-container');
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  const enemyWidth = enemy.offsetWidth;
  const enemyHeight = enemy.offsetHeight;

  let posX = Math.random() < 0.5 ? -enemyWidth : containerWidth;
  let posY = Math.random() * containerHeight;

  enemy.style.left = posX + 'px';
  enemy.style.top = posY + 'px';

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const dx = centerX - posX;
  const dy = centerY - posY;

  const angle = Math.atan2(dy, dx);
  const speed = 1; // Adjust the speed as needed

  const moveInterval = setInterval(() => {
    posX += Math.cos(angle) * speed;
    posY += Math.sin(angle) * speed;

    enemy.style.left = posX + 'px';
    enemy.style.top = posY + 'px';

    // Check if the enemy reached the center
    if (Math.abs(posX - centerX) < enemyWidth / 2 && Math.abs(posY - centerY) < enemyHeight / 2) {
      clearInterval(moveInterval);
      enemy.remove();
    }
  }, 10); // Adjust the interval as needed

  return moveInterval;
}

// Function to start spawning enemies
function startSpawningEnemies() {
  setInterval(() => {
    const enemy = createEnemy();
    moveEnemy(enemy);
  }, 2000); // Adjust the interval as needed
}

// Start spawning enemies
startSpawningEnemies();