import { API_URL } from './propertyService';

/**
 * Fetch all active agencies (OWNER or AGENCY role users) with optional filters
 * @param {Object} filters - Filter parameters (role, city)
 * @returns {Promise<Array>} Array of agency objects with listingsCount
 */
export const getAgencies = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.role) params.append('role', filters.role);
        if (filters.city) params.append('city', filters.city);

        const response = await fetch(`${API_URL}/users/agencies?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to fetch agencies');
        }
    } catch (error) {
        console.error('Error fetching agencies:', error);
        throw error;
    }
};

/**
 * Fetch available filter options for agencies
 * @returns {Promise<Object>} Object containing cities and roles
 */
export const getAgencyFilters = async () => {
    try {
        const response = await fetch(`${API_URL}/users/agency-filters`);
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to fetch agency filters');
        }
    } catch (error) {
        console.error('Error fetching agency filters:', error);
        throw error;
    }
};
