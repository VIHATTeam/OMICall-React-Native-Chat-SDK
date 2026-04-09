/**
 * ChatScreen — full-featured chat screen
 * Features: message history, real-time events, send text/sticker/files,
 *           reply, react, remove message, typing indicator, pull-to-load-more
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  LiveTalkError,
  LiveTalkSdk,
  LiveTalkSendingMessage,
} from 'omicall-chat-sdk';
import type { LiveTalkMessageEntity } from 'omicall-chat-sdk';
import MessageItem from '../components/MessageItem';

interface Props {
  roomId: string;
  uuid: string;
  onLogout: () => void;
}

const PAGE_SIZE = 20;

export default function ChatScreen({ roomId, uuid, onLogout }: Props) {
  const [messages, setMessages] = useState<LiveTalkMessageEntity[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [titleText, setTitleText] = useState('LiveTalk');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyMessage, setReplyMessage] = useState<LiveTalkMessageEntity | null>(null);

  const page = useRef(1);
  const hasMore = useRef(true);
  const flatListRef = useRef<FlatList>(null);
  const sdk = LiveTalkSdk.shareInstance;

  // ---------------------------------------------------------------------------
  // Init: load room info + message history + subscribe events
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let unsubscribeEvent: (() => void) | undefined;
    let unsubscribeUpload: (() => void) | undefined;

    async function init() {
      try {
        const room = await sdk.getCurrentRoom();
        if (room) {
          if (room.hasMember && room.members && room.members.length > 0) {
            const agent = room.members[0];
            setTitleText(agent.fullName ?? 'Agent');
            setIsAdminOnline(agent.status === 'online');
          } else {
            setTitleText('Waiting for agent...');
          }
        }

        await loadHistory(1);
      } catch (e) {
        showError(e);
      } finally {
        setLoading(false);
      }

      // Real-time event subscription
      unsubscribeEvent = sdk.addEventListener((event) => {
        const { eventName, data } = event;

        if (eventName === 'message' && data) {
          const msg = data as LiveTalkMessageEntity;
          setMessages((prev) => [msg, ...prev]);
          return;
        }
        if (eventName === 'someone_typing') {
          setIsTyping(data?.isTyping === true);
          return;
        }
        if (eventName === 'member_join') {
          // Refresh room info when agent joins
          sdk.getCurrentRoom().then((room) => {
            if (room?.members?.[0]) {
              setTitleText(room.members[0].fullName ?? 'Agent');
              setIsAdminOnline(room.members[0].status === 'online');
            }
          });
          return;
        }
        if (eventName === 'member_connect') {
          setIsAdminOnline(true);
          return;
        }
        if (eventName === 'member_disconnect') {
          setIsAdminOnline(false);
          return;
        }
        if (eventName === 'lt_reaction') {
          const msgId = data?.msg_id;
          const reactions = data?.reactions as LiveTalkMessageEntity['reactions'];
          if (msgId) {
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === msgId) {
                  return { ...m, reactions };
                }
                return m;
              })
            );
          }
          return;
        }
        if (eventName === 'remove_message') {
          const msgId = data?.message_id;
          if (msgId) {
            setMessages((prev) => prev.filter((m) => m.id !== msgId));
          }
          return;
        }
      });

      // Upload progress subscription
      unsubscribeUpload = sdk.addUploadProgressListener((event) => {
        if (event.status === 3) {
          // upload complete — can show a toast here
        }
        if (event.status === 4) {
          Alert.alert('Upload failed', event.errorKey ?? 'Unknown error');
        }
      });
    }

    init();

    return () => {
      unsubscribeEvent?.();
      unsubscribeUpload?.();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Load message history (paginated)
  // ---------------------------------------------------------------------------
  async function loadHistory(p: number) {
    if (p === 1) {
      page.current = 1;
      hasMore.current = true;
    }
    const data = await sdk.getMessageHistory(p - 1, PAGE_SIZE);
    if (data.length < PAGE_SIZE) hasMore.current = false;

    setMessages((prev) => (p === 1 ? data : [...prev, ...data]));
    page.current = p;
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore.current) return;
    setLoadingMore(true);
    try {
      await loadHistory(page.current + 1);
    } finally {
      setLoadingMore(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Send text message
  // ---------------------------------------------------------------------------
  async function handleSendText() {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    try {
      const msg = LiveTalkSendingMessage.createTextMessage({
        message: text,
        quoteId: replyMessage?.id,
      });
      await sdk.sendMessage(msg);
      setReplyMessage(null);
    } catch (e) {
      showError(e);
    }
  }

  // ---------------------------------------------------------------------------
  // Send sticker (uses input text as sticker URL for demo)
  // ---------------------------------------------------------------------------
  async function handleSendSticker() {
    const url = inputText.trim();
    if (!url) {
      Alert.alert('Sticker', 'Enter a sticker URL in the input field, then press this button');
      return;
    }
    setInputText('');
    try {
      const msg = LiveTalkSendingMessage.createSticker({ sticker: url });
      await sdk.sendMessage(msg);
    } catch (e) {
      showError(e);
    }
  }

  // ---------------------------------------------------------------------------
  // Attach — image library or camera, mirrors Flutter's action sheet
  // ---------------------------------------------------------------------------
  function handleAttach() {
    const options = ['Photo Library', 'Camera', 'Cancel'];
    const cancelIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex },
        (idx) => {
          if (idx === 0) pickFromLibrary();
          else if (idx === 1) pickFromCamera();
        },
      );
    } else {
      // Android: simple Alert acting as action sheet
      Alert.alert('Send media', 'Choose source', [
        { text: 'Photo Library', onPress: pickFromLibrary },
        { text: 'Camera', onPress: pickFromCamera },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  async function pickFromLibrary() {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 6,
        quality: 0.9,
      });
      if (result.didCancel || !result.assets?.length) return;
      const paths = result.assets
        .map((a) => a.uri)
        .filter((u): u is string => !!u);
      if (!paths.length) return;
      const msg = LiveTalkSendingMessage.createFiles({ paths });
      await sdk.sendMessage(msg);
    } catch (e) {
      showError(e);
    }
  }

  async function pickFromCamera() {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.9,
        saveToPhotos: false,
      });
      if (result.didCancel || !result.assets?.length) return;
      const uri = result.assets[0]?.uri;
      if (!uri) return;
      const msg = LiveTalkSendingMessage.createFiles({ paths: [uri] });
      await sdk.sendMessage(msg);
    } catch (e) {
      showError(e);
    }
  }

  // ---------------------------------------------------------------------------
  // Long press — delete message
  // ---------------------------------------------------------------------------
  const handleLongPress = useCallback((msg: LiveTalkMessageEntity) => {
    const options = ['Delete Message', 'Cancel'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 1, destructiveButtonIndex: 0 },
        async (idx) => {
          if (idx === 0 && msg.id) {
            try {
              await sdk.removeMessage({ id: msg.id });
            } catch (e) {
              showError(e);
            }
          }
        }
      );
    } else {
      Alert.alert('Message', 'Delete this message?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await sdk.removeMessage({ id: msg.id! });
            } catch (e) {
              showError(e);
            }
          },
        },
      ]);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // React to message — emoji picker (simplified: predefined reactions)
  // ---------------------------------------------------------------------------
  const handleReact = useCallback((msg: LiveTalkMessageEntity) => {
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];
    // Check if user already reacted — show UNREACT option
    const myReaction = msg.reactions?.find((r) => r.reaction && emojis.includes(r.reaction));
    if (myReaction?.reaction) {
      Alert.alert('Reaction', `Remove "${myReaction.reaction}"?`, [
        {
          text: 'Remove',
          onPress: async () => {
            try {
              await sdk.actionOnMessage({ id: msg.id!, content: myReaction.reaction!, action: 'UNREACT' });
            } catch (err) {
              showError(err);
            }
          },
        },
        { text: 'Change', onPress: () => showReactPicker(msg) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      showReactPicker(msg);
    }
  }, []);

  function showReactPicker(msg: LiveTalkMessageEntity) {
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];
    Alert.alert('React', 'Choose a reaction', [
      ...emojis.map((e) => ({
        text: e,
        onPress: async () => {
          try {
            await sdk.actionOnMessage({ id: msg.id!, content: e, action: 'REACT' });
          } catch (err) {
            showError(err);
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  // ---------------------------------------------------------------------------
  // Force reconnect socket
  // ---------------------------------------------------------------------------
  async function handleReconnect() {
    try {
      await sdk.forceReconnectSocket();
    } catch (e) {
      showError(e);
    }
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------
  async function handleLogout() {
    try {
      await sdk.logout(uuid);
      sdk.disconnect();
      onLogout();
    } catch (e) {
      showError(e);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerName} numberOfLines={1}>{titleText}</Text>
          <View style={[styles.onlineDot, isAdminOnline ? styles.dotOnline : styles.dotOffline]} />
        </View>
        <TouchableOpacity onPress={handleReconnect} style={styles.reconnectBtn}>
          <Text style={styles.logoutText}>↻</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Message list — inverted (newest at bottom) */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, i) => item.id ?? String(i)}
          renderItem={({ item }) => (
            <MessageItem
              message={item}
              fileBaseUrl={sdk.fileUrl}
              onLongPress={handleLongPress}
              onReact={handleReact}
              onReply={(msg) => setReplyMessage(msg)}
            />
          )}
          inverted
          contentContainerStyle={styles.messageList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color="#00897B" style={styles.loader} /> : null
          }
        />

        {/* Typing indicator */}
        {isTyping && (
          <Text style={styles.typingIndicator}>Agent is typing...</Text>
        )}

        {/* Reply preview */}
        {replyMessage && (
          <View style={styles.replyPreview}>
            <View style={styles.replyBar} />
            <Text style={styles.replyText} numberOfLines={1}>
              {replyMessage.content ?? 'Media'}
            </Text>
            <TouchableOpacity onPress={() => setReplyMessage(null)}>
              <Text style={styles.replyClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline
            maxLength={2000}
          />
          <TouchableOpacity style={styles.iconBtn} onPress={handleAttach}>
            <Text style={styles.iconBtnText}>📎</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleSendSticker}>
            <Text style={styles.iconBtnText}>🖼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSendText}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function showError(e: unknown) {
  const msg = e instanceof LiveTalkError ? `[${e.errorKey}] ${e.message ?? ''}` : String(e);
  Alert.alert('Error', msg);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00897B',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 12,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerName: { fontSize: 17, fontWeight: '600', color: '#fff', flexShrink: 1 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  dotOnline: { backgroundColor: '#69F0AE' },
  dotOffline: { backgroundColor: '#EF9A9A' },
  reconnectBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },

  messageList: { paddingVertical: 8 },
  loader: { paddingVertical: 12 },

  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },

  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
  },
  replyBar: { width: 3, height: '100%', backgroundColor: '#00897B', marginRight: 8, borderRadius: 2 },
  replyText: { flex: 1, fontSize: 13, color: '#555' },
  replyClose: { fontSize: 16, color: '#888', paddingHorizontal: 8 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 15,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  iconBtnText: { fontSize: 20 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00897B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendBtnDisabled: { backgroundColor: '#B2DFDB' },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
