import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  Easing
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

  // Animation values for premium entry card feel
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslateY]);

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
      
      {/* Decorative Neon Mesh Ambient Glows */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }]
            }
          ]}
        >
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
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C18', // Deep twilight space color (slightly darker than slate-900 for more premium contrast)
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowTopRight: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#8B5CF6', // Purple 500
    position: 'absolute',
    top: -80,
    right: -80,
    opacity: 0.12,
  },
  glowBottomLeft: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#6366F1', // Indigo 500
    position: 'absolute',
    bottom: -100,
    left: -100,
    opacity: 0.1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    zIndex: 2,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)', // Glass Slate-800
    borderRadius: 30,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', // High-fidelity fine glass border
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '600',
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
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: '#6366F1',
    transform: [{ scale: 1.15 }],
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
