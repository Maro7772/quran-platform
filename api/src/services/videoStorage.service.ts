import { v2 as cloudinary } from 'cloudinary';

// إعداد خدمة Cloudinary لرفع وتشغيل الفيديوهات السحابية بجودة عالية وسرعة فائقة
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface NormalizedVideo {
  type: 'direct' | 'youtube' | 'vimeo' | 'drive' | 'iframe';
  embedUrl: string;
  originalUrl: string;
}

/**
 * رفع ملف فيديو مباشرة إلى Cloudinary
 */
export const uploadVideoToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<{ secure_url: string; public_id: string; duration?: number }> => {
  return new Promise((resolve, reject) => {
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'quran-platform/recordings',
        public_id: `quran_session_${Date.now()}_${cleanName}`,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('فشل الرفع إلى Cloudinary'));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          duration: result.duration,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * معالجة وتحليل جميع أنواع روابط الفيديوهات (Cloudinary, YouTube, Drive, Vimeo, Direct MP4)
 */
export const normalizeVideoUrl = (rawUrl: string): NormalizedVideo => {
  if (!rawUrl) {
    return {
      type: 'direct',
      embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      originalUrl: '',
    };
  }

  const trimmed = rawUrl.trim();

  // 1. YouTube URLs (standard, youtu.be, shorts, embed)
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      originalUrl: trimmed,
    };
  }

  // 2. Vimeo URLs
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0`,
      originalUrl: trimmed,
    };
  }

  // 3. Google Drive URLs
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (fileIdMatch && fileIdMatch[1]) {
      return {
        type: 'drive',
        embedUrl: `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`,
        originalUrl: trimmed,
      };
    }
  }

  // 4. Local Uploads or direct server uploads
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const baseUrl = process.env.API_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://quran-platform-api.vercel.app');
    const fullUrl = `${baseUrl}${cleanPath}`;
    return {
      type: 'direct',
      embedUrl: fullUrl,
      originalUrl: fullUrl,
    };
  }

  // 5. Cloudinary & Direct MP4 / WebM / Media
  if (
    trimmed.includes('cloudinary.com') ||
    trimmed.endsWith('.mp4') ||
    trimmed.endsWith('.webm') ||
    trimmed.endsWith('.mkv') ||
    trimmed.endsWith('.mov') ||
    trimmed.includes('.mp4?') ||
    trimmed.includes('.webm?')
  ) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // 6. Generic web URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // 7. Fallback
  return {
    type: 'direct',
    embedUrl: trimmed,
    originalUrl: trimmed,
  };
};

export const generateSecurePlaybackUrl = async (
  storageKey: string,
  _expiresInHours: number = 2
): Promise<{ url: string; embedUrl: string; type: string }> => {
  const normalized = normalizeVideoUrl(storageKey);
  return {
    url: normalized.originalUrl,
    embedUrl: normalized.embedUrl,
    type: normalized.type,
  };
};
