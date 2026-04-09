# omicall-chat-sdk

React Native SDK for integrating [Omicall](https://omicall.com) chat into mobile applications.

> **⚠️ Channel Support Notice**
> This SDK currently **only supports the LiveTalk channel**.
> Other Omicall channels (Zalo, Facebook, Telegram, etc.) are **not supported** in this version.
> Support for additional channels will be added in future releases.

---

## Requirements

| Platform     | Minimum version |
|-------------|----------------|
| React Native | 0.73.0         |
| React        | 18.0.0         |
| iOS          | 12.0           |
| Android      | API 23 (6.0)   |

---

## Installation

```bash
npm install omicall-chat-sdk
# or
yarn add omicall-chat-sdk
```

### Peer dependencies

```bash
npm install react-native-device-info axios socket.io-client uuid
```

### iOS

```bash
cd ios && pod install
```

---

## Quick Start

### 1. Initialize SDK

Call once at app startup before `AppRegistry.registerComponent`:

```ts
import { LiveTalkSdk } from 'omicall-chat-sdk';

// domainPbx is the realm/domain provided by Omicall (same as omikit plugin)
new LiveTalkSdk({ domainPbx: 'your_domain' });
```

### 2. Create a Chat Room

```ts
import { LiveTalkSdk, LiveTalkError } from 'omicall-chat-sdk';

try {
  const roomId = await LiveTalkSdk.shareInstance.createRoom({
    phone:    '0123456789',   // guest phone number
    fullName: 'Nguyen Van A', // guest display name
    uuid:     '0123456789',   // unique ID — reuse to resume the same room
    domain:   'default',      // optional, defaults to 'default'
  });

  if (roomId) {
    // navigate to chat screen
  }
} catch (e) {
  if (e instanceof LiveTalkError) {
    console.log(e.errorKey);   // i18n key
    console.log(e.statusCode); // HTTP code or -1
  }
}
```

> Same `uuid` → resumes existing room. Different `uuid` → creates new room.

### 3. Listen for Real-Time Events

```ts
import { LiveTalkSdk } from 'omicall-chat-sdk';

useEffect(() => {
  const unsubscribe = LiveTalkSdk.shareInstance.addEventListener((event) => {
    switch (event.eventName) {
      case 'message':
        // event.data — new message payload
        break;
      case 'someone_typing':
        // event.data?.isTyping — boolean
        break;
      case 'member_join':
        // agent joined — refresh room via getCurrentRoom()
        break;
      case 'member_connect':
        // agent came online
        break;
      case 'member_disconnect':
        // agent went offline
        break;
      case 'lt_reaction':
        // event.data?.msg_id, event.data?.reactions
        break;
      case 'remove_message':
        // event.data?.message_id
        break;
      case 'socket_connected':
      case 'socket_disconnect':
      case 'socket_connect_error':
        break;
    }
  });

  return unsubscribe; // clean up on unmount
}, []);
```

### 4. Send a Text Message

```ts
import { LiveTalkSdk, LiveTalkSendingMessage } from 'omicall-chat-sdk';

const msg = LiveTalkSendingMessage.createTextMessage({
  message: 'Hello!',
  quoteId: replyMessageId, // optional
});

await LiveTalkSdk.shareInstance.sendMessage(msg);
```

### 5. Send a Sticker

```ts
const msg = LiveTalkSendingMessage.createSticker({
  sticker: 'https://example.com/sticker.png',
});

await LiveTalkSdk.shareInstance.sendMessage(msg);
```

### 6. Send Files / Media

```ts
const msg = LiveTalkSendingMessage.createFiles({
  paths: ['/path/to/file1.jpg', '/path/to/file2.pdf'],
});

const result = await LiveTalkSdk.shareInstance.sendMessage(msg);
const taskId = result?.task_id; // track upload progress with this
```

**Limits:** max 6 files, total ≤ 50 MB.

### 7. Track Upload Progress

```ts
useEffect(() => {
  const unsubscribe = LiveTalkSdk.shareInstance.addUploadProgressListener((event) => {
    switch (event.status) {
      case 2: // uploading
        console.log(`${event.taskId} — ${((event.progress ?? 0) * 100).toFixed(0)}%`);
        break;
      case 3: // completed
        console.log(`${event.taskId} — done`);
        break;
      case 4: // error
        console.log(`${event.taskId} — failed: ${event.errorKey}`);
        break;
    }
  });

  return unsubscribe;
}, []);
```

### 8. Get Room Info

```ts
const room = await LiveTalkSdk.shareInstance.getCurrentRoom();

// room.id           — room ID
// room.status       — 'active' | ...
// room.hasMember    — true: agent present, false: waiting for agent
// room.members      — list of agents (fullName, avatar, status, sipUser)
// room.lastMessage  — last message summary
// room.guestInfo    — guest (SDK user) information
```

### 9. Get Message History

```ts
const messages = await LiveTalkSdk.shareInstance.getMessageHistory(
  0,  // zero-based page index
  15, // items per page (default 15)
);

// Each LiveTalkMessageEntity:
// .id           — message ID
// .content      — text content
// .type         — 'message' | 'activity' | 'sticker' | 'media'
// .memberType   — 'guest' | 'agent' | 'system'
// .multimedias  — attached files (name, url, contentType, size)
// .reactions    — list of reactions
// .quoteMessage — quoted/replied message
// .createdDate  — Unix timestamp (ms)
```

### 10. React / Unreact to a Message

```ts
await LiveTalkSdk.shareInstance.actionOnMessage({
  id:      messageId,
  content: '👍',
  action:  'REACT', // or 'UNREACT'
});
```

### 11. Remove a Message

```ts
await LiveTalkSdk.shareInstance.removeMessage({ id: messageId });
```

### 12. Logout

```ts
await LiveTalkSdk.shareInstance.logout(uuid);
```

### 13. Disconnect Socket

```ts
LiveTalkSdk.shareInstance.disconnect();
```

### 14. Force Reconnect Socket

```ts
await LiveTalkSdk.shareInstance.forceReconnectSocket();
```

### 15. Optional: Inject File Size Provider

For accurate file size validation before upload (requires `react-native-fs`):

```ts
import RNFS from 'react-native-fs';
import { setFileSizeProvider } from 'omicall-chat-sdk';

// Call once at app startup
setFileSizeProvider(async (path) => (await RNFS.stat(path)).size);
```

---

## Architecture

```
Your App
   │
   ▼
LiveTalkSdk (singleton — LiveTalkSdk.shareInstance)
   │
   ├── LiveTalkApi (singleton)             — REST via axios
   │     ├── POST /config/get_v2/{domain}  — fetch tenantId + token
   │     ├── POST /new_room_v2             — create/resume room
   │     ├── GET  /guest/room_v2/{id}      — get room info
   │     ├── POST /message/guest_send_message_v2
   │     ├── POST /message/sticker/guest_send_v2
   │     ├── POST /message/guest_send_media_v2   (multipart)
   │     ├── POST /message/search_for_guest_v2   (history)
   │     ├── POST /guest/message/remove_v2
   │     ├── POST /guest/message/sender_action_v2
   │     └── POST /guest/device_info/remove_v2   (logout)
   │
   └── LiveTalkSocketManager (singleton)   — WebSocket via socket.io-client v4
         └── wss://socket-event-v1-stg.omicrm.com/{tenantId}
               Events: message, lt_reaction, member_join,
                       member_connect, member_disconnect,
                       someone_typing, remove_message,
                       socket_connected, socket_disconnect,
                       socket_connect_error
```

**Startup flow:**
```
new LiveTalkSdk({ domainPbx })
  └─▶ LiveTalkApi.getConfig(domainPbx)    ← tenantId + access_token

createRoom({ phone, fullName, uuid })
  └─▶ LiveTalkApi.createRoom()            ← POST /new_room_v2 → roomId
        └─▶ LiveTalkSocketManager.startListenWebSocket(token, roomId, tenantId)
```

---

## Error Handling

All SDK methods throw `LiveTalkError` on failure.

```ts
import { LiveTalkError, LiveTalkErrorCodes } from 'omicall-chat-sdk';

try {
  await LiveTalkSdk.shareInstance.createRoom({ ... });
} catch (e) {
  if (e instanceof LiveTalkError) {
    const key      = e.errorKey;    // LiveTalkErrorCodes constant
    const httpCode = e.statusCode;  // HTTP code, 0 (API body), or -1 (client)
    const raw      = e.payload;     // raw server response for debugging
  }
}
```

### Key error codes

| Constant | HTTP | Meaning |
|----------|------|---------|
| `emptyInfo` | -1 | SDK not initialized |
| `invalidPhone` | -1 | Invalid phone format |
| `spamRequest` | -1 | Message sent too fast (300ms throttle) |
| `emptyText` | -1 | Empty message content |
| `fileLimitExceeded` | -1 | More than 6 files |
| `fileSizeExceeded` | -1 | Total size > 50 MB |
| `sessionExpired` | 401 | Token expired |
| `tooManyRequests` | 429 | Rate limited |
| `system` | 500 | Server error |
| `api` | 0 | API returned status_code -9999 |

---

## Environment Configuration

```ts
import { LiveTalkEndpoints } from 'omicall-chat-sdk';

console.log(LiveTalkEndpoints.baseUrl);   // https://livetalk-v2-stg.omicrm.com/widget
console.log(LiveTalkEndpoints.socketUrl); // https://socket-event-v1-stg.omicrm.com
```

---

## Supported Channels

| Channel | Status |
|---------|--------|
| LiveTalk (web widget) | ✅ Supported |
| Zalo | ❌ Not supported |
| Facebook | ❌ Not supported |
| Telegram | ❌ Not supported |
| Other channels | ❌ Not supported |

---

## License

Copyright © 2024 VIHAT Solution. All rights reserved.
