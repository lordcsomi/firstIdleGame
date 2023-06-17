// Retrieve the canvas element from the HTML file
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Mouse position
let mouse = {
  x: 0,
  y: 0
};

// Event listener to update mouse position
canvas.addEventListener('mousemove', function (event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// Define the Particle class
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
  }

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
  }

  // Render the particle on the canvas
  render() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
    ctx.fill();
    ctx.closePath();
  }
}

// Create an array to store the particles
const particles = [];

// Parameters for particle system
const initialLifespan = 100; // Initial lifespan of particles
const deletionThreshold = 10; // Lifespan threshold for particle deletion
const velocityModifier = 0.98; // Velocity modifier for particles

// Generate particles and add them to the array
function generateParticles() {
  for (let i = 0; i < 1; i++) {
    const x = mouse.x;
    const y = mouse.y;
    const velocityX = (Math.random() - 0.5) * 3; // x
    const velocityY = 5; // y
    const color = '255, 165, 0'; // Orange color for fire effect
    const size = Math.random() * 5 + 1;

    particles.push(new Particle(x, y, velocityX, velocityY, color, size, initialLifespan));
  }
}

// Update and render the particles
function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].render();
  }

  // Delete particles with low lifespan
  particles.forEach((particle) => {
    if (particle.lifespan <= deletionThreshold) {
      const particleIndex = particles.indexOf(particle);
      particles.splice(particleIndex, 1);
    }
  });
  console.log(particles.length);
  requestAnimationFrame(updateParticles);
}

// Call the functions to generate and update particles
generateParticles();
updateParticles();
setInterval(generateParticles, 100);

// on resize
window.addEventListener('resize', () => {
    console.log('Resizing window...');
    // update canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    }
);