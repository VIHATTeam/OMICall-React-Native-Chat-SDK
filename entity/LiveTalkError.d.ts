export declare class LiveTalkError extends Error {
    readonly statusCode: number;
    readonly errorKey: string;
    readonly payload?: Record<string, unknown>;
    constructor(params: {
        statusCode: number;
        errorKey: string;
        payload?: Record<string, unknown>;
    });
}
