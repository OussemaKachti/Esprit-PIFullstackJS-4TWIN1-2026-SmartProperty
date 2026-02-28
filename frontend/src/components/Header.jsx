import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import LocalizedLink from './LocalizedLink';
import { localizeRoute, getLanguageFromPath } from '../routes/routeConfig';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    
    // Update URL based on language using the route utility
    const currentPath = location.pathname;
    const newPath = localizeRoute(currentPath, lang);
    
    navigate(newPath);
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

  return (
    <div className="main-header-two">
      <header className="header header-three">
        <div className="container">
          <nav className="navbar navbar-expand-lg header-nav">
            <div className="navbar-header">
              <LocalizedLink to="/" className="navbar-brand logo">
                <img src="/assets/img/logo-white.svg" className="img-fluid" alt="Logo" />
              </LocalizedLink>
              <LocalizedLink to="/" className="navbar-brand logo-dark">
                <img src="/assets/img/logo.svg" className="img-fluid" alt="Logo" />
              </LocalizedLink>
              <a id="mobile_btn" href="#">
                <i className="material-icons-outlined">menu</i>
              </a>
            </div>

            <div className="main-menu-wrapper">
              <div className="menu-header">
                <LocalizedLink to="/" className="menu-logo">
                  <img src="/assets/img/logo.svg" className="img-fluid" alt="Logo" />
                </LocalizedLink>
                <LocalizedLink to="/" className="menu-logo menu-logo-dark">
                  <img src="/assets/img/logo-white.svg" className="img-fluid" alt="Logo" />
                </LocalizedLink>
                <a id="menu_close" className="menu-close" href="#">
                  <i className="material-icons-outlined">close</i>
                </a>
              </div>
              <div className="mobile-search">
                <input type="text" className="form-control form-control-lg" placeholder={t('common.search')} />
              </div>

              <ul className="main-nav">
                <li className="active">
                  <LocalizedLink to="/">{t('navigation.home')}</LocalizedLink>
                </li>
                <li className="has-submenu">
                  <a href="#">{t('navigation.buyProperty')} <i className="material-icons-outlined">expand_more</i></a>
                  <ul className="submenu">
                    <li><LocalizedLink to="/buy-property-grid">{t('navigation.buyGrid')}</LocalizedLink></li>
                    <li><LocalizedLink to="/buy-property-list">{t('navigation.buyList')}</LocalizedLink></li>
                  </ul>
                </li>
                <li className="has-submenu">
                  <a href="#">{t('navigation.rentProperty')} <i className="material-icons-outlined">expand_more</i></a>
                  <ul className="submenu">
                    <li><LocalizedLink to="/rent-property-grid">{t('navigation.rentGrid')}</LocalizedLink></li>
                    <li><LocalizedLink to="/rent-property-list">{t('navigation.rentList')}</LocalizedLink></li>
                  </ul>
                </li>
                <li className="has-submenu">
                  <a href="#">{t('navigation.agency')} <i className="material-icons-outlined">expand_more</i></a>
                  <ul className="submenu">
                    <li><LocalizedLink to="/agency-grid">{t('navigation.agencyGrid')}</LocalizedLink></li>
                    <li><LocalizedLink to="/agency-list">{t('navigation.agencyList')}</LocalizedLink></li>
                  </ul>
                </li>
                <li><LocalizedLink to="/about-us">{t('navigation.aboutUs')}</LocalizedLink></li>
                <li><LocalizedLink to="/contact-us">{t('navigation.contactUs')}</LocalizedLink></li>
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
                <LocalizedLink to="/login" className="btn btn-primary w-100 mb-2">{t('common.signIn')}</LocalizedLink>
                <LocalizedLink to="/signup" className="btn btn-secondary w-100">{t('common.register')}</LocalizedLink>
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

            

              <LocalizedLink to="/login" className="btn btn-lg btn-primary d-inline-flex align-items-center">
                <i className="material-icons-outlined me-1">lock</i>{t('common.signIn')}
              </LocalizedLink>

              <LocalizedLink to="/signup" className="btn btn-lg btn-dark d-inline-flex align-items-center">
                <i className="material-icons-outlined me-1">perm_identity</i>{t('common.register')}
              </LocalizedLink>
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;