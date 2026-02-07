const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Service Groq - Remplacement gratuit d'OpenAI
 * Utilise les derniers modèles disponibles
 */

// ← MODÈLES ACTUELLEMENT DISPONIBLES (Février 2026)
const AVAILABLE_MODELS = {
  // Le meilleur modèle actuel (recommandé)
  best: 'llama-3.3-70b-versatile',
  
  // Alternative rapide
  fast: 'llama-3.1-8b-instant',
  
  // Autres options
  mixtral: 'mixtral-8x7b-32768',
  gemma: 'gemma2-9b-it'
};

exports.createChatCompletion = async (messages, options = {}) => {
  try {
    const {
      temperature = 0.7,
      max_tokens = 1000,
      model = AVAILABLE_MODELS.best // ← CHANGEMENT ICI
    } = options;

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model,
      temperature,
      max_tokens,
      top_p: 1,
      stream: false
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    
    // Log le modèle utilisé pour debug
    console.error('Model attempted:', options.model || AVAILABLE_MODELS.best);
    
    throw new Error(`Groq API failed: ${error.message}`);
  }
};

/**
 * Créer une completion JSON structurée
 */
exports.createJsonCompletion = async (messages, options = {}) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: AVAILABLE_MODELS.best, // ← CHANGEMENT ICI AUSSI
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq JSON API Error:', error);
    throw new Error(`Groq JSON API failed: ${error.message}`);
  }
};

/**
 * Analyser des images (pas supporté directement par Groq)
 */
exports.analyzeImage = async (imageUrl) => {
  console.warn('⚠️ Image analysis not supported by Groq yet');
  
  return {
    roomType: 'unknown',
    features: [],
    condition: 'good',
    brightness: 'medium'
  };
};

// Exporter les modèles disponibles pour référence
exports.MODELS = AVAILABLE_MODELS;

module.exports = exports;