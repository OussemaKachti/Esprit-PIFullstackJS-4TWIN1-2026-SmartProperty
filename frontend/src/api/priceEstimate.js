import { apiRequest } from './client';

export async function estimateRentalPrice(criteria) {
  return apiRequest('/api/price-estimate', {
    method: 'POST',
    body: JSON.stringify(criteria),
    base: 'fastapi',
  });
}

export async function fetchPriceEstimateOptions() {
  return apiRequest('/api/price-estimate/options', {
    method: 'GET',
    base: 'fastapi',
  });
}

