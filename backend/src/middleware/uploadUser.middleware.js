const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

function createStorage(prefix) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsRoot),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '') || '';
      cb(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
}

function createFilter(allowPdf) {
  return (_req, file, cb) => {
    const name = (file.originalname || '').toLowerCase();
    const mime = String(file.mimetype || '').toLowerCase();
    const imageOk = mime.startsWith('image/');
    const pdfOk = allowPdf && /\.pdf$/i.test(name) && mime === 'application/pdf';

    if (imageOk || pdfOk) {
      cb(null, true);
      return;
    }

    cb(new Error('Invalid file type. Please upload an image (JPG, PNG, WEBP, AVIF, HEIC) or PDF.'));
  };
}

const registrationUpload = multer({
  storage: createStorage('user-upload'),
  fileFilter: createFilter(true),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cinRecto', maxCount: 1 },
  { name: 'cinVerso', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'agencyRegistration', maxCount: 1 },
]);

const avatarUpload = multer({
  storage: createStorage('avatar'),
  fileFilter: createFilter(false),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single('avatar');

function optionalRegistrationUpload(req, res, next) {
  const contentType = String(req.headers['content-type'] || '');
  if (contentType.includes('multipart/form-data')) {
    return registrationUpload(req, res, next);
  }
  return next();
}

function optionalAvatarUpload(req, res, next) {
  const contentType = String(req.headers['content-type'] || '');
  if (contentType.includes('multipart/form-data')) {
    return avatarUpload(req, res, next);
  }
  return next();
}

module.exports = {
  optionalRegistrationUpload,
  optionalAvatarUpload,
};