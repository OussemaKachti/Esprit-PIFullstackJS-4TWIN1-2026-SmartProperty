# Backend AI Models - Compact Summary

## 1) Groq / LLM text generation

### `llama-3.3-70b-versatile`
- File: `src/services/groq.service.js`
- Used for: generating property descriptions in `src/services/description.service.js`
- Main use: create 3 description variants with different tones and lengths.
- Input data: property type, surface, rooms, address, city, price, detected features.

### `openai/gpt-oss-120b`
- File: `src/services/gpt/gptService.js`
- Used for: rewriting text with a selected tone in `src/api/toneChanger.js`
- Main use: tone changing / text rephrasing only.
- Input data: original text + tone.

## 2) Hugging Face vision/image models

### `Salesforce/blip-image-captioning-large`
- File: `src/services/huggingface.service.js`
- Used for: image understanding / room classification.
- Main use: inspect uploaded property images and infer if they look like an empty room or another room type.
- Input data: local uploaded property image.

### `stabilityai/stable-diffusion-xl-base-1.0`
- File: `src/services/huggingface.service.js`
- Used for: virtual staging image generation.
- Main use: create a staged furniture-style image from a property image prompt.
- Input data: property image + style prompt.

## 3) AI-based backend features

- `src/controllers/aiController.js`: generates AI property descriptions.
- `src/controllers/propertyController.js`: uses AI for image analysis and virtual staging.
- `src/api/toneChanger.js`: tone rewrite endpoint.

## 4) Data used by the AI features

- Property database records: title, type, surface, rooms, address, city, price, features.
- Uploaded images from `uploads/`.
- Property feedback/reviews for smart featured listings.
- Dashboard stats from backend services.(related to empty room ai)

## 5) Keywords to remember

- `llama-3.3-70b-versatile`
- `openai/gpt-oss-120b`
- `Salesforce/blip-image-captioning-large`
- `stabilityai/stable-diffusion-xl-base-1.0`
- Groq
- Hugging Face
- tone changer
- description generation
- image classification
- virtual staging
- property data
- uploaded images

