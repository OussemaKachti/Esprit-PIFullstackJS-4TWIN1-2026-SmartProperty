const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

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
      user: {
        id: user._id,
        login: user.login,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      }
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

// Register a new user
exports.register = async (req, res) => {
  try {
    const { login, email, password, firstName, lastName, phone, role } = req.body;
    
    if (!login || !email || !password) {
      return res.status(400).json({ message: 'Login, email, and password are required.' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { login }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or login already exists.' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      login,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role
    });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }
    
    // Générer le reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: 'Token de réinitialisation généré',
      resetToken,
      resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`
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
    const user = await User.findById(req.user.userId).select('+twoFactorSecret');
    
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
    
    const user = await User.findById(req.user.userId).select('+twoFactorSecret +twoFactorBackupCodes');
    
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
    
    const user = await User.findById(req.user.userId).select('+password +twoFactorSecret +twoFactorBackupCodes');
    
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
      user: {
        id: user._id,
        login: user.login,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
