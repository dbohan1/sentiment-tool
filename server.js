const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server and bind WebSocket to it
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let ratings = [];

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (e) {
      parsedMessage = message;
    }

    if (typeof parsedMessage === 'number') {
      // Handle rating submission
      const rating = parseInt(parsedMessage);
      if (rating >= 1 && rating <= 5) {
        ratings.push(rating);
        const average = calculateAverage();
        broadcastAverage(average);
      }
    } else if (parsedMessage.type === 'clear') {
      // Handle clearing the average
      ratings = [];
      broadcastAverage(0);
    }
  });

  ws.send(JSON.stringify({ type: 'average', average: calculateAverage() }));
});

function broadcastAverage(average) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'average', average }));
    }
  });
}

function calculateAverage() {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}`);
});
