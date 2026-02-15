import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLanguageFromPath, localizeRoute } from '../routes/routeConfig';

/**
 * LocalizedLink Component
 * Automatically applies the current language prefix to all links
 * 
 * Usage: <LocalizedLink to="/about-us">About</LocalizedLink>
 * If current URL is /fr/home, it will navigate to /fr/about-us
 */
const LocalizedLink = ({ to, children, ...props }) => {
  const location = useLocation();
  
  // Get current language from URL
  const currentLanguage = getLanguageFromPath(location.pathname);
  
  // Convert the target path to localized version
  const localizedPath = localizeRoute(to, currentLanguage);
  
  return (
    <Link to={localizedPath} {...props}>
      {children}
    </Link>
  );
};

export default LocalizedLink;
