export interface NormalizedVideo {
    type: 'direct' | 'youtube' | 'vimeo' | 'drive' | 'iframe';
    embedUrl: string;
    originalUrl: string;
}
/**
 * توليد توقيع أمني للرفع المباشر من المتصفح إلى Cloudinary بدون وسيط (Direct Signed Upload)
 */
export declare const getCloudinaryUploadSignature: (folder?: string) => {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
};
/**
 * رفع ملف فيديو مباشرة إلى Cloudinary
 */
export declare const uploadVideoToCloudinary: (fileBuffer: Buffer, fileName: string) => Promise<{
    secure_url: string;
    public_id: string;
    duration?: number;
}>;
/**
 * معالجة وتحليل جميع أنواع روابط الفيديوهات (Cloudinary, YouTube, Drive, Vimeo, Direct MP4)
 */
export declare const normalizeVideoUrl: (rawUrl: string) => NormalizedVideo;
export declare const generateSecurePlaybackUrl: (storageKey: string, _expiresInHours?: number) => Promise<{
    url: string;
    embedUrl: string;
    type: string;
}>;
//# sourceMappingURL=videoStorage.service.d.ts.map