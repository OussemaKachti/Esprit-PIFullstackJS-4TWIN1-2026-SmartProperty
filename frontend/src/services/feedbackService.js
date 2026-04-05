import { API_URL } from './propertyService';

/**
 * Fetch reviews for a specific property
 * @param {Object} params - Query parameters (propertyId, page, limit)
 * @returns {Promise} - List of feedbacks and pagination info
 */
export const getFeedbacks = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.propertyId) queryParams.append('propertyId', params.propertyId);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit || 10);

        const response = await fetch(`${API_URL}/feedbacks?${queryParams.toString()}`);
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to fetch reviews');
        }
    } catch (error) {
        console.error('Error in getFeedbacks:', error);
        throw error;
    }
};

/**
 * Submit a new review for a property
 * @param {Object} feedbackData - { propertyId, rating, comment }
 * @returns {Promise} - Created feedback object
 */
export const createFeedback = async (feedbackData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required to submit a review');
        }

        const response = await fetch(`${API_URL}/feedbacks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(feedbackData)
        });

        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Error in createFeedback:', error);
        throw error;
    }
};

/**
 * Calculate review statistics for a property
 * @param {Array} reviews - List of reviews
 * @returns {Object} - { averageRating, totalReviews, starDistribution }
 */
export const calculateReviewStats = (reviews = []) => {
    if (!reviews || reviews.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    const totalReviews = reviews.length;
    const starDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;

    reviews.forEach(review => {
        const rating = Math.round(review.rating);
        if (starDistribution[rating] !== undefined) {
            starDistribution[rating]++;
        }
        sumRating += review.rating;
    });

    const averageRating = (sumRating / totalReviews).toFixed(1);

    return {
        averageRating,
        totalReviews,
        starDistribution
    };
};
