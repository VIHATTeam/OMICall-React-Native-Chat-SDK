import { LiveTalkError } from './entity/LiveTalkError';
import { LiveTalkGeoEntity } from './entity/LiveTalkGeoEntity';
import { LiveTalkMessageEntity } from './entity/LiveTalkMessageEntity';
import { LiveTalkRoomEntity } from './entity/LiveTalkRoomEntity';
import { LiveTalkSendingMessage } from './entity/LiveTalkSendingMessage';
export interface UploadProgressEvent {
    taskId: string;
    status: 2 | 3 | 4;
    progress?: number;
    errorKey?: string;
    message?: string;
}
export interface SdkInfo {
    tenantId: string;
    accessToken: string;
    refreshToken: string;
    roomId?: string;
    uuid?: string;
}
type UploadProgressListener = (event: UploadProgressEvent) => void;
export declare class LiveTalkApi {
    private static _instance;
    static get instance(): LiveTalkApi;
    private _sdkInfo?;
    private readonly _axios;
    private readonly _uploadListeners;
    private constructor();
    get sdkInfo(): SdkInfo | undefined;
    private get _base();
    private get _newUuid();
    addUploadProgressListener(listener: UploadProgressListener): () => void;
    private _emitUpload;
    static httpError(statusCode: number, reasonPhrase?: string): LiveTalkError;
    static apiBodyError(jsonData: Record<string, unknown>): LiveTalkError;
    static clientError(errorKey: string, detail?: string): LiveTalkError;
    private _post;
    private _get;
    private get _authHeader();
    private _checkSdkInfo;
    private _checkApiBody;
    getConfig(domainPbx: string): Promise<SdkInfo | undefined>;
    createRoom(body: Record<string, unknown>): Promise<string | undefined>;
    getCurrentRoom(): Promise<LiveTalkRoomEntity | undefined>;
    sendMessage(message: LiveTalkSendingMessage): Promise<Record<string, unknown> | undefined>;
    private _sendText;
    private _sendSticker;
    private _sendFiles;
    actionOnMessage(params: {
        content: string;
        id: string;
        action: string;
    }): Promise<boolean>;
    getMessageHistory(page: number, size?: number): Promise<LiveTalkMessageEntity[]>;
    removeMessage(id: string): Promise<boolean>;
    getGeo(): Promise<LiveTalkGeoEntity | undefined>;
    logout(params: {
        appId: string;
        deviceId: string;
        uuid: string;
    }): Promise<boolean>;
}
export {};
