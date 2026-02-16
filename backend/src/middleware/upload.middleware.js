const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Crée un dossier uploads/ à la racine du backend
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

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

// Middleware for multiple image uploads - simple and flexible
// Accepts files with ANY field name or even without field names
exports.uploadImages = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // Log uploaded files for debugging
    if (req.files && req.files.length > 0) {
      console.log(`📸 Received ${req.files.length} file(s):`, req.files.map(f => `${f.fieldname || 'file'}: ${f.originalname}`));
      
      // If files don't have field names, assign default ones
      req.files = req.files.map((file, index) => ({
        ...file,
        fieldname: file.fieldname || `image${index + 1}`
      }));
    }
    
    next();
  });
};

// Middleware for single image upload
exports.uploadSingleImage = upload.single('image');
