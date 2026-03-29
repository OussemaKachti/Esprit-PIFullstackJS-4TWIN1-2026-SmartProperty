import { apiRequest } from './client';

export async function fetchMatches(candidate) {
  return apiRequest('/match', {
    method: 'POST',
    body: JSON.stringify(candidate),
  });
}

export async function fetchCreditScore(dossier) {
  return apiRequest('/credit', {
    method: 'POST',
    body: JSON.stringify(dossier),
  });
}
