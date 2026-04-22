const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '';
    const safe = `identity-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safe);
  },
});

const fileFilter = (_req, file, cb) => {
  const name = (file.originalname || '').toLowerCase();
  const ok = /\.(pdf|jpe?g|png|webp)$/i.test(name);
  cb(null, ok);
};

/** Champs attendus : cinRecto, cinVerso, passport, agencyRegistration (max 1 fichier chacun) */
exports.uploadIdentityDocs = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter,
}).fields([
  { name: 'cinRecto', maxCount: 1 },
  { name: 'cinVerso', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'agencyRegistration', maxCount: 1 },
]);

exports.optionalIdentityUpload = (req, res, next) => {
  const ct = String(req.headers['content-type'] || '');
  if (ct.includes('multipart/form-data')) {
    return exports.uploadIdentityDocs(req, res, next);
  }
  return next();
};
