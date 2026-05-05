const path = require('path');
const { User, IdentityVerificationStatus, IdentityDocumentKind } = require('../models/User');
const { Property } = require('../models/Property');
const { Sale, Lease } = require('../models');
const { apiResponse } = require('../utils/apiResponse');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const emailService = require('../services/email.service');

const ROLES_REQUIRING_IDENTITY = new Set(['OWNER', 'BUYER', 'TENANT', 'AGENCY']);

function getIdentityVerificationBlock(user) {
  if (!user || !ROLES_REQUIRING_IDENTITY.has(user.role)) return null;
  const st = user.identityVerificationStatus;
  if (st == null || st === IdentityVerificationStatus.APPROVED) return null;
  if (st === IdentityVerificationStatus.PENDING) {
    return {
      status: 403,
      body: {
        success: false,
        code: 'VERIFICATION_PENDING',
        message:
          'Your account is pending approval. An administrator will verify your documents shortly. You will be able to sign in once approved.',
      },
    };
  }
  if (st === IdentityVerificationStatus.REJECTED) {
    return {
      status: 403,
      body: {
        success: false,
        code: 'VERIFICATION_REJECTED',
        message: user.identityVerificationNote
          ? `Verification declined: ${user.identityVerificationNote}`
          : 'Your verification request was declined. Please contact support if you need help.',
      },
    };
  }
  return null;
}

function buildAuthUserPayload(user) {
  const verificationStatus = user.identityVerificationStatus || IdentityVerificationStatus.APPROVED;
  const canTransact =
    user.role === 'ADMIN' ||
    !ROLES_REQUIRING_IDENTITY.has(user.role) ||
    verificationStatus === IdentityVerificationStatus.APPROVED;

  return {
    id: user._id,
    login: user.login,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl || '',
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    identityVerificationStatus: verificationStatus,
    accessMode: canTransact ? 'FULL' : 'READ_ONLY',
    canTransact,
    walletNumber: user.walletNumber || null,
  };
}

function buildUploadedPath(file) {
  if (!file || !file.path) return '';
  return `/uploads/${path.basename(file.path)}`;
}

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Vérifier si le 2FA est activé
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        message: '2FA requis',
        require2FA: true,
        email: user.email
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: buildAuthUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark multi-step onboarding / listing form as completed for current user
exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.id || req.user.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.hasCompletedOnboarding) {
      user.hasCompletedOnboarding = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding status updated',
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Register a new user (multipart only — identity documents required for marketplace roles)
exports.register = async (req, res) => {
  try {
    const { login, email, password, firstName, lastName, phone, role } = req.body;

    if (!login || !email || !password) {
      return res.status(400).json({ message: 'Login, email, and password are required.' });
    }

    if (!role || !ROLES_REQUIRING_IDENTITY.has(role)) {
      return res.status(400).json({ message: 'A valid role is required (OWNER, BUYER, TENANT, or AGENCY).' });
    }

    const normalizedLogin = String(login).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check conflicts separately to return field-specific errors
    const [existingByLogin, existingByEmail] = await Promise.all([
      User.findOne({ login: normalizedLogin }).select('_id login'),
      User.findOne({ email: normalizedEmail }).select('_id email'),
    ]);

    if (existingByLogin || existingByEmail) {
      const fields = {};
      if (existingByLogin) fields.login = 'This username is already taken.';
      if (existingByEmail) fields.email = 'This email is already registered.';

      return res.status(409).json({
        message:
          existingByLogin && existingByEmail
            ? 'This username and email are already used.'
            : existingByLogin
              ? fields.login
              : fields.email,
        fields,
      });
    }

    const isMultipart = req.is('multipart/form-data');
    if (!isMultipart) {
      return res.status(400).json({
        message:
          'Please complete registration with document upload (use the signup form to submit your files).',
      });
    }

    const identityDocuments = [];
    const files = req.files || {};
    const avatarFile = files.avatar?.[0];

    if (role === 'AGENCY') {
      const f = files.agencyRegistration?.[0];
      if (!f) {
        return res.status(400).json({
          message:
            'Please upload your agency registration document (e.g. extrait RNE / patente / KBIS equivalent).',
        });
      }
      identityDocuments.push({
        kind: IdentityDocumentKind.AGENCY_REGISTRATION,
        url: `/uploads/${path.basename(f.path)}`,
        filename: f.originalname,
      });
    } else {
      const cinRecto = files.cinRecto?.[0];
      const cinVerso = files.cinVerso?.[0];
      const passport = files.passport?.[0];

      // Either passport OR both CIN sides are required. Users may also provide both.
      if (!passport && (!cinRecto || !cinVerso)) {
        return res.status(400).json({
          message:
            'Please upload either a passport, or both sides of your national ID (CIN recto and verso).',
        });
      }
      if (cinRecto) {
        identityDocuments.push({
          kind: IdentityDocumentKind.CIN_RECTO,
          url: `/uploads/${path.basename(cinRecto.path)}`,
          filename: cinRecto.originalname,
        });
      }
      if (cinVerso) {
        identityDocuments.push({
          kind: IdentityDocumentKind.CIN_VERSO,
          url: `/uploads/${path.basename(cinVerso.path)}`,
          filename: cinVerso.originalname,
        });
      }
      if (passport) {
        identityDocuments.push({
          kind: IdentityDocumentKind.PASSPORT,
          url: `/uploads/${path.basename(passport.path)}`,
          filename: passport.originalname,
        });
      }
    }

    const identityVerificationStatus = IdentityVerificationStatus.PENDING;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      login: normalizedLogin,
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      avatarUrl: buildUploadedPath(avatarFile),
      identityDocuments,
      identityVerificationStatus,
      identityVerificationNote: '',
    });
    await user.save();

    const msg =
      identityVerificationStatus === IdentityVerificationStatus.PENDING
        ? 'Account created. Your documents are under review. You will be able to sign in after an administrator approves your profile.'
        : 'User registered successfully.';

    res.status(201).json({
      message: msg,
      identityVerificationStatus,
    });
  } catch (error) {
    // Handle race condition on unique indexes
    if (error && error.code === 11000) {
      const dupField = Object.keys(error.keyPattern || {})[0];
      const fields = {};
      if (dupField === 'login') fields.login = 'This username is already taken.';
      if (dupField === 'email') fields.email = 'This email is already registered.';

      return res.status(409).json({
        message: fields.login || fields.email || 'User already exists.',
        fields,
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Validate registration uniqueness before step 2
exports.checkRegistrationAvailability = async (req, res) => {
  try {
    const login = String(req.body?.login || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!login && !email) {
      return res.status(400).json({
        message: 'Please provide login and/or email.',
      });
    }

    const checks = [];
    if (login) checks.push(User.findOne({ login }).select('_id'));
    if (email) checks.push(User.findOne({ email }).select('_id'));

    const results = await Promise.all(checks);
    let index = 0;
    const existingByLogin = login ? results[index++] : null;
    const existingByEmail = email ? results[index++] : null;

    if (existingByLogin || existingByEmail) {
      const fields = {};
      if (existingByLogin) fields.login = 'This username is already taken.';
      if (existingByEmail) fields.email = 'This email is already registered.';

      return res.status(409).json({
        message:
          existingByLogin && existingByEmail
            ? 'This username and email are already used.'
            : existingByLogin
              ? fields.login
              : fields.email,
        fields,
      });
    }

    return res.status(200).json({
      message: 'Login and email are available.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findOne({ email });

    // Sécurité : ne pas divulguer si l'email existe ou non
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si cet email est enregistré, un lien de réinitialisation vous a été envoyé.'
      });
    }

    // Générer le reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Construire le lien de reset
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Envoyer l'email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      // Si l'envoi échoue, annuler le token pour éviter un token mort en base
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: "L'envoi de l'email a échoué. Vérifiez la configuration SMTP.",
        error: emailError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Si cet email est enregistré, un lien de réinitialisation vous a été envoyé.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Nouveau mot de passe requis'
      });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token valide',
      email: user.email
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ============ 2FA FUNCTIONS ============

// Setup 2FA - Génère le secret et le QR code
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA déjà activé'
      });
    }

    // Générer un secret
    const secret = speakeasy.generateSecret({
      name: `SmartProperty (${user.email})`,
      length: 32
    });

    // Sauvegarder le secret (temporairement, pas encore activé)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Générer le QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: 'Secret 2FA généré',
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntry: secret.base32
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Verify 2FA - Vérifie le code et active le 2FA
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Code 2FA requis'
      });
    }

    const user = await User.findById(req.user._id).select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Setup 2FA non effectué'
      });
    }

    // Vérifier le token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Code 2FA invalide'
      });
    }

    // Générer des codes de backup
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push(code);
    }

    // Activer le 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA activé avec succès',
      backupCodes: backupCodes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe requis pour désactiver le 2FA'
      });
    }

    const user = await User.findById(req.user._id).select('+password +twoFactorSecret +twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }

    // Désactiver le 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA désactivé avec succès'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Validate 2FA token (utilisé lors du login)
exports.validate2FAToken = async (req, res) => {
  try {
    const { email, token, isBackupCode } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email et code requis'
      });
    }

    const user = await User.findOne({ email }).select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA non activé pour cet utilisateur'
      });
    }

    let isValid = false;

    if (isBackupCode) {
      // Vérifier le backup code
      const codeIndex = user.twoFactorBackupCodes.indexOf(token.toUpperCase());
      if (codeIndex !== -1) {
        isValid = true;
        // Supprimer le code utilisé
        user.twoFactorBackupCodes.splice(codeIndex, 1);
        await user.save();
      }
    } else {
      // Vérifier le token TOTP
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Code 2FA invalide'
      });
    }

    // Générer JWT
    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: '2FA validé',
      token: jwtToken,
      user: buildAuthUserPayload(user),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// @desc    Current user's purchase offers (sales) and rental bookings (leases)
// @route   GET /api/users/me/offers?kind=all|sale|lease
// @access  Private (BUYER, TENANT)
exports.getMyOffers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const kind = String(req.query.kind || 'all').toLowerCase();

    const propertySelect = 'reference title city type price status listingType images';
    const userSelect = 'login email firstName lastName phone';

    let sales = [];
    let leases = [];

    if (kind === 'all' || kind === 'sale' || kind === 'sales') {
      sales = await Sale.find({ buyerId: userId })
        .sort({ saleDate: -1 })
        .populate('propertyId', propertySelect)
        .populate('buyerId', userSelect)
        .populate('transactionId');
    }

    if (kind === 'all' || kind === 'lease' || kind === 'leases' || kind === 'rent') {
      leases = await Lease.find({ tenantId: userId })
        .sort({ createdAt: -1 })
        .populate('propertyId', propertySelect)
        .populate('tenantId', userSelect)
        .populate('transactionId');
    }

    return res.status(200).json(
      apiResponse(true, 'Offers retrieved successfully', { sales, leases })
    );
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -twoFactorSecret -twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        login: user.login,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl || '',
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        identityVerificationStatus: user.identityVerificationStatus || IdentityVerificationStatus.APPROVED,
        accessMode:
          user.role === 'ADMIN' ||
          !ROLES_REQUIRING_IDENTITY.has(user.role) ||
          (user.identityVerificationStatus || IdentityVerificationStatus.APPROVED) === IdentityVerificationStatus.APPROVED
            ? 'FULL'
            : 'READ_ONLY',
        canTransact:
          user.role === 'ADMIN' ||
          !ROLES_REQUIRING_IDENTITY.has(user.role) ||
          (user.identityVerificationStatus || IdentityVerificationStatus.APPROVED) === IdentityVerificationStatus.APPROVED,
        identityVerificationNote: user.identityVerificationNote || '',
        identityDocuments: user.identityDocuments || [],
        walletNumber: user.walletNumber || null,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update current user profile (supports avatar upload)
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, walletNumber } = req.body;
    const user = await User.findById(req.user._id).select('-password -twoFactorSecret -twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (walletNumber !== undefined) user.walletNumber = walletNumber;
    if (req.file) user.avatarUrl = buildUploadedPath(req.file);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        login: user.login,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl || '',
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        walletNumber: user.walletNumber || null,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Logout (client clears token; optional server-side hook for future token blacklist)
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============ ADMIN FUNCTIONS ============

// Liste des comptes en attente de vérification d’identité
exports.listVerificationRequests = async (req, res) => {
  try {
    const { status = 'PENDING' } = req.query;
    const allowed = ['PENDING', 'REJECTED', 'ALL'];
    const st = allowed.includes(String(status).toUpperCase()) ? String(status).toUpperCase() : 'PENDING';

    const filter = { role: { $in: [...ROLES_REQUIRING_IDENTITY] } };
    if (st === 'ALL') {
      filter.identityVerificationStatus = { $in: [IdentityVerificationStatus.PENDING, IdentityVerificationStatus.REJECTED] };
    } else {
      filter.identityVerificationStatus = st;
    }

    const users = await User.find(filter)
      .select('-password -twoFactorSecret -twoFactorBackupCodes')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Verification requests retrieved',
      users,
      total: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Approuver / refuser une demande de vérification
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, note } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(String(status || '').toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'status must be APPROVED or REJECTED',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!ROLES_REQUIRING_IDENTITY.has(user.role)) {
      return res.status(400).json({
        success: false,
        message: 'This user role does not require identity verification',
      });
    }

    user.identityVerificationStatus = String(status).toUpperCase();
    if (user.identityVerificationStatus === IdentityVerificationStatus.REJECTED) {
      user.identityVerificationNote = (note && String(note).trim()) || 'Documents could not be verified.';
    } else {
      user.identityVerificationNote = '';
    }

    await user.save();

    if (user.identityVerificationStatus === IdentityVerificationStatus.APPROVED) {
      // Best-effort email: approval should not fail if SMTP is down.
      try {
        if (typeof emailService.sendAccountApprovedEmail === 'function') {
          await emailService.sendAccountApprovedEmail(user.email, {
            name: user.firstName || user.login || user.email,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to send approval email:', e?.message || e);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Verification status updated',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        identityVerificationStatus: user.identityVerificationStatus,
        identityVerificationNote: user.identityVerificationNote,
        identityDocuments: user.identityDocuments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -twoFactorSecret -twoFactorBackupCodes')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      users,
      total: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user by ID (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive, firstName, lastName, phone } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (req.file) user.avatarUrl = buildUploadedPath(req.file);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl || '',
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAgencies = async (req, res) => {
  try {
    const { city, role } = req.query;

    let userQuery = {
      isActive: true,
      $or: [
        { identityVerificationStatus: IdentityVerificationStatus.APPROVED },
        { identityVerificationStatus: { $exists: false } },
      ],
    };

    if (role && role !== 'Select') {
      userQuery.role = role;
    } else {
      userQuery.role = 'AGENCY';
    }

    // If filtering by property attributes (city), find relevant user IDs first
    if (city && city !== 'Select') {
      const propertyFilter = { city: new RegExp(city, 'i') };
      const userIds = await Property.distinct('createdBy', propertyFilter);
      userQuery._id = { $in: userIds };
    }

    const agencies = await User.find(userQuery)
      .select('-password -twoFactorSecret -twoFactorBackupCodes')
      .sort({ createdAt: -1 });

    // For each agency, count their matching listings
    const agenciesWithCount = await Promise.all(
      agencies.map(async (agency) => {
        const countFilter = { createdBy: agency._id };
        if (city && city !== 'Select') countFilter.city = new RegExp(city, 'i');

        const listingsCount = await Property.countDocuments(countFilter);
        return {
          id: agency._id,
          login: agency.login,
          firstName: agency.firstName,
          lastName: agency.lastName,
          email: agency.email,
          phone: agency.phone,
          role: agency.role,
          createdAt: agency.createdAt,
          listingsCount,
        };
      })
    );

    // If city filter was applied, only return agencies that have at least one matching property
    const result = (city && city !== 'Select')
      ? agenciesWithCount.filter(a => a.listingsCount > 0)
      : agenciesWithCount;

    res.status(200).json({
      success: true,
      message: 'Agencies retrieved successfully',
      data: result,
      total: result.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get available filter options for agencies
exports.getAgencyFilters = async (req, res) => {
  try {
    const cities = await Property.distinct('city');
    const roles = ['AGENCY', 'OWNER'];

    res.status(200).json({
      success: true,
      data: {
        cities: cities.filter(Boolean).sort(),
        roles
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


// Delete user by ID (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
