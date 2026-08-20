export interface NormalizedVideo {
  type: 'direct' | 'youtube' | 'vimeo' | 'drive' | 'iframe';
  embedUrl: string;
  originalUrl: string;
}

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
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fullUrl = `${baseUrl}${cleanPath}`;
    return {
      type: 'direct',
      embedUrl: fullUrl,
      originalUrl: fullUrl,
    };
  }

  // 5. Direct MP4 / WebM / Media
  if (
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

  // 7. Fallback to mock CDN path or sample video
  return {
    type: 'direct',
    embedUrl: trimmed,
    originalUrl: trimmed,
  };
};

export const generateSecurePlaybackUrl = async (
  storageKey: string,
  expiresInHours: number = 2
): Promise<{ url: string; embedUrl: string; type: string }> => {
  const normalized = normalizeVideoUrl(storageKey);
  return {
    url: normalized.originalUrl,
    embedUrl: normalized.embedUrl,
    type: normalized.type,
  };
};

