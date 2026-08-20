import multer from 'multer';

// استخدام الذاكرة المؤقتة (Memory Storage) المناسبة لسيرفرات Vercel والرفع المباشر لـ Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('يرجى رفع ملف فيديو صالح (MP4, WebM, MOV, إلخ)'));
  }
};

export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter,
});
