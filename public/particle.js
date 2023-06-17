// Retrieve the canvas element from the HTML file
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Define the Particle class
class Particle {
  constructor(x, y, velocityX, velocityY, color, size) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.color = color;
    this.size = size;
  }

  // Update the particle's position and properties
  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    // Additional logic for particle behavior, e.g., bounce off walls
  }

  // Render the particle on the canvas
  render() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

// Create an array to store the particles
const particles = [];

// Generate particles and add them to the array
function generateParticles() {
  for (let i = 0; i < 10; i++) {
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const velocityX = (Math.random() - 0.5) * 5;
    const velocityY = (Math.random() - 0.5) * 5;
    const color = '#ffffff';
    const size = Math.random() * 5 + 1;

    particles.push(new Particle(x, y, velocityX, velocityY, color, size));
  }
}


setInterval(generateParticles, 100);

// Update and render the particles
function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].render();
  }

  requestAnimationFrame(updateParticles);
}

// Call the functions to generate and update particles
generateParticles();
updateParticles();
