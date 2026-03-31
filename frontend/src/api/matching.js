import { apiRequest } from './client';



export async function fetchMatches(candidate) {
  return apiRequest('/api/match', {
    method: 'POST',
    body: JSON.stringify(candidate),
    base: 'fastapi',
  });
}




export async function fetchCreditScore(dossier) {
  return apiRequest('/credit', {
    method: 'POST',
    body: JSON.stringify(dossier),
    base: 'fastapi',
  });
}
