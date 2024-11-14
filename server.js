const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let ratings = [];

server.on('connection', (ws) => {
  ws.on('message', (message) => {
    const rating = parseInt(message);
    if (rating >= 1 && rating <= 5) {
      ratings.push(rating);
      const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      broadcastAverage(average);
    }
  });

  ws.send(JSON.stringify({ type: 'average', average: calculateAverage() }));
});

function broadcastAverage(average) {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'average', average }));
    }
  });
}

function calculateAverage() {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}

console.log('WebSocket server is running on ws://localhost:8080');
