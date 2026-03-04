const mongoose = require('mongoose');

// Enums
const PropertyType = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  VILLA: 'VILLA',
  STUDIO: 'STUDIO',
  LAND: 'LAND',
  COMMERCIAL: 'COMMERCIAL',
  OFFICE: 'OFFICE',
  VACATION_RENTAL: 'VACATION_RENTAL',
  OTHER: 'OTHER',
};

const PropertyStatus = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  ARCHIVED: 'ARCHIVED',
};

const ListingType = {
  FOR_SALE: 'FOR_SALE',
  FOR_RENT: 'FOR_RENT',
};

const propertySchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: Object.values(PropertyType),
      required: true,
    },
    listingType: {
      type: String,
      enum: Object.values(ListingType),
      default: ListingType.FOR_SALE,
    },
    status: {
      type: String,
      enum: Object.values(PropertyStatus),
      default: PropertyStatus.AVAILABLE,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    surface: {
      type: Number,
      min: 0,
    },
    rooms: {
      type: Number,
      min: 0,
    },
    bathrooms: {
      type: Number,
      min: 0,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: 'Tunisia',
      trim: true,
    },
    // Champs additionnels pour Module 1
    images: [
      {
        url: String,
        publicId: String,
        fieldName: String, // Field name used in form-data (image, image1, photo, etc.)
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    aiGeneratedDescription: {
      type: Boolean,
      default: false,
    },
    detectedFeatures: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    // Utilisateur qui a créé la propriété
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Made optional for data imports
    },
  },
  {
    timestamps: true,
  }
);

// Index géospatial pour les recherches par proximité
propertySchema.index({ location: '2dsphere' });

// Index pour les recherches textuelles
propertySchema.index({ title: 'text', description: 'text' });

// Méthode pour générer une référence unique
propertySchema.statics.generateReference = async function () {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  return `PROP-${year}-${String(count + 1).padStart(5, '0')}`;
};

const Property = mongoose.model('Property', propertySchema);

module.exports = { Property, PropertyType, PropertyStatus, ListingType };
