import { LiveTalkEventEntity } from './entity/LiveTalkEventEntity';
type EventListener = (event: LiveTalkEventEntity) => void;
export declare class LiveTalkSocketManager {
    private static _instance;
    static get shareInstance(): LiveTalkSocketManager;
    private _socket?;
    private readonly _listeners;
    private constructor();
    addListener(listener: EventListener): () => void;
    removeListener(listener: EventListener): void;
    private _emit;
    startListenWebSocket(token: string, roomId: string, tenantId: string): void;
    disconnect(): void;
    get isConnected(): boolean;
}
export {};
