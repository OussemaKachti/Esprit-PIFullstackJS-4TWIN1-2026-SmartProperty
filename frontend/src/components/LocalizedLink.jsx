import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLanguageFromPath, localizeRoute } from '../routes/routeConfig';

/**
 * LocalizedLink Component
 * Automatically applies the current language prefix to all links
 * 
 * Usage: <LocalizedLink to="/about-us">About</LocalizedLink>
 * If current URL is /fr/home, it will navigate to /fr/about-us
 */
const LocalizedLink = ({ to, children, ...props }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  
  // Prefer URL language as source of truth, then fallback to i18n language.
  const currentLanguage =
    getLanguageFromPath(location.pathname) ||
    (i18n.resolvedLanguage || i18n.language || '').slice(0, 2);
  
  // Convert the target path to localized version
  const localizedPath = localizeRoute(to, currentLanguage);
  
  return (
    <Link to={localizedPath} {...props}>
      {children}
    </Link>
  );
};

export default LocalizedLink;
