import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLanguageFromPath, localizeRoute, stripLanguagePrefix } from '../routes/routeConfig';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);

    // Keep the current route/query/hash and only swap language prefix.
    const cleanPath = stripLanguagePrefix(location.pathname || '/');
    const localized = localizeRoute(cleanPath || '/', lng);
    navigate(`${localized}${location.search || ''}${location.hash || ''}`);
  };

  return (
    <div className="dropdown">
      <a 
        href="#" 
        className="dropdown-toggle" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        {currentLang === 'fr' ? (
          <>
            <img src="/assets/img/flags/fr.svg" alt={t('languages.french')} height="16" />
            {t('languages.french')}
          </>
        ) : currentLang === 'de' ? (
          <>
            <img src="/assets/img/flags/de.svg" alt={t('languages.german')} height="16" />
            {t('languages.german')}
          </>
        ) : currentLang === 'it' ? (
          <>
            <img src="/assets/img/flags/it.svg" alt={t('languages.italian')} height="16" />
            {t('languages.italian')}
          </>
        ) : (
          <>
            <img src="/assets/img/flags/us.svg" alt={t('languages.english')} height="16" />
            {t('languages.english')}
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
            <span className="align-middle">{t('languages.english')}</span>
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
            <span className="align-middle">{t('languages.french')}</span>
          </a>
        </li>
        <li>
          <a
            className="dropdown-item"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changeLanguage('de');
            }}
          >
            <img src="/assets/img/flags/de.svg" alt="" className="me-2" height="16" />
            <span className="align-middle">{t('languages.german')}</span>
          </a>
        </li>
        <li>
          <a
            className="dropdown-item"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              changeLanguage('it');
            }}
          >
            <img src="/assets/img/flags/it.svg" alt="" className="me-2" height="16" />
            <span className="align-middle">{t('languages.italian')}</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default LanguageSwitcher;