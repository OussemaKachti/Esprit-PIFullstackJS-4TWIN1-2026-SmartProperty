import { apiRequest } from './client';

export async function generateDescription(propertyId, options = {}) {
  const { tone = 'professional', length = 'medium' } = options;

  const data = await apiRequest(
    `/api/ai/generate-description/${propertyId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        tone: tone.toLowerCase(),
        length,
      }),
    }
  );

  return data.data;
}

export async function generateDescriptionFromDraft(draft, options = {}) {
  const { tone = 'professional', length = 'medium' } = options;

  const data = await apiRequest('/api/ai/generate-description-draft', {
    method: 'POST',
    body: JSON.stringify({
      property: {
        type: draft.type || draft.propertyType || 'apartment',
        address: draft.address || draft.propertyAddress || '',
        surface: draft.surface ?? draft.totalArea ?? 0,
        rooms: draft.rooms ?? 0,
        city: draft.city || '',
        price: draft.price ?? 0,
      },
      tone: tone.toLowerCase(),
      length,
    }),
  });

  return data.data;
}