/**
 * Example app for omicall-chat-sdk
 * Flow: InitScreen → createRoom() → ChatScreen
 */
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { LiveTalkSdk } from 'omicall-chat-sdk';
import InitScreen from './src/screens/InitScreen';
import ChatScreen from './src/screens/ChatScreen';

// Replace with your actual domainPbx from Omicall
const DOMAIN_PBX = 'luuphuongmytrinh9a2';

// Initialize SDK once at app start
new LiveTalkSdk({ domainPbx: DOMAIN_PBX });

// Optional: inject RNFS for accurate file size validation
// import RNFS from 'react-native-fs';
// import { setFileSizeProvider } from 'omicall-chat-sdk';
// setFileSizeProvider(async (path) => (await RNFS.stat(path)).size);

type Screen =
  | { name: 'init' }
  | { name: 'chat'; roomId: string; uuid: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'init' });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00897B" />

      {screen.name === 'init' && (
        <InitScreen
          onJoined={(roomId, uuid) =>
            setScreen({ name: 'chat', roomId, uuid })
          }
        />
      )}

      {screen.name === 'chat' && (
        <ChatScreen
          roomId={screen.roomId}
          uuid={screen.uuid}
          onLogout={() => setScreen({ name: 'init' })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00897B' },
});
