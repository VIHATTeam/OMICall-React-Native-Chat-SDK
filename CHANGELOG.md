# Changelog

## [1.0.0] - 2026-04-09

### Added
- Initial release — port from Flutter `livetalk_sdk` v1.0.1
- `LiveTalkSdk` singleton with createRoom, sendMessage, actionOnMessage, removeMessage, getMessageHistory, getCurrentRoom, logout, disconnect, forceReconnectSocket
- `LiveTalkApi` HTTP layer using axios (REST + multipart file upload with progress)
- `LiveTalkSocketManager` WebSocket layer using socket.io-client v4
- Listener-based event subscription (addEventListener / removeListener) — returns unsubscribe function
- Upload progress listener (addUploadProgressListener)
- All entity types: LiveTalkMessageEntity, LiveTalkRoomEntity, LiveTalkSendingMessage, LiveTalkGeoEntity, LiveTalkEventEntity, LiveTalkError
- Full LiveTalkErrorCodes constant set (matches Flutter SDK)
- String utils: encodeMessage/decodeMessage using encodeURIComponent (matches Flutter Uri.encodeComponent)
- File utils: getFileSizeMB with optional RNFS provider injection via setFileSizeProvider
- Fixed: remove_message socket event (Flutter SDK emitted member_connect by mistake)
- Improved: all socket event handlers have try-catch (Flutter SDK had none)
