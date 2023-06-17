const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the "public" folder
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected.');

  // Handle messages from the client
  socket.on('message', (data) => {
    console.log('Received message:', data);

    // Broadcast the message to all connected clients
    io.emit('message', data);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});