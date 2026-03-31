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
    console.log('❌ No image URL found');
    return null;
  }
  
  console.log('📥 Raw image URL from DB:', image.url);
  
  // Handle different path formats
  let imagePath = image.url;
  
  // Replace backslashes with forward slashes (Windows paths)
  imagePath = imagePath.replace(/\\/g, '/');
  
  // If path doesn't start with 'uploads/', add it
  if (!imagePath.startsWith('uploads/')) {
    imagePath = `uploads/${imagePath}`;
  }
  
  const fullUrl = `${API_BASE_URL}/${imagePath}`;
  console.log('🖼️ Final image URL:', fullUrl);
  return fullUrl;
};

/**
 * Fetch properties with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} - Promise with properties data
 */
export const getProperties = async (filters = {}) => {
  try {
    // Build query string from filters
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.city) params.append('city', filters.city);
    if (filters.listingType) params.append('listingType', filters.listingType);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.rooms) params.append('rooms', filters.rooms);
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
    if (filters.minSurface) params.append('minSurface', filters.minSurface);
    if (filters.page) params.append('page', filters.page);
    
    // Default to 20 items per page for better display
    params.append('limit', filters.limit || 20);

    const apiUrl = `${API_URL}/properties?${params.toString()}`;
    console.log('🔗 API Request URL:', apiUrl);
    
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
