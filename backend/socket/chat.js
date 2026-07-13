const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Contextual responses for the simulated Ananya Sarkar bot
const ANANYA_RESPONSES = [
  "Hello! Hope you're having a wonderful day. How can I help you today?",
  "That sounds interesting! Can you tell me more about it?",
  "Haha, I totally agree with that!",
  "Hmm, let me think about that for a moment... I think it makes a lot of sense.",
  "I'm actually doing great! Thanks for asking. How are things on your end?",
  "That's awesome! Let me know if there's anything else I can assist you with.",
  "I am built using Node.js, Express, Socket.io, and React Native! Pretty cool stack, right?",
  "Real-time communication is so smooth with Socket.io! No polling or delayed loading.",
  "I can store our conversation so that even if you reload the app, our history will be safe."
];

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user registration / join room
    socket.on('join', (username) => {
      console.log(`User registered: ${username} with socket ID: ${socket.id}`);
      socket.username = username;
      // Broadcast user connected info
      socket.broadcast.emit('user_status_change', {
        user: username,
        status: 'online'
      });
    });

    // Handle incoming messages
    socket.on('send_message', async (data) => {
      console.log('Received message via socket:', data);
      const { text, user } = data;

      if (!text || !user) {
        console.error('Invalid message format received');
        return;
      }

      const message = {
        id: uuidv4(),
        text,
        user,
        timestamp: new Date().toISOString()
      };

      // Save message in DB
      const savedMessage = await db.saveMessage(message);

      if (savedMessage) {
        // Broadcast the saved message to all clients
        io.emit('receive_message', savedMessage);

        // If the message is sent by a real user (not Ananya Sarkar herself),
        // trigger a simulated typing status and reply from Ananya Sarkar.
        if (user !== 'Ananya Sarkar') {
          simulateAnanyaResponse(io, text);
        }
      }
    });

    // Handle typing status
    socket.on('typing', (data) => {
      // Broadcast typing status to everyone else
      socket.broadcast.emit('typing', data);
    });

    // Handle stop typing status
    socket.on('stop_typing', (data) => {
      // Broadcast stop typing status to everyone else
      socket.broadcast.emit('stop_typing', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      if (socket.username) {
        io.emit('user_status_change', {
          user: socket.username,
          status: 'offline'
        });
      }
    });
  });
}

/**
 * Simulates a realistic typing and response behavior from "Ananya Sarkar".
 */
function simulateAnanyaResponse(io, userMessage) {
  // Determine response based on user message keywords
  let responseText = "";
  const cleaned = userMessage.toLowerCase().trim();

  if (cleaned.includes('hello') || cleaned.includes('hi') || cleaned.includes('hey')) {
    responseText = "Hi there! I'm Ananya Sarkar. Great to connect with you here!";
  } else if (cleaned.includes('how are you')) {
    responseText = "I'm doing fantastic, thank you! How are you doing today?";
  } else if (cleaned.includes('socket') || cleaned.includes('realtime') || cleaned.includes('real time')) {
    responseText = "Yes! Using WebSockets via Socket.io allows us to exchange these messages with absolutely zero page refreshes.";
  } else if (cleaned.includes('persist') || cleaned.includes('history') || cleaned.includes('refresh')) {
    responseText = "Yep! Our chat history is saved in database.json on the server, so it survives app reboots and page refreshes.";
  } else {
    // Pick a random response
    const randomIndex = Math.floor(Math.random() * ANANYA_RESPONSES.length);
    responseText = ANANYA_RESPONSES[randomIndex];
  }

  // 1. After 1 second, send typing status
  setTimeout(() => {
    io.emit('typing', { user: 'Ananya Sarkar' });

    // 2. After another 2 seconds, stop typing and send the response
    setTimeout(async () => {
      io.emit('stop_typing', { user: 'Ananya Sarkar' });

      const replyMessage = {
        id: uuidv4(),
        text: responseText,
        user: 'Ananya Sarkar',
        timestamp: new Date().toISOString()
      };

      // Save and emit the reply
      const savedReply = await db.saveMessage(replyMessage);
      if (savedReply) {
        io.emit('receive_message', savedReply);
      }
    }, 2000);

  }, 1000);
}

module.exports = {
  initSocket
};
