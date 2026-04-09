/**
 * InitScreen — Enter user info and start chat
 * Equivalent to CreateUserFormScreen in Flutter example
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LiveTalkError, LiveTalkSdk } from 'omicall-chat-sdk';

interface Props {
  onJoined: (roomId: string, uuid: string) => void;
}

export default function InitScreen({ onJoined }: Props) {
  const [fullName, setFullName] = useState('Test Chat LiveTalk');
  const [phone, setPhone] = useState('0123456789');
  const [uuid, setUuid] = useState('test-uuid-001');
  const [autoExpired, setAutoExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!phone.trim() || !fullName.trim() || !uuid.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const roomId = await LiveTalkSdk.shareInstance.createRoom({
        phone: phone.trim(),
        fullName: fullName.trim(),
        uuid: uuid.trim(),
        autoExpired,
      });

      if (roomId) {
        onJoined(roomId, uuid.trim());
      }
    } catch (e) {
      const msg = e instanceof LiveTalkError ? e.errorKey : String(e);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Omicall LiveTalk</Text>
        <Text style={styles.subtitle}>Enter your info to start chatting</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="0123456789"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>UUID (unique identifier)</Text>
          <TextInput
            style={styles.input}
            value={uuid}
            onChangeText={setUuid}
            placeholder="Reuse to resume same room"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Auto Expired</Text>
          <Switch value={autoExpired} onValueChange={setAutoExpired} />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start Chat</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00897B',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  field: { marginBottom: 16 },
  label: { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#FAFAFA',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  switchLabel: { fontSize: 15, color: '#333' },
  button: {
    backgroundColor: '#00897B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#00897B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
