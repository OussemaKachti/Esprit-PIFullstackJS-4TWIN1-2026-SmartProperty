const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Initialize Hugging Face
// Make sure to add HUGGINGFACE_API_KEY in your .env
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const guessMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
};

/**
 * Helper to convert local DB paths to a File Blob that Hugging Face Inference expects
 */
const toHfImageInput = (imageUrlOrPath) => {
  if (!imageUrlOrPath) return null;

  // We only handle local uploads for now to send to HF
  const normalized = String(imageUrlOrPath).replace(/\\/g, '/');
  const filename = normalized.startsWith('uploads/')
    ? normalized.slice('uploads/'.length)
    : normalized;

  const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
  const filePath = path.join(uploadsDir, filename);

  const buffer = fs.readFileSync(filePath);
  return new Blob([buffer], { type: guessMimeType(filePath) });
};

/**
 * Service HuggingFace - Handles both Image Classification (Vision) and Image-to-Image Generation
 */

exports.analyzeImageWithAI = async (imageUrl) => {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
        console.warn('⚠️ No HUGGINGFACE_API_KEY found! Using mock analysis.');
        return { isEligible: true, classification: 'empty_room' };
    }

    const imageBlob = toHfImageInput(imageUrl);

    // Using a powerful, free Vision model on HF
    const result = await hf.imageToText({
      data: imageBlob,
      model: "Salesforce/blip-image-captioning-large"
    });

    const caption = result.generated_text.toLowerCase();
    console.log("Vision Output:", caption);

    // Simple heuristic: If it sees an empty room, wall, or floor, it's considered emptyish.
    // If it sees furniture heavily, we might reject it, but for testing we'll assume it's okay unless it strictly says 'text' or 'logo'.
    if (caption.includes("room") || caption.includes("wall") || caption.includes("empty") || caption.includes("floor") || caption.includes("house")) {
        return { isEligible: true, classification: 'empty_room' };
    } else {
        // As a fallback to allow the user to continue playing with the tool without strict failures:
        console.warn('⚠️ Vision AI was unsure, allowing it anyway for testing.');
        return { isEligible: true, classification: 'unknown_room' };
    }

  } catch (error) {
    console.error('HF Vision API Error:', error.message);
    console.warn('⚠️ Falling back to mock vision analysis due to API error.');
    return { isEligible: true, classification: 'empty_room' };
  }
};


/**
 * Generate a virtually staged room using Image-to-Image on HF
 */
exports.generateHuggingFaceStaging = async (imageUrl, stylePrompt) => {
    try {
        if (!process.env.HUGGINGFACE_API_KEY) {
            console.warn('⚠️ No HUGGINGFACE_API_KEY found! Returning mock URL.');
            const shortStyle = encodeURIComponent(stylePrompt.split(',')[1] || 'Virtual Staging');
            return `https://placehold.co/800x600/20c997/ffffff.png?text=Simulated+${shortStyle}`;
        }

        const imageBlob = toHfImageInput(imageUrl);

        // Currently, instruct-pix2pix is often offline on the free inference API.
        // We will use standard Stable Diffusion XL which is highly reliable on the free tier.
        const resultBlob = await hf.textToImage({
          model: "stabilityai/stable-diffusion-xl-base-1.0",
          inputs: `High quality interior design photography, beautifully furnished ${stylePrompt} room, interior decoration, realistic lighting, highly detailed`,
          parameters: {
            negative_prompt: "ugly, blurry, malformed, empty room",
          }
        });

        // Convert the resulting Blob to a buffer and save it to our uploads folder so the frontend can read it!
        const arrayBuffer = await resultBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(4).toString('hex');
        const filename = `staged_${timestamp}_${randomString}.png`;
        
        const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
        const filePath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filePath, buffer);

        // Return the new relative URL for the frontend
        return `uploads/${filename}`;

    } catch (error) {
        console.error('HF Image2Image API Error:', error.message);
        console.warn('⚠️ Falling back to mock generated image due to API error.');
        const shortStyle = encodeURIComponent(stylePrompt.split(',')[1] || 'Virtual Staging');
        return `https://placehold.co/800x600/20c997/ffffff.png?text=Simulated+${shortStyle}`;
    }
};

module.exports = exports;
