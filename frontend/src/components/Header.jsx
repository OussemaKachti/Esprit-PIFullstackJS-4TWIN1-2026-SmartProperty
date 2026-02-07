import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    
    // Update URL based on language
    const currentPath = location.pathname;
    let newPath;
    
    if (lang === 'en') {
      // Remove /fr prefix for English
      newPath = currentPath.replace(/^\/fr/, '') || '/';
    } else if (lang === 'fr') {
      // Add /fr prefix for French
      if (currentPath.startsWith('/fr')) {
        newPath = currentPath;
      } else {
        newPath = '/fr' + currentPath;
      }
    }
    
    navigate(newPath);
  };

  const getCurrentLanguage = () => {
    return i18n.language || 'en';
  };

  const getLanguageFlag = () => {
    const lang = getCurrentLanguage();
    switch(lang) {
      case 'fr': return 'fr';
      case 'de': return 'de';
      case 'it': return 'it';
      case 'en':
      default: return 'us';
    }
  };

  return (
    <div className="main-header-two">
      <header className="header header-three">
        <div className="container">
          <nav className="navbar navbar-expand-lg header-nav">
            <div className="navbar-header">
              <Link to="/" className="navbar-brand logo">
                <img src="/assets/img/logo-white.svg" className="img-fluid" alt="Logo" />
              </Link>
              <Link to="/" className="navbar-brand logo-dark">
                <img src="/assets/img/logo.svg" className="img-fluid" alt="Logo" />
              </Link>
              <a id="mobile_btn" href="#">
                <i className="material-icons-outlined">menu</i>
              </a>
            </div>

            <div className="main-menu-wrapper">
              <div className="menu-header">
                <Link to="/" className="menu-logo">
                  <img src="/assets/img/logo.svg" className="img-fluid" alt="Logo" />
                </Link>
                <Link to="/" className="menu-logo menu-logo-dark">
                  <img src="/assets/img/logo-white.svg" className="img-fluid" alt="Logo" />
                </Link>
                <a id="menu_close" className="menu-close" href="#">
                  <i className="material-icons-outlined">close</i>
                </a>
              </div>
              <div className="mobile-search">
                <input type="text" className="form-control form-control-lg" placeholder={t('common.search')} />
              </div>

              <ul className="main-nav">
                <li className="has-submenu megamenu active">
                  <Link to="/">{t('navigation.home')} </Link>
                </li>
                <li className="has-submenu">
                  <a href="#">{t('navigation.listing')} <i className="material-icons-outlined">expand_more</i></a>
                  <ul className="submenu">
                    <li className="has-submenu">
                      <a href="#">{t('navigation.buyProperty')}</a>
                      <ul className="submenu">
                        <li><Link to="/buy-property-grid">{t('navigation.buyGrid')}</Link></li>
                        <li><Link to="/buy-property-list">{t('navigation.buyList')}</Link></li>
                        <li><Link to="/buy-property-grid-sidebar">{t('navigation.buyGridSidebar')}</Link></li>
                        <li><Link to="/buy-property-list-sidebar">{t('navigation.buyListSidebar')}</Link></li>
                        <li><Link to="/buy-grid-map">{t('navigation.buyGridMap')}</Link></li>
                        <li><Link to="/buy-list-map">{t('navigation.buyListMap')}</Link></li>
                        <li><Link to="/buy-details">{t('navigation.buyDetails')}</Link></li>
                      </ul>
                    </li>
                    <li className="has-submenu">
                      <a href="#">{t('navigation.rentProperty')}</a>
                      <ul className="submenu">
                        <li><Link to="/rent-property-grid">{t('navigation.rentGrid')}</Link></li>
                        <li><Link to="/rent-property-list">{t('navigation.rentList')}</Link></li>
                        <li><Link to="/rent-property-grid-sidebar">{t('navigation.rentGridSidebar')}</Link></li>
                        <li><Link to="/rent-property-list-sidebar">{t('navigation.rentListSidebar')}</Link></li>
                        <li><Link to="/rent-grid-map">{t('navigation.rentGridMap')}</Link></li>
                        <li><Link to="/rent-list-map">{t('navigation.rentListMap')}</Link></li>
                        <li><Link to="/rent-details">{t('navigation.rentDetails')}</Link></li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li className="has-submenu">
                  <a href="#">{t('navigation.agent')} <i className="material-icons-outlined">expand_more</i></a>
                  <ul className="submenu">
                    <li><Link to="/agent-grid">{t('navigation.agentGrid')}</Link></li>
                    <li><Link to="/agent-list">{t('navigation.agentList')}</Link></li>
                    <li><Link to="/agent-grid-sidebar">{t('navigation.agentGridSidebar')}</Link></li>
                    <li><Link to="/agent-list-sidebar">{t('navigation.agentListSidebar')}</Link></li>
                    <li><Link to="/agent-details">{t('navigation.agentDetails')}</Link></li>
                  </ul>
                </li>
                <li className="has-submenu">
                  <a href="#">{t('navigation.agency')} <i className="material-icons-outlined">expand_more</i></a>
                  <ul className="submenu">
                    <li><Link to="/agency-grid">{t('navigation.agencyGrid')}</Link></li>
                    <li><Link to="/agency-list">{t('navigation.agencyList')}</Link></li>
                    <li><Link to="/agency-grid-sidebar">{t('navigation.agencyGridSidebar')}</Link></li>
                    <li><Link to="/agency-list-sidebar">{t('navigation.agencyListSidebar')}</Link></li>
                    <li><Link to="/agency-details">{t('navigation.agencyDetails')}</Link></li>
                  </ul>
                </li>
                <li className="has-submenu">
                  <a href="#">{t('navigation.pages')} <i className="material-icons-outlined">expand_more</i></a>
                  <ul className="submenu">
                    <li><Link to="/about-us">{t('navigation.aboutUs')}</Link></li>
                    <li className="has-submenu">
                      <a href="#">{t('navigation.authentication')}</a>
                      <ul className="submenu">
                        <li><Link to="/signup">{t('navigation.signUp')}</Link></li>
                        <li><Link to="/login">{t('navigation.signIn')}</Link></li>
                        <li><Link to="/forgot-password">{t('navigation.forgotPassword')}</Link></li>
                        <li><Link to="/reset-password">{t('navigation.resetPassword')}</Link></li>
                      </ul>
                    </li>
                    <li><Link to="/invoice-details">{t('navigation.invoiceDetails')}</Link></li>
                    <li><Link to="/contact-us">{t('navigation.contactUs')}</Link></li>
                    <li><Link to="/wishlist">{t('navigation.wishlist')}</Link></li>
                    <li className="has-submenu">
                      <a href="#">{t('navigation.errorPage')}</a>
                      <ul className="submenu">
                        <li><Link to="/error-404">{t('navigation.error404')}</Link></li>
                        <li><Link to="/error-500">{t('navigation.error500')}</Link></li>
                      </ul>
                    </li>
                    <li><Link to="/pricing">{t('navigation.pricing')}</Link></li>
                    <li><Link to="/faq">{t('navigation.faq')}</Link></li>
                    <li><Link to="/gallery">{t('navigation.gallery')}</Link></li>
                    <li><Link to="/our-team">{t('navigation.ourTeam')}</Link></li>
                    <li><Link to="/testimonial">{t('navigation.testimonials')}</Link></li>
                    <li><Link to="/terms-condition">{t('navigation.termsConditions')}</Link></li>
                    <li><Link to="/privacy-policy">{t('navigation.privacyPolicy')}</Link></li>
                    <li><Link to="/maintenance">{t('navigation.maintenance')}</Link></li>
                    <li><Link to="/coming-soon">{t('navigation.comingSoon')}</Link></li>
                  </ul>
                </li>
                <li className="has-submenu">
                  <a href="#">{t('navigation.blog')} <i className="material-icons-outlined">expand_more</i></a>
                  <ul className="submenu">
                    <li><Link to="/blog-list">{t('navigation.blogList')}</Link></li>
                    <li><Link to="/blog-grid">{t('navigation.blogGrid')}</Link></li>
                    <li><Link to="/blog-details">{t('navigation.blogDetails')}</Link></li>
                  </ul>
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
                <Link to="/login" className="btn btn-primary w-100 mb-2">{t('common.signIn')}</Link>
                <Link to="/signup" className="btn btn-secondary w-100">{t('common.register')}</Link>
              </div>
            </div>

            <div className="nav header-items">
              <Link to="/index-3" className="topbar-link btn btn-light topbar-search" data-bs-toggle="modal" data-bs-target="#search-modal">
                <i className="material-icons-outlined">search</i>
              </Link>

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

            

              <Link to="/login" className="btn btn-lg btn-primary d-inline-flex align-items-center">
                <i className="material-icons-outlined me-1">lock</i>{t('common.signIn')}
              </Link>

              <Link to="/signup" className="btn btn-lg btn-dark d-inline-flex align-items-center">
                <i className="material-icons-outlined me-1">perm_identity</i>{t('common.register')}
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;