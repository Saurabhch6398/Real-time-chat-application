const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const ioClient = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const { initSocket } = require('./socket/chat');
const messagesRouter = require('./routes/messages');

// Backup the original database.json content
const dbPath = path.join(__dirname, 'database.json');
let dbBackup = '[]';
if (fs.existsSync(dbPath)) {
  dbBackup = fs.readFileSync(dbPath, 'utf8');
}

// Clear database for test isolation
fs.writeFileSync(dbPath, '[]', 'utf8');

// Initialize a testing server on port 5001
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

const io = socketIo(server);
app.set('socketio', io);
app.use('/api/messages', messagesRouter);

initSocket(io);

let testServer;
let clientSocket;

const cleanup = () => {
  if (clientSocket) clientSocket.disconnect();
  if (testServer) testServer.close();
  // Restore database.json backup
  fs.writeFileSync(dbPath, dbBackup, 'utf8');
};

console.log('Starting automated tests...');

testServer = server.listen(5001, '0.0.0.0', () => {
  console.log('Test server listening on port 5001');

  // Connect client socket
  clientSocket = ioClient('http://localhost:5001', {
    transports: ['websocket'],
    forceNew: true
  });

  clientSocket.on('connect', () => {
    console.log('1. Socket.io client successfully connected.');

    // Join room
    clientSocket.emit('join', 'TestUser');

    // Send a message
    const testMessage = {
      text: 'Hello Ananya, testing real-time socket connection!',
      user: 'TestUser'
    };
    
    console.log('2. Emitting send_message event...');
    clientSocket.emit('send_message', testMessage);
  });

  let messageReceivedCount = 0;
  let hasBotResponse = false;
  let hasTypingIndicator = false;

  clientSocket.on('typing', (data) => {
    if (data.user === 'Ananya Sarkar') {
      console.log('4. Received "typing" indicator from Ananya Sarkar.');
      hasTypingIndicator = true;
    }
  });

  clientSocket.on('receive_message', (msg) => {
    messageReceivedCount++;
    console.log(`3. Received message broadcast [${messageReceivedCount}]: "${msg.text}" from ${msg.user}`);

    if (msg.user === 'TestUser') {
      if (msg.text === 'Hello Ananya, testing real-time socket connection!') {
        console.log('- Verified sent message broadcast matches expectation.');
      } else {
        console.error('- FAILED: Broadcast message content mismatch.');
        cleanup();
        process.exit(1);
      }
    }

    if (msg.user === 'Ananya Sarkar') {
      console.log('5. Received automated reply from Ananya Sarkar.');
      hasBotResponse = true;

      // Verify the database persistence via REST API
      console.log('6. Verifying database history via REST API...');
      
      const req = http.get('http://localhost:5001/api/messages', (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log(`- GET /api/messages returned ${parsedData.length} persisted messages.`);
            
            // We expect at least 2 messages: the one we sent, and Ananya's auto-reply
            if (parsedData.length >= 2) {
              console.log('- Verified message history is successfully saved and retrieved.');
            } else {
              console.error(`- FAILED: Expected >= 2 messages in history, got ${parsedData.length}`);
              cleanup();
              process.exit(1);
            }

            // Assert typing status and bot responses were simulated
            if (hasBotResponse && hasTypingIndicator) {
              console.log('\n=========================================');
              console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! ✅');
              console.log('=========================================');
              cleanup();
              process.exit(0);
            } else {
              console.error(`- FAILED: Missing simulated response (${hasBotResponse}) or typing indicator (${hasTypingIndicator})`);
              cleanup();
              process.exit(1);
            }
          } catch (e) {
            console.error('- FAILED: Failed to parse REST response:', e.message);
            cleanup();
            process.exit(1);
          }
        });
      });

      req.on('error', (e) => {
        console.error(`- FAILED: REST API request failed: ${e.message}`);
        cleanup();
        process.exit(1);
      });
    }
  });
});

// Set a timeout of 10 seconds to abort if socket flow hangs
setTimeout(() => {
  console.error('FAILED: Verification tests timed out.');
  cleanup();
  process.exit(1);
}, 10000);
