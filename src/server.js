const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const JWT_SECRET = 'your-secret-key';
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/auth', authRoutes);

// Store connected clients
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'auth') {
        const token = data.token;
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          clients.set(ws, decoded.userId);
          ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
        } catch (err) {
          ws.send(JSON.stringify({ type: 'auth', status: 'error', message: 'Invalid token' }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});