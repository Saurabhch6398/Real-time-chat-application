import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: string;
}

interface MessageBubbleProps {
  message: Message;
  currentUser: string;
}

export default function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const isMe = message.user === currentUser;

  // Format timestamp (e.g., 2026-07-12T08:00:00.000Z -> 08:00 AM)
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
      {!isMe && (
        <Text style={styles.senderName}>{message.user}</Text>
      )}
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther
        ]}
      >
        <Text style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, isMe ? styles.timestampMe : styles.timestampOther]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  alignLeft: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    color: '#94A3B8', // Slate 400
    marginLeft: 12,
    marginBottom: 2,
    fontWeight: '600',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: '#6366F1', // Indigo 500
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#1E293B', // Slate 800
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: '#F1F5F9', // Slate 100
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampMe: {
    color: '#C7D2FE', // Indigo 200
  },
  timestampOther: {
    color: '#64748B', // Slate 500
  },
});
