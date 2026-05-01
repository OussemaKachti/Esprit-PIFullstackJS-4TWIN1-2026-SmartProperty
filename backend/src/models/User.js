const mongoose = require('mongoose');

const UserRole = {
  ADMIN: 'ADMIN',
  AGENCY: 'AGENCY',
  OWNER: 'OWNER',
  TENANT: 'TENANT',
  BUYER: 'BUYER',
};

const IdentityVerificationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const IdentityDocumentKind = {
  CIN: 'CIN',
  CIN_RECTO: 'CIN_RECTO',
  CIN_VERSO: 'CIN_VERSO',
  PASSPORT: 'PASSPORT',
  AGENCY_REGISTRATION: 'AGENCY_REGISTRATION',
};

const userSchema = new mongoose.Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpire: {
      type: Date,
      default: null
    },
    // Champs pour le 2FA
    twoFactorSecret: {
      type: String,
      select: false,
      default: null
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorBackupCodes: {
      type: [String],
      select: false,
      default: []
    },
    /** Pièces d’identité / immatriculation (inscription marketplace) */
    identityDocuments: [
      {
        kind: {
          type: String,
          enum: Object.values(IdentityDocumentKind),
          required: true,
        },
        url: { type: String, required: true },
        filename: { type: String },
      },
    ],
    identityVerificationStatus: {
      type: String,
      enum: Object.values(IdentityVerificationStatus),
      default: IdentityVerificationStatus.APPROVED,
    },
    /** Motif affiché si refus (visible côté utilisateur au login) */
    identityVerificationNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  UserRole,
  IdentityVerificationStatus,
  IdentityDocumentKind,
};