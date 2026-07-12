import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';

interface LoginScreenProps {
  onJoin: (username: string, avatar: string) => void;
}

const AVATARS = ['🌟', '🔥', '🦊', '🎨', '🚀', '🔮', '🐼', '👾'];
const AVATAR_COLORS = [
  '#FCD34D', // Amber
  '#F87171', // Red
  '#FB923C', // Orange
  '#34D399', // Emerald
  '#60A5FA', // Blue
  '#C084FC', // Purple
  '#A7F3D0', // Mint
  '#F472B6'  // Pink
];

export default function LoginScreen({ onJoin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);
  const [error, setError] = useState('');

  const handleJoin = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a nickname to start.');
      return;
    }
    if (trimmed.toLowerCase() === 'ananya sarkar') {
      setError('Nickname "Ananya Sarkar" is reserved.');
      return;
    }
    setError('');
    onJoin(trimmed, AVATARS[selectedAvatarIdx]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to Chat</Text>
          <Text style={styles.subtitle}>Connect in real-time with Ananya Sarkar and others.</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. JohnDoe"
              placeholderTextColor="#64748B"
              value={username}
              onChangeText={(txt) => {
                setUsername(txt);
                if (error) setError('');
              }}
              maxLength={20}
              autoCapitalize="words"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.avatarSection}>
            <Text style={styles.label}>Select your Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar, idx) => {
                const isSelected = selectedAvatarIdx === idx;
                const bgColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.avatarWrapper,
                      { backgroundColor: bgColor },
                      isSelected && styles.avatarSelected
                    ]}
                    onPress={() => setSelectedAvatarIdx(idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.avatarEmoji}>{avatar}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleJoin} activeOpacity={0.9}>
            <Text style={styles.buttonText}>Enter Chat Room</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>Powered by Socket.io • Express • React Native</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC', // Slate 50
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8', // Slate 400
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444', // Red 500
    marginTop: 6,
    fontWeight: '500',
  },
  avatarSection: {
    marginBottom: 32,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: '#6366F1', // Indigo 500
    transform: [{ scale: 1.1 }],
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  button: {
    backgroundColor: '#6366F1', // Indigo 500
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
