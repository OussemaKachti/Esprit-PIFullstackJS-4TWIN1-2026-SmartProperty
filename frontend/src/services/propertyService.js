import { getApiBaseUrl } from '../utils/panoramaUtils';

// Property API Service — REACT_APP_API_URL may be http://host:5000 or http://host:5000/api

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;

/**
 * Get image URL from property image object
 * @param {Object} image - Image object from property
 * @returns {String} - Full image URL
 */
export const getImageUrl = (image) => {
  if (!image?.url) {
    return null;
  }

  let imagePath = image.url;
  imagePath = imagePath.replace(/\\/g, '/');

  if (!imagePath.startsWith('uploads/')) {
    imagePath = `uploads/${imagePath}`;
  }

  return `${API_BASE_URL}/${imagePath}`;
};

/**
 * Fetch properties with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} - Promise with properties data
 */
export const getProperties = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.type) params.append('type', filters.type);
    if (filters.city) params.append('city', filters.city);
    if (filters.listingType) params.append('listingType', filters.listingType);
    if (filters.status) params.append('status', filters.status);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.rooms) params.append('rooms', filters.rooms);
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
    if (filters.minSurface) params.append('minSurface', filters.minSurface);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page);

    params.append('limit', filters.limit || 20);

    const apiUrl = `${API_URL}/properties?${params.toString()}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch properties');
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

/**
 * Fetch featured properties based on smart algorithm
 * @param {Number} limit - Number of properties to fetch
 * @returns {Promise} - Promise with featured properties data
 */
export const getFeaturedProperties = async (limit = 6) => {
  try {
    const response = await fetch(`${API_URL}/properties/featured?limit=${limit}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch featured properties');
    }
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    throw error;
  }
};

/**
 * Fetch single property by ID
 * @param {String} id - Property ID
 * @returns {Promise} - Promise with property data
 */
export const getPropertyById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/properties/${id}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch property');
    }
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

/**
 * Fetch ratings summary keyed by property id
 * @param {string[]} propertyIds
 * @returns {Promise<Object>} map of propertyId => { averageRating, totalReviews }
 */
export const getFeedbackSummaryByPropertyIds = async (propertyIds = []) => {
  const ids = Array.isArray(propertyIds) ? propertyIds.filter(Boolean) : [];
  if (ids.length === 0) return {};
  try {
    const params = new URLSearchParams();
    params.append('propertyIds', ids.join(','));
    const response = await fetch(`${API_URL}/feedbacks/summary?${params.toString()}`);
    const data = await response.json();
    if (data.success) {
      return data.data?.byProperty || {};
    }
    return {};
  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    return {};
  }
};
