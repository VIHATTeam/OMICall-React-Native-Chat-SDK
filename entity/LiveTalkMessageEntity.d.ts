export interface Multimedias {
    name?: string;
    url?: string;
    contentType?: string;
    size?: number;
}
export interface Reactions {
    reaction?: string;
}
export interface OtherInfo {
    fullName?: string;
    mail?: string;
    phoneNumber?: string;
}
export interface GuestInfo {
    phone?: string;
    fullName?: string;
    email?: string;
    contactId?: string;
    newContact?: boolean;
    uuid?: string;
    domain?: string;
    browser?: string;
    ip?: string;
    address?: string;
    lat?: string;
    lon?: string;
    otherInfo?: OtherInfo;
}
export interface LiveTalkMessageEntity {
    createdDate?: number;
    lastUpdatedDate?: number;
    id?: string;
    tenantId?: string;
    isDeleted?: boolean;
    roomId?: string;
    memberType?: string;
    type?: string;
    action?: string;
    content?: string;
    kind?: string;
    receivingGroupId?: string;
    uuid?: string;
    guestInfo?: GuestInfo;
    multimedias?: Multimedias[];
    reactions?: Reactions[];
    quoteMessage?: LiveTalkMessageEntity;
}
export declare function parseLiveTalkMessage(json: Record<string, unknown>): LiveTalkMessageEntity;
