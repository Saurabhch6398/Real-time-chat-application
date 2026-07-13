require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const os = require('os');
const messagesRouter = require('./routes/messages');
const { initSocket } = require('./socket/chat');
const { connectDB } = require('./db');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB Atlas (if MONGODB_URI is provided)
connectDB();

// Enable CORS for frontend clients
app.use(cors({
  origin: '*', // Allow all origins for development ease (Expo clients)
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Set up Socket.io with CORS settings
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store Socket.io instance on app to access it in routes
app.set('socketio', io);

// API Routes
app.use('/api/messages', messagesRouter);

// Root Route
app.get('/', (req, res) => {
  res.status(200).send('Real-Time Chatbot Backend is running successfully!');
});

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Initialize Socket.io events
initSocket(io);

// Determine Local IP Address (useful for mobile clients to connect over Wi-Fi)
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 5000;
const LOCAL_IP = getLocalIpAddress();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`Server running on:`);
  console.log(`- Localhost:  http://localhost:${PORT}`);
  console.log(`- Network IP: http://${LOCAL_IP}:${PORT}`);
  console.log(`====================================================`);
});
