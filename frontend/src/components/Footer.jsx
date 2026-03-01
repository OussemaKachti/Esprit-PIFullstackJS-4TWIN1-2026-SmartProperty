import React from 'react';
import { useTranslation } from 'react-i18next';
import LocalizedLink from './LocalizedLink';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer-three footer-dark">
      <div className="footer-bg">
        <img src="/assets/img/bg/footer-bg-01.png" className="bg-1" alt="" />
        <img src="/assets/img/bg/footer-bg-02.png" className="bg-2" alt="" />
        <img src="/assets/img/bg/footer-bg-03.png" className="bg-3" alt="" />
      </div>
      <div className="container">
        <div className="footer-top">
          <div className="row gy-4">
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">{t('footer.pages')}</h5>
                <ul className="footer-menu">
                  <li><LocalizedLink to="/our-team">{t('navigation.ourTeam')}</LocalizedLink></li>
                  <li><LocalizedLink to="/pricing">{t('navigation.pricing')}</LocalizedLink></li>
                  <li><LocalizedLink to="/gallery">{t('navigation.gallery')}</LocalizedLink></li>
                  <li><LocalizedLink to="/buy-property-list">{t('footer.listings')}</LocalizedLink></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">{t('footer.company')}</h5>
                <ul className="footer-menu">
                  <li><LocalizedLink to="/about-us">{t('footer.aboutUs')}</LocalizedLink></li>
                  <li><LocalizedLink to="/add-property-buy">{t('footer.addListing')}</LocalizedLink></li>
                  <li><LocalizedLink to="/contact-us">{t('footer.contactUs')}</LocalizedLink></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">{t('footer.destinations')}</h5>
                <ul className="footer-menu">
                  <li><LocalizedLink to="/buy-property-grid?city=Tunis">{t('propertySection.location1')}</LocalizedLink></li>
                  <li><LocalizedLink to="/buy-property-grid?city=Sousse">{t('propertySection.location2')}</LocalizedLink></li>
                  <li><LocalizedLink to="/buy-property-grid?city=Sfax">{t('propertySection.location3')}</LocalizedLink></li>
                  <li><LocalizedLink to="/buy-property-grid?city=Nabeul">{t('propertySection.location4')}</LocalizedLink></li>
                  <li><LocalizedLink to="/buy-property-grid?city=Hammamet">{t('propertySection.location5')}</LocalizedLink></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">{t('footer.quick_links')}</h5>
                <ul className="footer-menu">
                  <li><LocalizedLink to="/privacy-policy">{t('footer.privacyPolicy')}</LocalizedLink></li>
                  <li><LocalizedLink to="/terms-condition">{t('footer.termsConditions')}</LocalizedLink></li>
                  <li><LocalizedLink to="/contact-us">{t('footer.contactUs')}</LocalizedLink></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-middle">
          <div className="row justify-content-xl-between align-items-center gy-4">
            <div className="col-xl-4">
              <div className="social-icon">
                <a href="#"><i className="fa-brands fa-facebook"></i></a>
                <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
                <a href="#"><i className="fa-brands fa-linkedin"></i></a>
                <a href="#"><i className="fa-brands fa-pinterest"></i></a>
              </div>
            </div>

            <div className="col-xl-7">
              <div className="row justify-content-center gy-4">
                <div className="col-md-4 col-sm-6">
                  <div className="contact-info">
                    <span className="bg-primary"><i className="material-icons-outlined">headphones</i></span>
                    <div>
                      <p>{t('footer.call_us')}</p>
                      <h6>+216 70 000 000</h6>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="contact-info">
                    <span className="bg-secondary"><i className="material-icons-outlined">message</i></span>
                    <div>
                      <p>{t('footer.email_us')}</p>
                      <h6>contact@smartproperty.tn</h6>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="contact-info">
                    <span className="bg-danger"><i className="material-icons-outlined">phone</i></span>
                    <div>
                      <p>{t('footer.visit_us')}</p>
                      <h6>{t('footer.address')}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="text-center">
          <p className="copy-right">{t('footer.copyright', { year: new Date().getFullYear().toString() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;