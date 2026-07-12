import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface ChatHeaderProps {
  recipientName: string;
  isTyping: boolean;
  isOnline: boolean;
  onLeave: () => void;
}

export default function ChatHeader({ recipientName, isTyping, isOnline, onLeave }: ChatHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.avatarEmoji}>👩‍💻</Text>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isTyping ? '#F59E0B' : isOnline ? '#10B981' : '#64748B' }
            ]}
          />
        </View>
        <View style={styles.infoWrapper}>
          <Text style={styles.name}>{recipientName}</Text>
          <Text style={[styles.statusText, isTyping && styles.typingText]}>
            {isTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.leaveButton} onPress={onLeave} activeOpacity={0.7}>
        <Text style={styles.leaveButtonText}>Leave</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1E293B', // Slate 800
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // Slate 700
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  infoWrapper: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  statusText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  typingText: {
    color: '#F59E0B', // Amber 500
    fontWeight: '500',
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  leaveButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
});
