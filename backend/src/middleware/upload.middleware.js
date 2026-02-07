const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('../config/cloudinary');
const path = require('path');

// Temporairement désactivé : utilisation de stockage local au lieu de Cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Crée un dossier uploads/ à la racine du backend
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

// Configure Cloudinary storage (temporairement désactivé)
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'smartproperty/properties',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
//     transformation: [
//       { width: 1920, height: 1080, crop: 'limit' },
//       { quality: 'auto:good' },
//     ],
//   },
// });

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|heic/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, heic)'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 20, // Max 20 images per property
  },
});

// Middleware for multiple image uploads
exports.uploadImages = upload.array('images', 20);

// Middleware for single image upload
exports.uploadSingleImage = upload.single('image');
