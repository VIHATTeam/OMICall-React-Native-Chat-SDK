import { UploadProgressEvent } from './LiveTalkApi';
import { LiveTalkEventEntity } from './entity/LiveTalkEventEntity';
import { LiveTalkMessageEntity } from './entity/LiveTalkMessageEntity';
import { LiveTalkRoomEntity } from './entity/LiveTalkRoomEntity';
import { LiveTalkSendingMessage } from './entity/LiveTalkSendingMessage';
type EventListener = (event: LiveTalkEventEntity) => void;
type UploadListener = (event: UploadProgressEvent) => void;
export interface CreateRoomParams {
    phone: string;
    fullName: string;
    uuid: string;
    domain?: string;
    autoExpired?: boolean;
    fcm?: string;
    projectId?: string;
}
export declare class LiveTalkSdk {
    private static _instance?;
    static get shareInstance(): LiveTalkSdk;
    readonly fileUrl = "https://cdn.omicrm.com/crm/";
    private readonly _domainPbx;
    private _spamThrottleActive;
    constructor(params: {
        domainPbx: string;
    });
    addEventListener(listener: EventListener): () => void;
    removeEventListener(listener: EventListener): void;
    addUploadProgressListener(listener: UploadListener): () => void;
    createRoom(params: CreateRoomParams): Promise<string | undefined>;
    getCurrentRoom(): Promise<LiveTalkRoomEntity | undefined>;
    sendMessage(message: LiveTalkSendingMessage): Promise<Record<string, unknown> | undefined>;
    actionOnMessage(params: {
        id: string;
        content: string;
        action: string;
    }): Promise<boolean>;
    removeMessage(params: {
        id: string;
    }): Promise<boolean>;
    getMessageHistory(page: number, size?: number): Promise<LiveTalkMessageEntity[]>;
    logout(uuid: string): Promise<boolean>;
    disconnect(): void;
    forceReconnectSocket(): Promise<void>;
}
export {};
