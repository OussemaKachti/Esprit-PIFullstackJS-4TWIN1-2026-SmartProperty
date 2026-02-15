/**
 * Centralized toast notifications for the app.
 * Use the same API everywhere: success, error, loading, info, promise.
 *
 * @example
 * import toast from '../utils/toast';
 * toast.success('Property created successfully');
 * toast.error('Invalid credentials');
 * toast.loading('Saving...');
 * toast.promise(myPromise, { loading: 'Saving...', success: 'Saved!', error: 'Failed' });
 */

import toast from 'react-hot-toast';

const defaultOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '14px',
    borderRadius: '12px',
    padding: '14px 18px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  },
};

/**
 * Show a success toast
 * @param {string} message
 * @param {object} options - optional toast options
 */
export const success = (message, options = {}) => {
  return toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Show an error toast
 * @param {string} message
 * @param {object} options - optional toast options
 */
export const error = (message, options = {}) => {
  return toast.error(message, { ...defaultOptions, duration: 5000, ...options });
};

/**
 * Show a loading toast (returns id to dismiss/update later)
 * @param {string} message
 * @param {object} options - optional toast options
 */
export const loading = (message, options = {}) => {
  return toast.loading(message, { ...defaultOptions, ...options });
};

/**
 * Show an info toast
 * @param {string} message
 * @param {object} options - optional toast options
 */
export const info = (message, options = {}) => {
  return toast(message, { ...defaultOptions, icon: 'ℹ️', ...options });
};

/**
 * Dismiss a toast by id (e.g. from loading())
 * @param {string} toastId
 */
export const dismiss = (toastId) => toast.dismiss(toastId);

/**
 * Promise toast: shows loading then success or error
 * @param {Promise} promise
 * @param {{ loading: string, success: string, error: string|function }} messages
 */
export const promise = (promise, messages, options = {}) => {
  return toast.promise(promise, messages, { ...defaultOptions, ...options });
};

// Re-export default toast for custom use (toast.custom(), etc.)
export default toast;
