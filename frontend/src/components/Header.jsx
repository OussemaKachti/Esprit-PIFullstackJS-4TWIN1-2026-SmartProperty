import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import LocalizedLink from './LocalizedLink';
import { localizeRoute, getLanguageFromPath, stripLanguagePrefix } from '../routes/routeConfig';
import {
  shouldAccessBackoffice,
  getRedirectUrl,
  redirectToBackofficeWithToken,
} from '../utils/auth';

const API_ROOT = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return '';
  if (/^data:/i.test(avatarUrl) || /^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  return avatarUrl.startsWith('/') ? `${API_ROOT}${avatarUrl}` : `${API_ROOT}/${avatarUrl}`;
};

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const renderBrand = ({ textColor = '#FFFFFF', iconSize = 44, className = '' } = {}) => (
    <span
      className={`d-inline-flex align-items-center ${className}`.trim()}
      style={{ gap: '12px', lineHeight: 1 }}
    >
      <img
        src="/assets/img/smart/image.png"
        alt="Smart Property"
        style={{ width: `${iconSize}px`, height: `${iconSize}px`, objectFit: 'contain' }}
      />
      <span
        style={{
          color: textColor,
          fontWeight: 700,
          fontSize: 'clamp(28px, 1.75vw, 36px)',
          letterSpacing: '0.3px',
          fontFamily: "'Nunito', sans-serif",
          whiteSpace: 'nowrap',
        }}
      >
        Smart Property
      </span>
    </span>
  );

  const [currentUser, setCurrentUser] = useState(null);

  const safeParseUser = (value) => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  const refreshCurrentUser = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(stored || null);
    } catch {
      setCurrentUser(null);
    }
  };

  // Re-read auth state whenever the route changes or profile data changes
  useEffect(() => {
    refreshCurrentUser();

    const handleUserUpdated = () => refreshCurrentUser();
    window.addEventListener('user-updated', handleUserUpdated);
    window.addEventListener('storage', handleUserUpdated);

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json().catch(() => ({}));
          const mergedUser = { ...(safeParseUser(localStorage.getItem('user')) || {}), ...(data.user || data) };
          localStorage.setItem('user', JSON.stringify(mergedUser));
          setCurrentUser(mergedUser);
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('user-updated', handleUserUpdated);
      window.removeEventListener('storage', handleUserUpdated);
    };
  }, [location.pathname]);

  const canAccessBackoffice =
    !!currentUser?.role && shouldAccessBackoffice(currentUser.role, currentUser.identityVerificationStatus);

  const handleOpenBackoffice = () => {
    const token = localStorage.getItem('token');
    if (!token || !canAccessBackoffice) return;

    const backofficeUrl = getRedirectUrl(currentUser.role);
    redirectToBackofficeWithToken(backofficeUrl, token, currentUser.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate(localizeRoute('/', i18n.language));
  };

  const getUserInitials = (user) => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
  };

  const getUserDisplayName = (user) => {
    if (!user) return '';
    if (user.firstName || user.lastName) return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return user.email || '';
  };

  const avatarSrc = resolveAvatarUrl(currentUser?.avatarUrl);

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);

    // Normalize current path before localizing and keep query/hash intact.
    const cleanPath = stripLanguagePrefix(location.pathname || '/');
    const newPath = localizeRoute(cleanPath || '/', lang);
    navigate(`${newPath}${location.search || ''}${location.hash || ''}`);
  };

  const getCurrentLanguage = () => {
    return getLanguageFromPath(location.pathname);
  };

  const getLanguageFlag = () => {
    const lang = getCurrentLanguage();
    const flagMap = {
      'en': 'us',
      'fr': 'fr',
      'de': 'de',
      'it': 'it'
    };
    return flagMap[lang] || 'us';
  };

  const path = stripLanguagePrefix(location.pathname);

  const navActive = {
    home:
      path === '/' ||
      path === '/home' ||
      path === '/index-2' ||
      path === '/index-3',
    buy:
      path.startsWith('/buy-') ||
      path.startsWith('/add-property-buy'),
    rent:
      (path.startsWith('/rent-') && !path.startsWith('/rental-')) ||
      path.startsWith('/add-property-rent'),
    rentalMatch: path.startsWith('/rental-match'),
    agency: path.startsWith('/agency-') || path.startsWith('/agent-'),
    about: path.startsWith('/about-us'),
    contact: path.startsWith('/contact-us'),
  };

  return (
    <div className="main-header-two">
      <header className="header header-three">
        <div className="container">
          <nav className="navbar navbar-expand-lg header-nav">
            <div className="navbar-header">
              <LocalizedLink to="/" className="navbar-brand logo">
                {renderBrand({ textColor: '#FFFFFF', iconSize: 44 })}
              </LocalizedLink>
              <LocalizedLink to="/" className="navbar-brand logo-dark">
                {renderBrand({ textColor: '#0F172A', iconSize: 44 })}
              </LocalizedLink>
              <a id="mobile_btn" href="#">
                <i className="material-icons-outlined">menu</i>
              </a>
            </div>

            <div className="main-menu-wrapper">
              <div className="menu-header">
                <LocalizedLink to="/" className="menu-logo">
                  {renderBrand({ textColor: '#0F172A', iconSize: 38 })}
                </LocalizedLink>
                <LocalizedLink to="/" className="menu-logo menu-logo-dark">
                  {renderBrand({ textColor: '#0F172A', iconSize: 38 })}
                </LocalizedLink>
                <a id="menu_close" className="menu-close" href="#">
                  <i className="material-icons-outlined">close</i>
                </a>
              </div>
              <div className="mobile-search">
                <input type="text" className="form-control form-control-lg" placeholder={t('common.search')} />
              </div>

              <ul className="main-nav">
                <li className={navActive.home ? 'active' : ''}>
                  <LocalizedLink to="/">{t('navigation.home')}</LocalizedLink>
                </li>
                <li className={navActive.buy ? 'active' : ''}>
                  <LocalizedLink to="/buy-property-grid">{t('navigation.buyProperty')}</LocalizedLink>
                </li>
{/* <li className="has-submenu">
                      <a href="#">{t('navigation.buyProperty')}</a>
                      <ul className="submenu">
                        <li><LocalizedLink to="/buy-property-grid">{t('navigation.buyProperty')}</LocalizedLink></li>
                        <li><LocalizedLink to="/buy-property-grid-sidebar">{t('navigation.buyGridSidebar')}</LocalizedLink></li>
                      </ul>
                    </li> */}

                <li className={navActive.rent ? 'active' : ''}>
                  <LocalizedLink to="/rent-property-grid">{t('navigation.rentProperty')}</LocalizedLink>
                </li>
                <li className={navActive.agency ? 'active' : ''}>
                  <LocalizedLink to="/agency-grid">{t('navigation.agency')}</LocalizedLink>
                </li>
                <li className={navActive.about ? 'active' : ''}>
                  <LocalizedLink to="/about-us">{t('navigation.aboutUs')}</LocalizedLink>
                </li>
                <li className={navActive.contact ? 'active' : ''}>
                  <LocalizedLink to="/contact-us">{t('navigation.contactUs')}</LocalizedLink>
                </li>
              </ul>

              <div className="menu-dropdown">
                <LanguageSwitcher />
                <div className="dropdown">
                  <a href="#" className="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    {t('common.light')}
                  </a>
                  <ul className="dropdown-menu mt-2">
                    <li><a className="dropdown-item light-mode" href="#">{t('common.light')}</a></li>
                    <li><a className="dropdown-item dark-mode" href="#">{t('common.dark')}</a></li>
                  </ul>
                </div>
              </div>

              <div className="menu-login">
                {currentUser ? (
                  <>
                    <div className="d-flex align-items-center mb-3 p-1">
                      <div className="flex-shrink-0 overflow-hidden d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb' }}>
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={getUserDisplayName(currentUser)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className="text-white d-flex align-items-center justify-content-center" style={{ background: 'var(--bs-primary, #0d6efd)', width: '100%', height: '100%', borderRadius: '50%', fontWeight: 700, fontSize: '14px' }}>
                            {getUserInitials(currentUser)}
                          </div>
                        )}
                      </div>
                      <div className="ms-2">
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>{getUserDisplayName(currentUser)}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{currentUser.role || 'Member'}</div>
                      </div>
                    </div>
                    {canAccessBackoffice && (
                      <button
                        className="btn btn-dark w-100 mb-2 d-inline-flex align-items-center justify-content-center"
                        onClick={handleOpenBackoffice}
                      >
                        <i className="material-icons-outlined me-1" style={{ fontSize: '18px' }}>dashboard_customize</i>
                        Backoffice
                      </button>
                    )}
                    <LocalizedLink to="/profile-settings" className="btn btn-outline-primary w-100 mb-2 d-inline-flex align-items-center justify-content-center">
                      <i className="material-icons-outlined me-1" style={{ fontSize: '18px' }}>person_outline</i>Profile Settings
                    </LocalizedLink>
                    <button className="btn btn-danger w-100 d-inline-flex align-items-center justify-content-center" onClick={handleLogout}>
                      <i className="material-icons-outlined me-1" style={{ fontSize: '18px' }}>logout</i>Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <LocalizedLink to="/login" className="btn btn-primary w-100 mb-2">{t('common.signIn')}</LocalizedLink>
                    <LocalizedLink to="/signup" className="btn btn-secondary w-100">{t('common.register')}</LocalizedLink>
                  </>
                )}
              </div>
            </div>

            <div className="nav header-items">
              <LocalizedLink to="/index-3" className="topbar-link btn btn-light topbar-search" data-bs-toggle="modal" data-bs-target="#search-modal">
                <i className="material-icons-outlined">search</i>
              </LocalizedLink>

              <div className="dropdown topbar-lang">
                <a className="topbar-link btn btn-light" data-bs-toggle="dropdown">
                  <img 
                    src={`/assets/img/flags/${getLanguageFlag()}.svg`}
                    alt={t('languages.language')} 
                    height="16" 
                  />
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a 
                    href="#" 
                    className={`dropdown-item d-flex align-items-center ${getCurrentLanguage() === 'en' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      changeLanguage('en');
                    }}
                  >
                    <img src="/assets/img/flags/us.svg" alt="" className="me-2" height="16" /> 
                    <span className="align-middle">{t('languages.english')}</span>
                  </a>
                  <a 
                    href="#" 
                    className={`dropdown-item d-flex align-items-center ${getCurrentLanguage() === 'fr' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      changeLanguage('fr');
                    }}
                  >
                    <img src="/assets/img/flags/fr.svg" alt="" className="me-2" height="16" /> 
                    <span className="align-middle">{t('languages.french')}</span>
                  </a>
                  <a 
                    href="#" 
                    className={`dropdown-item d-flex align-items-center ${getCurrentLanguage() === 'de' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      changeLanguage('de');
                    }}
                  >
                    <img src="/assets/img/flags/de.svg" alt="" className="me-2" height="16" /> 
                    <span className="align-middle">{t('languages.german')}</span>
                  </a>
                  <a 
                    href="#" 
                    className={`dropdown-item d-flex align-items-center ${getCurrentLanguage() === 'it' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      changeLanguage('it');
                    }}
                  >
                    <img src="/assets/img/flags/it.svg" alt="" className="me-2" height="16" /> 
                    <span className="align-middle">{t('languages.italian')}</span>
                  </a>
                </div>
              </div>

            

              {currentUser ? (
                <div className="dropdown topbar-profile d-flex">
                  <a href="#" className="avatar" data-bs-toggle="dropdown" onClick={(e) => e.preventDefault()}>
                    <div className="avatar-md avatar-rounded overflow-hidden d-flex align-items-center justify-content-center" style={{ background: '#e5e7eb', width: '40px', height: '40px', borderRadius: '50%' }}>
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={getUserDisplayName(currentUser)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="text-white d-flex align-items-center justify-content-center" style={{ background: 'var(--bs-primary, #0d6efd)', width: '100%', height: '100%', borderRadius: '50%', fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>
                          {getUserInitials(currentUser)}
                        </div>
                      )}
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <div className="d-flex align-items-center user-profile">
                      <div className="avatar-md avatar-rounded overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0" style={{ background: '#e5e7eb', width: '42px', height: '42px', borderRadius: '50%' }}>
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={getUserDisplayName(currentUser)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className="text-white d-flex align-items-center justify-content-center" style={{ background: 'var(--bs-primary, #0d6efd)', width: '100%', height: '100%', borderRadius: '50%', fontWeight: 700, fontSize: '15px' }}>
                            {getUserInitials(currentUser)}
                          </div>
                        )}
                      </div>
                      <div className="ms-2">
                        <h6 className="mb-1">{getUserDisplayName(currentUser)}</h6>
                        <span className="d-block">{currentUser.role || 'Member'}</span>
                      </div>
                    </div>
                    {canAccessBackoffice && (
                      <button
                        className="dropdown-item d-inline-flex align-items-center w-100 text-start"
                        style={{ background: 'none', border: 'none' }}
                        onClick={handleOpenBackoffice}
                      >
                        <i className="material-icons-outlined me-2">dashboard_customize</i>Backoffice
                      </button>
                    )}
                    <LocalizedLink to="/profile-settings" className="dropdown-item d-inline-flex align-items-center">
                      <i className="material-icons-outlined me-2">person_outline</i>Profile Settings
                    </LocalizedLink>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item d-inline-flex align-items-center link-danger w-100 text-start" style={{ background: 'none', border: 'none' }} onClick={handleLogout}>
                      <i className="material-icons-outlined me-2">logout</i>Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <LocalizedLink to="/login" className="btn btn-lg btn-primary d-inline-flex align-items-center">
                    <i className="material-icons-outlined me-1">lock</i>{t('common.signIn')}
                  </LocalizedLink>
                  <LocalizedLink to="/signup" className="btn btn-lg btn-dark d-inline-flex align-items-center">
                    <i className="material-icons-outlined me-1">perm_identity</i>{t('common.register')}
                  </LocalizedLink>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;