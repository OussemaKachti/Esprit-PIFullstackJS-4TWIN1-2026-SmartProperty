/**
 * Route Configuration and Utilities
 * Handles dynamic language-based routing
 */

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'it'];
export const DEFAULT_LANGUAGE = 'en';

/**
 * Routes that should not have Header/Footer
 */
export const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/signin',
  '/forgot-password',
  '/reset-password',
  '/form'
];

/**
 * Main route definitions (without language prefix)
 */
export const ROUTES = [
  // Home Routes
  { path: '/', component: 'Index3' },
  { path: '/home', component: 'Home' },
  { path: '/index-2', component: 'Index2' },
  { path: '/index-3', component: 'Index3' },

  // Auth Routes
  { path: '/login', component: 'Login' },
  { path: '/signup', component: 'Signup' },
  { path: '/signin', component: 'Signin' },
  { path: '/forgot-password', component: 'ForgotPassword' },
  { path: '/reset-password', component: 'ResetPassword' },
  { path: '/form', component: 'FirstStepForm' },

  // Protected Routes
  { path: '/dashboard', component: 'Dashboard', protected: true },

  // Property Buy Routes
  { path: '/buy-property-grid', component: 'BuyPropertyGrid' },
  { path: '/buy-property-grid-sidebar', component: 'BuyPropertyGridSidebar' },
  { path: '/buy-property-list', component: 'BuyPropertyList' },
  { path: '/buy-property-list-sidebar', component: 'BuyPropertyListSidebar' },
  { path: '/buy-grid-map', component: 'BuyGridMap' },
  { path: '/buy-list-map', component: 'BuyListMap' },
  { path: '/buy-details', component: 'BuyDetails' },
  { path: '/add-property-buy', component: 'AddPropertyBuy' },

  // Property Rent Routes
  { path: '/rent-property-grid', component: 'RentPropertyGrid' },
  { path: '/rent-property-grid-sidebar', component: 'RentPropertyGridSidebar' },
  { path: '/rent-property-list', component: 'RentPropertyList' },
  { path: '/rent-property-list-sidebar', component: 'RentPropertyListSidebar' },
  { path: '/rent-grid-map', component: 'RentGridMap' },
  { path: '/rent-list-map', component: 'RentListMap' },
  { path: '/rent-details', component: 'RentDetails' },
  { path: '/add-property-rent', component: 'AddPropertyRent' },

  // Rental Booking Routes
  { path: '/rental-booking', component: 'RentalBooking' },
  { path: '/rental-order-confirmation', component: 'RentalOrderConfirmation' },
  { path: '/rental-order-details', component: 'RentalOrderDetails' },
  { path: '/rental-payment', component: 'RentalPayment' },

  // Agent Routes
  { path: '/agent-grid', component: 'AgentGrid' },
  { path: '/agent-grid-sidebar', component: 'AgentGridSidebar' },
  { path: '/agent-list', component: 'AgentList' },
  { path: '/agent-list-sidebar', component: 'AgentListSidebar' },
  { path: '/agent-details', component: 'AgentDetails' },

  // Agency Routes
  { path: '/agency-grid', component: 'AgencyGrid' },
  { path: '/agency-grid-sidebar', component: 'AgencyGridSidebar' },
  { path: '/agency-list', component: 'AgencyList' },
  { path: '/agency-list-sidebar', component: 'AgencyListSidebar' },
  { path: '/agency-details', component: 'AgencyDetails' },

  // Blog Routes
  { path: '/blog-grid', component: 'BlogGrid' },
  { path: '/blog-list', component: 'BlogList' },
  { path: '/blog-details', component: 'BlogDetails' },

  // Info Pages
  { path: '/about-us', component: 'AboutUs' },
  { path: '/contact-us', component: 'ContactUs' },
  { path: '/pricing', component: 'Pricing' },
  { path: '/faq', component: 'Faq' },
  { path: '/gallery', component: 'Gallery' },
  { path: '/our-team', component: 'OurTeam' },
  { path: '/testimonial', component: 'Testimonial' },
  { path: '/privacy-policy', component: 'PrivacyPolicy' },
  { path: '/terms-condition', component: 'TermsCondition' },

  // E-commerce Routes
  { path: '/wishlist', component: 'Wishlist' },
  { path: '/cart', component: 'Cart' },
  { path: '/checkout', component: 'Checkout' },
  { path: '/invoice-details', component: 'InvoiceDetails' },

  // Utility Pages
  { path: '/notifications', component: 'Notifications' },
  { path: '/maintenance', component: 'Maintenance' },
  { path: '/coming-soon', component: 'ComingSoon' },

  // Error Pages
  { path: '/error-404', component: 'Error404' },
  { path: '/error-500', component: 'Error500' },
];

/**
 * Generate routes with all language prefixes
 * @returns {Array} Array of route configs with language prefixes
 */
export const generateLocalizedRoutes = () => {
  const localizedRoutes = [];

  ROUTES.forEach(route => {
    // Add default route (no prefix)
    localizedRoutes.push({
      ...route,
      path: route.path,
      lang: DEFAULT_LANGUAGE
    });

    // Add localized routes for non-default languages
    SUPPORTED_LANGUAGES.filter(lang => lang !== DEFAULT_LANGUAGE).forEach(lang => {
      localizedRoutes.push({
        ...route,
        path: `/${lang}${route.path}`,
        lang: lang
      });
    });
  });

  return localizedRoutes;
};

/**
 * Get language from pathname
 * @param {string} pathname - Current pathname
 * @returns {string} Detected language code
 */
export const getLanguageFromPath = (pathname) => {
  const langMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (langMatch && SUPPORTED_LANGUAGES.includes(langMatch[1])) {
    return langMatch[1];
  }
  return DEFAULT_LANGUAGE;
};

/**
 * Convert path to localized path
 * @param {string} path - Original path
 * @param {string} targetLang - Target language code
 * @returns {string} Localized path
 */
export const localizeRoute = (path, targetLang) => {
  // Remove existing language prefix
  const cleanPath = path.replace(/^\/([a-z]{2})(\/|$)/, '/');
  
  // Add new language prefix (except for default language)
  if (targetLang === DEFAULT_LANGUAGE) {
    return cleanPath === '/' ? '/' : cleanPath;
  }
  
  return `/${targetLang}${cleanPath === '/' ? '' : cleanPath}`;
};

/**
 * Check if route should show auth layout (no header/footer)
 * @param {string} pathname - Current pathname
 * @returns {boolean} True if auth route
 */
export const isAuthRoute = (pathname) => {
  // Remove language prefix for checking
  const cleanPath = pathname.replace(/^\/([a-z]{2})(\/|$)/, '/');
  return AUTH_ROUTES.includes(cleanPath);
};

/**
 * Get all localized versions of auth routes
 * @returns {Array} Array of all auth route paths including localized versions
 */
export const getAllAuthRoutes = () => {
  const allAuthRoutes = [];
  
  AUTH_ROUTES.forEach(route => {
    allAuthRoutes.push(route);
    SUPPORTED_LANGUAGES.filter(lang => lang !== DEFAULT_LANGUAGE).forEach(lang => {
      allAuthRoutes.push(`/${lang}${route}`);
    });
  });
  
  return allAuthRoutes;
};
