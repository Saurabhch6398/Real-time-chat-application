const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DB_PATH = path.join(__dirname, 'database.json');
const isMongoEnabled = !!process.env.MONGODB_URI;

// Define MongoDB schema if enabled
let MessageModel;
if (isMongoEnabled) {
  const messageSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    user: { type: String, required: true },
    timestamp: { type: String, required: true }
  });
  MessageModel = mongoose.model('Message', messageSchema);
}

/**
 * Checks if MongoDB is enabled and currently connected.
 * @returns {boolean}
 */
function useMongo() {
  return isMongoEnabled && mongoose.connection.readyState === 1;
}

/**
 * Connect to MongoDB Atlas if the MONGODB_URI is provided.
 */
async function connectDB() {
  if (!isMongoEnabled) {
    console.log('⚠️  MONGODB_URI is not set. Falling back to local database.json storage.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 Successfully connected to MongoDB Atlas!');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
    console.log('⚠️  Falling back to local database.json storage due to connection failure.');
  }
}

/**
 * Read all messages from the local JSON database file.
 * @returns {Array}
 */
function getLocalMessages() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Failed to read messages from database.json:', error);
    return [];
  }
}

/**
 * Save a message to the local JSON database file.
 * @param {Object} message 
 * @returns {Object|null}
 */
function saveLocalMessage(message) {
  try {
    const messages = getLocalMessages();
    messages.push(message);
    fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2), 'utf8');
    return message;
  } catch (error) {
    console.error('Failed to write message to database.json:', error);
    return null;
  }
}

/**
 * Get all messages.
 * @returns {Promise<Array>} List of messages.
 */
async function getMessages() {
  if (useMongo()) {
    try {
      const messages = await MessageModel.find({}).sort({ timestamp: 1 });
      return messages.map(m => ({
        id: m.id,
        text: m.text,
        user: m.user,
        timestamp: m.timestamp
      }));
    } catch (error) {
      console.error('Error fetching messages from MongoDB, using local fallback:', error);
      return getLocalMessages();
    }
  } else {
    return getLocalMessages();
  }
}

/**
 * Save a message.
 * @param {Object} message The message object to save.
 * @returns {Promise<Object|null>} The saved message, or null if save failed.
 */
async function saveMessage(message) {
  if (useMongo()) {
    try {
      const newMessage = new MessageModel({
        id: message.id,
        text: message.text,
        user: message.user,
        timestamp: message.timestamp
      });
      await newMessage.save();
      return message;
    } catch (error) {
      console.error('Error saving message to MongoDB, saving locally instead:', error);
      return saveLocalMessage(message);
    }
  } else {
    return saveLocalMessage(message);
  }
}

module.exports = {
  connectDB,
  getMessages,
  saveMessage
};
