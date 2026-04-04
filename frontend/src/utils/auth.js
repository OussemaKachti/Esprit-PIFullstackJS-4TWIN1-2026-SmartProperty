/**
 * Authentication utilities for role-based routing and user management
 */

/** Roles that see the Backoffice entry in the header and can open the backoffice app */
const BACKOFFICE_LINK_ROLES = ['AGENCY', 'OWNER', 'ADMIN', 'BUYER', 'TENANT'];

/** Roles redirected straight to the backoffice after a normal login (not buyer/tenant) */
const BACKOFFICE_AUTO_LOGIN_REDIRECT_ROLES = ['AGENCY', 'OWNER', 'ADMIN'];

const FRONTEND_ROLES = ['TENANT', 'BUYER'];

const normalizeRole = (role) => String(role || '').toUpperCase();

/**
 * Check if user role should see Backoffice in the menu and may open the backoffice URL
 * @param {string} role - User role
 * @returns {boolean}
 */
export const shouldAccessBackoffice = (role) => {
  return BACKOFFICE_LINK_ROLES.includes(normalizeRole(role));
};

/**
 * After login on the public site: only owner/agency/admin jump to backoffice; buyers/tenants stay on marketplace.
 * @param {string} role - User role
 * @returns {boolean}
 */
export const shouldAutoRedirectToBackofficeOnLogin = (role) => {
  return BACKOFFICE_AUTO_LOGIN_REDIRECT_ROLES.includes(normalizeRole(role));
};

/**
 * Check if user role should access frontend
 * @param {string} role - User role
 * @returns {boolean}
 */
export const shouldAccessFrontend = (role) => {
  return FRONTEND_ROLES.includes(normalizeRole(role));
};

/**
 * Get redirect URL based on user role
 * @param {string} role - User role
 * @returns {string} - Redirect URL
 */
export const getRedirectUrl = (role) => {
  if (shouldAccessBackoffice(role)) {
    return process.env.REACT_APP_BACKOFFICEE_URL || 'http://localhost:5173';
  }
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
