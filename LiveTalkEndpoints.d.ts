export declare const LiveTalkEndpoints: {
    readonly baseUrl: "https://livetalk-v2-stg.omicrm.com/widget";
    readonly socketUrl: "https://socket-event-v1-stg.omicrm.com";
    readonly config: "/config/get_v2";
    readonly createRoom: "/new_room_v2";
    readonly getCurrentRoom: "/guest/room_v2";
    readonly sendMessage: "/message/guest_send_message_v2";
    readonly sendSticker: "/message/sticker/guest_send_v2";
    readonly sendMedia: "/message/guest_send_media_v2";
    readonly messageHistory: "/message/search_for_guest_v2";
    readonly removeMessage: "/guest/message/remove_v2";
    readonly actionOnMessage: "/guest/message/sender_action_v2";
    readonly logout: "/guest/device_info/remove_v2";
    readonly geo: "/geo_v2";
};
