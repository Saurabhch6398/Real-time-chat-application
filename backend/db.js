const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

/**
 * Get all messages from the database.
 * @returns {Array} List of messages.
 */
function getMessages() {
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
 * Save a message to the database.
 * @param {Object} message The message object to save.
 * @returns {Object|null} The saved message, or null if save failed.
 */
function saveMessage(message) {
  try {
    const messages = getMessages();
    messages.push(message);
    fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2), 'utf8');
    return message;
  } catch (error) {
    console.error('Failed to write message to database.json:', error);
    return null;
  }
}

module.exports = {
  getMessages,
  saveMessage
};
