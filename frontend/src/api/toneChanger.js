import { apiRequest } from './client';

export async function changeTone(text, tone) {
  const body = { text, tone: tone.toLowerCase() };
  const data = await apiRequest('/api/tone-changer', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return { rewrittenText: data.rewrittenText };
}