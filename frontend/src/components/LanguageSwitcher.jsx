import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    
    // Update URL path
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(en|fr)/, '') || '/';
    
    if (lng === 'en') {
      window.history.pushState({}, '', pathWithoutLang);
    } else {
      window.history.pushState({}, '', `/${lng}${pathWithoutLang}`);
    }
  };

  return (
    <div className="dropdown">
      <a 
        href="#" 
        className="dropdown-toggle" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        {currentLang === 'en' ? (
          <>
            <img src="/assets/img/flags/us.svg" alt="English" height="16" />
            English
          </>
        ) : (
          <>
            <img src="/assets/img/flags/fr.svg" alt="Français" height="16" />
            Français
          </>
        )}
      </a>
      <ul className="dropdown-menu mt-2">
        <li>
          <a 
            className="dropdown-item" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changeLanguage('en');
            }}
          >
            <img src="/assets/img/flags/us.svg" alt="" className="me-2" height="16" />
            <span className="align-middle">English</span>
          </a>
        </li>
        <li>
          <a 
            className="dropdown-item" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changeLanguage('fr');
            }}
          >
            <img src="/assets/img/flags/fr.svg" alt="" className="me-2" height="16" />
            <span className="align-middle">Français</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default LanguageSwitcher;