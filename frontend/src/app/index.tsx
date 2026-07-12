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
  Keyboard
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

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>('🌟');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnanyaOnline, setIsAnanyaOnline] = useState(true); // Ananya simulator is on the backend
  const [isAnanyaTyping, setIsAnanyaTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [serverUrl, setServerUrl] = useState(BACKEND_URL);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to Socket.io and Fetch Message History once Username is chosen
  useEffect(() => {
    if (!username) return;

    setLoadingHistory(true);

    // 1. Fetch Chat History via REST API
    fetch(`${serverUrl}/api/messages`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoadingHistory(false);
        // Scroll to bottom after loading messages
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
      // Join the chat server
      socket.emit('join', username);
    });

    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => {
        // Prevent duplicate messages in list if REST API + socket broadcast collide
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // Scroll to bottom
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

  // Handle typing input changes and socket typing status trigger
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (!socketRef.current) return;

    // Send typing status to server
    socketRef.current.emit('typing', { user: username });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing status after 1.5 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('stop_typing', { user: username });
      }
    }, 1500);
  };

  // Send message
  const handleSend = () => {
    const textToSend = inputText.trim();
    if (!textToSend || !socketRef.current || !username) return;

    // Emit the message over Socket.io
    socketRef.current.emit('send_message', {
      text: textToSend,
      user: username
    });

    // Clear typing indicator and input fields
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
        {/* Optional Server URL config for testing */}
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

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={handleInputChange}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
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
    backgroundColor: '#0F172A',
  },
  serverConfigContainer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    backgroundColor: '#0F172A',
  },
  serverConfigLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  serverConfigInput: {
    backgroundColor: '#1E293B',
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
    backgroundColor: '#0F172A', // Slate 900
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
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
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1E293B', // Slate 800
    borderTopWidth: 1,
    borderTopColor: '#334155', // Slate 700
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#F8FAFC',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#6366F1', // Indigo 500
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
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
