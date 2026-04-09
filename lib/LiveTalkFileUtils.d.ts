type FileSizeProvider = (filePath: string) => Promise<number>;
export declare function setFileSizeProvider(provider: FileSizeProvider): void;
export declare function getFileSizeMB(paths: string[]): Promise<number>;
export {};
