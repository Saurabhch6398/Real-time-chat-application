import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import io, { Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import LoginScreen from '../components/LoginScreen';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: string;
}

// Function to resolve backend URL. Handles localhost vs network IP (for physical devices).
const getBackendUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }
  return 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();

const QUICK_REPLIES = [
  "Hi Ananya! 👋",
  "How does Socket.io work? ⚡",
  "Tell me a bit more! 🤔",
  "This is awesome! 🎉"
];

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>('🌟');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnanyaOnline, setIsAnanyaOnline] = useState(true);
  const [isAnanyaTyping, setIsAnanyaTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [serverUrl, setServerUrl] = useState(BACKEND_URL);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to Socket.io and Fetch Message History
  useEffect(() => {
    if (!username) return;

    setLoadingHistory(true);

    // 1. Fetch Chat History via REST API
    fetch(`${serverUrl}/api/messages`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoadingHistory(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .catch((err) => {
        console.error('Failed to fetch chat history:', err);
        setLoadingHistory(false);
      });

    // 2. Initialize Socket.io client connection
    const socket = io(serverUrl, {
      transports: ['websocket'],
      forceNew: true
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      socket.emit('join', username);
    });

    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socket.on('typing', (data: { user: string }) => {
      if (data.user === 'Ananya Sarkar') {
        setIsAnanyaTyping(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });

    socket.on('stop_typing', (data: { user: string }) => {
      if (data.user === 'Ananya Sarkar') {
        setIsAnanyaTyping(false);
      }
    });

    socket.on('user_status_change', (data: { user: string; status: string }) => {
      if (data.user === 'Ananya Sarkar') {
        setIsAnanyaOnline(data.status === 'online');
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [username, serverUrl]);

  // Handle typing input changes
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!socketRef.current) return;

    socketRef.current.emit('typing', { user: username });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('stop_typing', { user: username });
      }
    }, 1500);
  };

  // Send message
  const handleSend = (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !socketRef.current || !username) return;

    socketRef.current.emit('send_message', {
      text: trimmed,
      user: username
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit('stop_typing', { user: username });
    setInputText('');
  };

  const handleJoin = (chosenName: string, chosenAvatar: string) => {
    setAvatar(chosenAvatar);
    setUsername(chosenName);
  };

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setUsername(null);
    setMessages([]);
  };

  if (!username) {
    return (
      <View style={styles.loginWrapper}>
        <LoginScreen onJoin={handleJoin} />
        <View style={styles.serverConfigContainer}>
          <Text style={styles.serverConfigLabel}>Backend Server URL:</Text>
          <TextInput
            style={styles.serverConfigInput}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://192.168.x.x:5000"
            placeholderTextColor="#64748B"
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Subtle background ambient mesh glows */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ChatHeader
          recipientName="Ananya Sarkar"
          isTyping={isAnanyaTyping}
          isOnline={isAnanyaOnline}
          onLeave={handleLeave}
        />

        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Fetching message history...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble message={item} currentUser={username} />
            )}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={() => (isAnanyaTyping ? <TypingIndicator /> : null)}
          />
        )}

        {/* Quick Replies Row */}
        <View style={styles.quickRepliesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesScroll}>
            {QUICK_REPLIES.map((reply, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.replyChip}
                onPress={() => handleSend(reply)}
                activeOpacity={0.7}
              >
                <Text style={styles.replyChipText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={[
              styles.textInput,
              isInputFocused && styles.textInputFocused
            ]}
            placeholder="Type your message..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={handleInputChange}
            onSubmitEditing={() => handleSend()}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginWrapper: {
    flex: 1,
    backgroundColor: '#070C18',
  },
  serverConfigContainer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    backgroundColor: '#070C18',
  },
  serverConfigLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  serverConfigInput: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#94A3B8',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#070C18', // Deep twilight dark background
    position: 'relative',
    overflow: 'hidden',
  },
  glowTopRight: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8B5CF6',
    position: 'absolute',
    top: 60,
    right: -60,
    opacity: 0.08,
  },
  glowBottomLeft: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#6366F1',
    position: 'absolute',
    bottom: 80,
    left: -85,
    opacity: 0.08,
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  quickRepliesContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.3)',
    backgroundColor: 'rgba(7, 12, 24, 0.6)',
  },
  quickRepliesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  replyChip: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  replyChipText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.85)', // Glass effect Slate 800
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: '#F8FAFC',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textInputFocused: {
    borderColor: '#6366F1', // Glowing active border on focus
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#6366F1',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
