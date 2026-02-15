# Route Configuration System

## Overview

This application uses a dynamic route configuration system that automatically generates localized routes for all supported languages, eliminating the need to manually duplicate routes for each language.

## Supported Languages

- **English (en)** - Default language (no prefix in URL)
- **French (fr)** - `/fr` prefix
- **German (de)** - `/de` prefix
- **Italian (it)** - `/it` prefix

## How It Works

### 1. Route Definition (`routeConfig.js`)

All routes are defined once in the `ROUTES` array:

```javascript
{ path: '/about-us', component: 'AboutUs' }
```

The system automatically generates localized versions:
- `/about-us` (English)
- `/fr/about-us` (French)
- `/de/about-us` (German)
- `/it/about-us` (Italian)

### 2. Dynamic Route Generation

The `generateLocalizedRoutes()` function creates all route variations:

```javascript
const localizedRoutes = generateLocalizedRoutes();
// Returns all routes with their language-specific paths
```

### 3. Language Detection

The `LanguageDetector` component in `App.js` automatically detects the language from the URL and updates the i18n language setting.

### 4. Language Switching

The `localizeRoute()` utility function converts paths between languages:

```javascript
localizeRoute('/about-us', 'fr') // Returns: '/fr/about-us'
localizeRoute('/fr/about-us', 'en') // Returns: '/about-us'
localizeRoute('/de/contact-us', 'it') // Returns: '/it/contact-us'
```

## Adding New Routes

### Simple Route

```javascript
// In routeConfig.js ROUTES array
{ path: '/new-page', component: 'NewPage' }
```

This automatically creates:
- `/new-page`
- `/fr/new-page`
- `/de/new-page`
- `/it/new-page`

### Protected Route

```javascript
{ path: '/admin', component: 'AdminPanel', protected: true }
```

### Auth Route (No Header/Footer)

Add the path to the `AUTH_ROUTES` array:

```javascript
export const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/your-new-auth-route' // Add here
];
```

## Utilities

### `getLanguageFromPath(pathname)`
Extracts the language code from a URL path.

```javascript
getLanguageFromPath('/fr/about-us') // Returns: 'fr'
getLanguageFromPath('/about-us') // Returns: 'en'
```

### `localizeRoute(path, targetLang)`
Converts a path to a different language.

```javascript
localizeRoute('/contact-us', 'de') // Returns: '/de/contact-us'
```

### `isAuthRoute(pathname)`
Checks if a route should use auth layout (no header/footer).

```javascript
isAuthRoute('/login') // Returns: true
isAuthRoute('/fr/about-us') // Returns: false
```

## Component Integration

### Using LocalizedLink (Recommended)

The `LocalizedLink` component automatically applies the current language prefix to all navigation links. This ensures that when users navigate within the app, they stay in their selected language.

```javascript
import LocalizedLink from '../components/LocalizedLink';

// If current URL is /fr/home and you click this link:
<LocalizedLink to="/contact-us">Contact</LocalizedLink>
// It will navigate to /fr/contact-us automatically

// If current URL is /de/about-us and you click this link:
<LocalizedLink to="/pricing">Pricing</LocalizedLink>
// It will navigate to /de/pricing automatically
```

**How it works:**
1. Detects the current language from the URL
2. Automatically applies that language prefix to the target path
3. Works seamlessly across all 4 languages

### In Components (using regular Link)

If you need to use the regular `Link` component, always use the base path without language prefix:

```javascript
import { Link } from 'react-router-dom';

<Link to="/about-us">About Us</Link>
// Note: This will NOT preserve the current language automatically
// Use LocalizedLink instead for language-aware navigation
```

### In Header Language Switcher

The `changeLanguage()` function automatically uses `localizeRoute()` to update the URL:

```javascript
const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  const newPath = localizeRoute(location.pathname, lang);
  navigate(newPath);
};
```

## Benefits

1. **No Route Duplication**: Define each route only once
2. **Easy Maintenance**: Add/remove routes in one place
3. **Scalable**: Easy to add new languages
4. **Type Safety**: Centralized component mapping
5. **Consistency**: All routes follow the same pattern
6. **Automatic Language Preservation**: LocalizedLink keeps users in their selected language
7. **User Experience**: Seamless navigation without language switching

## File Structure

```
src/
  routes/
    routeConfig.js      # Route definitions and utilities
    ProtectedRoute.jsx  # Protected route wrapper
    README.md          # This file
  App.js               # Route rendering
  components/
    Header.jsx         # Language switching & navigation
    Footer.jsx         # Footer navigation
    LocalizedLink.jsx  # Language-aware Link component
```
