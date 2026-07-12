import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';

interface ChatHeaderProps {
  recipientName: string;
  isTyping: boolean;
  isOnline: boolean;
  onLeave: () => void;
}

export default function ChatHeader({ recipientName, isTyping, isOnline, onLeave }: ChatHeaderProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isOnline && !isTyping) {
      // Loop the pulsing glow ring animation
      const animation = Animated.loop(
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 2,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => {
        animation.stop();
        pulseAnim.setValue(1);
        opacityAnim.setValue(0.6);
      };
    }
  }, [isOnline, isTyping, pulseAnim, opacityAnim]);

  // Determine status color scheme
  const getStatusColor = () => {
    if (isTyping) return '#F59E0B'; // Amber
    if (isOnline) return '#10B981'; // Emerald
    return '#64748B'; // Slate
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.avatarEmoji}>👩‍💻</Text>
          
          {/* Pulsing ring underneath the indicator when online */}
          {isOnline && !isTyping && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: opacityAnim,
                  backgroundColor: '#10B981',
                },
              ]}
            />
          )}
          
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor() }
            ]}
          />
        </View>
        <View style={styles.infoWrapper}>
          <Text style={styles.name}>{recipientName}</Text>
          <Text style={[styles.statusText, isTyping && styles.typingText]}>
            {isTyping ? 'typing...' : isOnline ? 'Active Now' : 'Offline'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.leaveButton} onPress={onLeave} activeOpacity={0.7}>
        <Text style={styles.leaveButtonText}>Leave Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.85)', // Semi-transparent glass Slate 800
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)', // Subtle Slate 700 divider
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: '#1E293B',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    bottom: -3.5,
    right: -3.5,
    width: 18,
    height: 18,
    borderRadius: 9,
    zIndex: 1,
  },
  infoWrapper: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  statusText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  typingText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  leaveButtonText: {
    color: '#CBD5E1', // Slate 300
    fontSize: 12,
    fontWeight: '600',
  },
});
