import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';

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
  
  // Animation values for smooth fade-in and slide-up on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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
    <Animated.View
      style={[
        styles.container,
        isMe ? styles.alignRight : styles.alignLeft,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
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
        <View style={styles.metaRow}>
          <Text style={[styles.timestamp, isMe ? styles.timestampMe : styles.timestampOther]}>
            {formatTime(message.timestamp)}
          </Text>
          {isMe && (
            <Text style={styles.checkmark}> ✓✓</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    maxWidth: '82%',
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
    marginLeft: 14,
    marginBottom: 3,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
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
    lineHeight: 21,
  },
  textMe: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  textOther: {
    color: '#F1F5F9', // Slate 100
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  timestampMe: {
    color: '#C7D2FE', // Indigo 200
  },
  timestampOther: {
    color: '#64748B', // Slate 500
  },
  checkmark: {
    fontSize: 10,
    color: '#A5B4FC', // Light Indigo
    fontWeight: 'bold',
  },
});
