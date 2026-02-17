/**
 * Authentication utilities for role-based routing and user management
 */

const BACKOFFICE_ROLES = ['AGENCY', 'OWNER', 'ADMIN'];
const FRONTEND_ROLES = ['TENANT', 'BUYER'];

/**
 * Check if user role should access backoffice
 * @param {string} role - User role
 * @returns {boolean}
 */
export const shouldAccessBackoffice = (role) => {
  return BACKOFFICE_ROLES.includes(role);
};

/**
 * Check if user role should access frontend
 * @param {string} role - User role
 * @returns {boolean}
 */
export const shouldAccessFrontend = (role) => {
  return FRONTEND_ROLES.includes(role);
};

/**
 * Get redirect URL based on user role
 * @param {string} role - User role
 * @returns {string} - Redirect URL
 */
export const getRedirectUrl = (role) => {
  if (shouldAccessBackoffice(role)) {
    // Backofficee (new admin) URL – force this host for OWNER/AGENCY/ADMIN
    // REACT_APP_BACKOFFICEE_URL can override the default if needed.
    return process.env.REACT_APP_BACKOFFICEE_URL || 'http://localhost:5173';
  }
  // Default frontend route for TENANT/BUYER
  return '/';
};

/**
 * Store user data in localStorage
 * @param {object} user - User object from API
 */
export const storeUserData = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * Get user data from localStorage
 * @returns {object|null}
 */
export const getUserData = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Clear user data from localStorage
 */
export const clearUserData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

/**
 * Redirect to backoffice (full page reload to switch apps)
 * @param {string} backofficeUrl - Backoffice URL
 */
export const redirectToBackoffice = (backofficeUrl) => {
  window.location.href = backofficeUrl;
};

/**
 * Redirect to backoffice and pass JWT once via URL.
 * Note: localStorage is NOT shared across different localhost ports.
 * @param {string} backofficeUrl - Backoffice base URL
 * @param {string} token - JWT token
 */
export const redirectToBackofficeWithToken = (backofficeUrl, token) => {
  const base = (backofficeUrl || '').replace(/\/$/, '');
  const url = `${base}/?token=${encodeURIComponent(token)}`;
  window.location.href = url;
};
