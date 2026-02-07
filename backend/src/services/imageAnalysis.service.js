/**
 * Service pour la détection automatique des caractéristiques à partir des photos
 * TEMPORAIREMENT DÉSACTIVÉ - Utilisera GPT-4 Vision pour analyser les images
 */

// const openaiService = require('./openai.service');

exports.analyzePropertyImages = async (imageUrls) => {
  // Temporairement désactivé - retourne un objet vide
  return {
    roomCount: null,
    estimatedSurface: null,
    propertyType: null,
    detectedRooms: [],
    amenities: [],
    condition: null,
    style: null,
    naturalLight: null,
    furnishing: null,
    floorType: null,
    wallCondition: null,
    keyFeatures: [],
    suggestedImprovements: [],
    marketingHighlights: [],
    message: "Image analysis temporarily disabled"
  };
};

exports.detectRoomType = async (imageUrl) => {
  // Temporairement désactivé - retourne "other"
  return "other";
};
