import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
        cb(null, `session-video-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
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
    }
    else {
        cb(new Error('يرجى رفع ملف فيديو صالح (MP4, WebM, MOV, إلخ)'));
    }
};
export const uploadVideo = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max
    },
    fileFilter,
});
//# sourceMappingURL=upload.middleware.js.map