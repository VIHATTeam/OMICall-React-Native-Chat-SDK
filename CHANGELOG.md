# Changelog

## [1.0.3] - 2026-04-09

### Fixed
- Socket `message` event now runs through `parseLiveTalkMessage` — real-time messages had missing `memberType`/`content` (camelCase fields) causing all incoming bubbles to render on the wrong side
- Message `content` is now URI-decoded at parse time via `parseLiveTalkMessage` (both history and real-time)
- HTTP `_post` now explicitly sets `Content-Type: application/json` header on every request
- Error responses from API now include response body in error message for easier debugging

### Added
- `react-native-image-picker` integration in example: attach button opens Photo Library / Camera action sheet (mirrors Flutter `image_picker` UX)
- iOS permissions in `Info.plist`: `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`
- Android permissions in `AndroidManifest.xml`: `CAMERA`, `READ_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`
- `postinstall` script in example to auto-remove nested `react-native`/`react` from linked SDK package after every install
- Metro `blockList` now covers both SDK root `node_modules/` and nested `node_modules/omicall-chat-sdk/node_modules/`
- Debug label in `MessageItem` showing raw `memberType` value

### Changed
- `LiveTalkEventEntity.data` type widened from `Record<string, unknown>` to `any` to allow typed entity objects (e.g. `LiveTalkMessageEntity`) as event payloads
- Removed `uuid` package dependency — UUID v4 now generated with inline `Math.random()` implementation (no native module required)
- Removed `react-native-get-random-values` polyfill (was only needed for `uuid` package)

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
