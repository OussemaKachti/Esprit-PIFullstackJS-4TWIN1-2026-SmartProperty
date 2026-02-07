const mongoose = require('mongoose');

// Enum pour les rôles
const UserRole = {
  ADMIN: 'ADMIN',
  AGENCY: 'AGENCY',
  OWNER: 'OWNER',
  TENANT: 'TENANT',
  BUYER: 'BUYER',
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
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
    },
    // Champs pour l'authentification (Phase 2)
    password: {
      type: String,
      // required: true, // Sera requis en Phase 2
      select: false, // Ne pas retourner le password dans les queries
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche
userSchema.index({ email: 1 });
userSchema.index({ login: 1 });

const User = mongoose.model('User', userSchema);

module.exports = { User, UserRole };
