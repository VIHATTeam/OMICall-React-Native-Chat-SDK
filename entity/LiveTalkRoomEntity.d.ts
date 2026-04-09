import { GuestInfo, LiveTalkMessageEntity } from './LiveTalkMessageEntity';
export interface Members {
    contactId?: string;
    agentId?: string;
    fullName?: string;
    avatar?: string;
    gender?: string;
    status?: string;
    sipUser?: string;
}
export interface CreateBy {
    id?: string;
    name?: string;
    contactId?: string;
    avatarUrl?: string;
}
export interface LiveTalkRoomEntity {
    createdDate?: number;
    lastUpdatedDate?: number;
    id?: string;
    createBy?: CreateBy;
    tenantId?: string;
    isDeleted?: boolean;
    guestInfo?: GuestInfo;
    lastMessage?: LiveTalkMessageEntity;
    status?: string;
    uuid?: string;
    name?: string;
    nameUnsigned?: string;
    members?: Members[];
    totalUnread?: number;
    hasMember?: boolean;
    version?: number;
    changeReceivingAt?: number;
    changeReceivingTimeout?: number;
    waitingTime?: number;
    receivingGroupMembers?: string[];
    autoExpired?: boolean;
}
export declare function parseLiveTalkRoom(json: Record<string, unknown>): LiveTalkRoomEntity;
