export interface NormalizedVideo {
    type: 'direct' | 'youtube' | 'vimeo' | 'drive' | 'iframe';
    embedUrl: string;
    originalUrl: string;
}
export declare const normalizeVideoUrl: (rawUrl: string) => NormalizedVideo;
export declare const generateSecurePlaybackUrl: (storageKey: string, expiresInHours?: number) => Promise<{
    url: string;
    embedUrl: string;
    type: string;
}>;
//# sourceMappingURL=videoStorage.service.d.ts.map