export declare class LiveTalkSendingMessage {
    readonly message?: string;
    readonly quoteId?: string;
    readonly paths?: string[];
    readonly sticker?: string;
    private constructor();
    static createTextMessage(params: {
        message: string;
        quoteId?: string;
    }): LiveTalkSendingMessage;
    static createSticker(params: {
        sticker: string;
    }): LiveTalkSendingMessage;
    static createFiles(params: {
        paths: string[];
    }): LiveTalkSendingMessage;
}
