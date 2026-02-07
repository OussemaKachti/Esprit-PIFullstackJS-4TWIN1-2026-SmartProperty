const groqService = require('./groq.service'); // ← CHANGEMENT ICI
const { PropertyType } = require('../models');

/**
 * Service pour la génération automatique de descriptions attractives
 * Génère 3 variantes de descriptions avec différentes longueurs et tons
 * MAINTENANT AVEC GROQ (100% GRATUIT) 🎉
 */

const TONE_TEMPLATES = {
  professional: {
    prefix: 'Vous êtes un agent immobilier professionnel expérimenté.',
    style: 'formel, précis et factuel',
  },
  warm: {
    prefix: 'Vous êtes un agent immobilier chaleureux qui met en valeur l\'émotion d\'un lieu de vie.',
    style: 'chaleureux, accueillant et émotionnel',
  },
  luxury: {
    prefix: 'Vous êtes un expert en immobilier de luxe haut de gamme.',
    style: 'sophistiqué, élégant et exclusif',
  },
};

const LENGTH_CONFIG = {
  short: { words: '50-80', tokens: 150 },
  medium: { words: '120-180', tokens: 300 },
  long: { words: '250-350', tokens: 500 },
};

exports.generateDescriptions = async (property, tone = 'professional', length = 'medium') => {
  try {
    const toneConfig = TONE_TEMPLATES[tone] || TONE_TEMPLATES.professional;
    const lengthConfig = LENGTH_CONFIG[length] || LENGTH_CONFIG.medium;

    // Build property details for context
    const propertyDetails = {
      type: property.type,
      surface: property.surface,
      rooms: property.rooms,
      address: property.address,
      city: property.city,
      price: property.price,
      features: property.detectedFeatures ? Object.fromEntries(property.detectedFeatures) : {},
    };

    // Generate 3 variants
    const variants = await Promise.all([
      this.generateSingleDescription(propertyDetails, toneConfig, lengthConfig, 1),
      this.generateSingleDescription(propertyDetails, toneConfig, lengthConfig, 2),
      this.generateSingleDescription(propertyDetails, toneConfig, lengthConfig, 3),
    ]);

    return {
      variant1: variants[0],
      variant2: variants[1],
      variant3: variants[2],
      metadata: {
        tone,
        length,
        model: 'llama-3.1-70b-versatile (Groq)', // ← AJOUTÉ
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Description Generation Error:', error.message);
    throw error;
  }
};

exports.generateSingleDescription = async (propertyDetails, toneConfig, lengthConfig, variantNumber) => {
  try {
    const prompt = `
${toneConfig.prefix}

Générez une description immobilière attractive en français pour le bien suivant :

Type : ${propertyDetails.type}
Surface : ${propertyDetails.surface} m²
Nombre de pièces : ${propertyDetails.rooms}
Ville : ${propertyDetails.city}
Prix : ${propertyDetails.price} €
${propertyDetails.features ? `Caractéristiques détectées : ${JSON.stringify(propertyDetails.features, null, 2)}` : ''}

Instructions :
- Longueur : ${lengthConfig.words} mots
- Style : ${toneConfig.style}
- Mettez en valeur les points forts du bien
- Incluez des éléments de localisation et de quartier
- Créez une description unique et engageante (variante ${variantNumber})
- Ne mentionnez pas de prix ou de modalités de transaction
- Terminez par un appel à l'action subtil

Répondez uniquement avec la description, sans introduction ni conclusion.
`;

    // ← CHANGEMENT ICI : utiliser groqService au lieu d'openaiService
    const description = await groqService.createChatCompletion(
      [
        { role: 'system', content: toneConfig.prefix },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.7 + (variantNumber * 0.1), // Slight variation
        max_tokens: lengthConfig.tokens,
      }
    );

    return description.trim();
  } catch (error) {
    console.error(`Description Variant ${variantNumber} Error:`, error.message);
    throw error;
  }
};

exports.translateDescription = async (description, targetLanguage) => {
  try {
    const prompt = `
Translate the following real estate property description to ${targetLanguage}.
Maintain the same tone, style, and marketing appeal.

Original description:
${description}
`;

    // ← CHANGEMENT ICI aussi
    const translation = await groqService.createChatCompletion(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.3,
        max_tokens: 1000,
      }
    );

    return translation.trim();
  } catch (error) {
    console.error('Translation Error:', error.message);
    throw error;
  }
};