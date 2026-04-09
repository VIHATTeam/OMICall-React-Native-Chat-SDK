/**
 * MessageItem — renders a single chat message bubble
 * Supports: text, sticker, media/file, system messages
 * Supports: reactions, reply/quote, long-press actions
 */
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { LiveTalkMessageEntity } from 'omicall-chat-sdk';

interface Props {
  message: LiveTalkMessageEntity;
  fileBaseUrl: string;
  onLongPress?: (message: LiveTalkMessageEntity) => void;
  onReact?: (message: LiveTalkMessageEntity) => void;
  onReply?: (message: LiveTalkMessageEntity) => void;
}

export default function MessageItem({
  message,
  fileBaseUrl,
  onLongPress,
  onReact,
  onReply,
}: Props) {
  const isGuest = message.memberType === 'guest';
  const isSystem = message.memberType === 'system';

  if (isSystem) {
    return <SystemMessage message={message} />;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={isGuest ? () => onLongPress?.(message) : undefined}
      style={[styles.row, isGuest ? styles.rowRight : styles.rowLeft]}
    >
      {/* Action buttons — left side for guest, right side for agent */}
      {isGuest && (
        <ActionButtons
          onReact={() => onReact?.(message)}
          onReply={() => onReply?.(message)}
        />
      )}

      <View style={styles.bubbleWrapper}>
        {/* Quote/reply preview */}
        {message.quoteMessage && (
          <QuotePreview quote={message.quoteMessage} isGuest={isGuest} />
        )}

        {/* Message content */}
        {message.type === 'sticker' ? (
          <StickerBubble message={message} fileBaseUrl={fileBaseUrl} />
        ) : message.multimedias && message.multimedias.length > 0 ? (
          <MediaBubble message={message} fileBaseUrl={fileBaseUrl} isGuest={isGuest} />
        ) : (
          <TextBubble message={message} isGuest={isGuest} />
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <ReactionBar reactions={message.reactions} />
        )}
      </View>

      {!isGuest && (
        <ActionButtons
          onReact={() => onReact?.(message)}
          onReply={() => onReply?.(message)}
        />
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TextBubble({
  message,
  isGuest,
}: {
  message: LiveTalkMessageEntity;
  isGuest: boolean;
}) {
  return (
    <View style={[styles.bubble, isGuest ? styles.bubbleGuest : styles.bubbleAgent]}>
      {/* DEBUG: remove memberType label after verifying left/right alignment */}
      <Text style={[styles.debugLabel, isGuest && styles.debugLabelGuest]}>
        [{message.memberType ?? '?'}]
      </Text>
      <Text style={[styles.bubbleText, isGuest && styles.bubbleTextGuest]}>
        {message.content ?? ''}
      </Text>
      <Text style={[styles.timestamp, isGuest && styles.timestampGuest]}>
        {formatTime(message.createdDate)}
      </Text>
    </View>
  );
}

function StickerBubble({
  message,
  fileBaseUrl,
}: {
  message: LiveTalkMessageEntity;
  fileBaseUrl: string;
}) {
  const url = message.multimedias?.[0]?.url ?? '';
  const fullUrl = url.startsWith('http') ? url : `${fileBaseUrl}${url}`;
  return (
    <Image source={{ uri: fullUrl }} style={styles.sticker} resizeMode="contain" />
  );
}

function MediaBubble({
  message,
  fileBaseUrl,
  isGuest,
}: {
  message: LiveTalkMessageEntity;
  fileBaseUrl: string;
  isGuest: boolean;
}) {
  return (
    <View style={styles.mediaContainer}>
      {message.multimedias!.map((item, i) => {
        const url = item.url ?? '';
        const fullUrl = url.startsWith('http') ? url : `${fileBaseUrl}${url}`;
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

        if (isImage) {
          return (
            <Image
              key={i}
              source={{ uri: fullUrl }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          );
        }

        return (
          <View
            key={i}
            style={[styles.fileBubble, isGuest ? styles.bubbleGuest : styles.bubbleAgent]}
          >
            <Text style={styles.fileIcon}>📎</Text>
            <Text
              style={[styles.fileName, isGuest && styles.bubbleTextGuest]}
              numberOfLines={1}
            >
              {item.name ?? 'File'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function QuotePreview({
  quote,
  isGuest,
}: {
  quote: LiveTalkMessageEntity;
  isGuest: boolean;
}) {
  return (
    <View style={[styles.quote, isGuest ? styles.quoteGuest : styles.quoteAgent]}>
      <View style={[styles.quoteBar, isGuest ? styles.quoteBarGuest : styles.quoteBarAgent]} />
      <Text style={[styles.quoteText, isGuest && styles.quoteTextGuest]} numberOfLines={2}>
        {quote.content ?? ''}
      </Text>
    </View>
  );
}

function ReactionBar({ reactions }: { reactions: Array<{ reaction?: string }> }) {
  const visible = reactions.slice(0, 5);
  return (
    <View style={styles.reactionBar}>
      {visible.map((r, i) => (
        <Text key={i} style={styles.reactionEmoji}>
          {r.reaction ?? ''}
        </Text>
      ))}
    </View>
  );
}

function ActionButtons({
  onReact,
  onReply,
}: {
  onReact: () => void;
  onReply: () => void;
}) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity onPress={onReply} style={styles.actionBtn}>
        <Text style={styles.actionIcon}>↩</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onReact} style={styles.actionBtn}>
        <Text style={styles.actionIcon}>☺</Text>
      </TouchableOpacity>
    </View>
  );
}

function SystemMessage({ message }: { message: LiveTalkMessageEntity }) {
  if (message.action === 'create_room') {
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemTime}>
          {formatTime(message.lastUpdatedDate)} — Room created
        </Text>
        <Text style={styles.systemUser}>
          {message.guestInfo?.fullName ?? ''} | {message.guestInfo?.phone ?? ''}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.systemContainer}>
      <Text style={styles.systemText}>{message.content ?? ''}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(ts?: number): string {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4, paddingHorizontal: 8 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },

  bubbleWrapper: { maxWidth: '72%' },

  bubble: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleAgent: { backgroundColor: '#F0F0F0' },
  bubbleGuest: { backgroundColor: '#00897B' },
  bubbleText: { fontSize: 15, color: '#1C1C1E' },
  bubbleTextGuest: { color: '#fff' },

  timestamp: { fontSize: 10, color: '#999', marginTop: 3, alignSelf: 'flex-end' },
  timestampGuest: { color: 'rgba(255,255,255,0.7)' },

  sticker: { width: 120, height: 120 },

  mediaContainer: { gap: 4 },
  mediaImage: { width: 200, height: 150, borderRadius: 12 },
  fileBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 220,
  },
  fileIcon: { fontSize: 18, marginRight: 8 },
  fileName: { flex: 1, fontSize: 13, color: '#333', textDecorationLine: 'underline' },

  quote: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
    maxWidth: 220,
  },
  quoteAgent: { backgroundColor: '#E8E8E8' },
  quoteGuest: { backgroundColor: 'rgba(255,255,255,0.25)' },
  quoteBar: { width: 3, marginRight: 6 },
  quoteBarAgent: { backgroundColor: '#00897B' },
  quoteBarGuest: { backgroundColor: '#fff' },
  quoteText: { flex: 1, fontSize: 12, color: '#555', padding: 6 },
  quoteTextGuest: { color: 'rgba(255,255,255,0.9)' },

  reactionBar: { flexDirection: 'row', marginTop: 4, flexWrap: 'wrap' },
  reactionEmoji: { fontSize: 14, marginRight: 2 },

  actions: { flexDirection: 'column', justifyContent: 'flex-end', marginHorizontal: 4 },
  actionBtn: { padding: 4 },
  actionIcon: { fontSize: 18, color: '#aaa' },

  systemContainer: { alignItems: 'center', marginVertical: 8, paddingHorizontal: 16 },
  systemText: { fontSize: 12, color: '#aaa', fontStyle: 'italic', textAlign: 'center' },
  systemTime: { fontSize: 11, color: '#aaa' },
  systemUser: { fontSize: 12, color: '#00897B', marginTop: 2 },

  debugLabel: { fontSize: 9, color: '#999', marginBottom: 2 },
  debugLabelGuest: { color: 'rgba(255,255,255,0.6)' },
});
