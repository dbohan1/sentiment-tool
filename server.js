const http = require('http');
const WebSocket = require('ws');

const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  // Simple health check for Render
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

const wss = new WebSocket.Server({ server });

let ratings = [];

wss.on('connection', (ws) => {
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
