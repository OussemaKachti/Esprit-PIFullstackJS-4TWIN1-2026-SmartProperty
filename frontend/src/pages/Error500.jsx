import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Error500 = () => {
  useEffect(() => {
    // Force enable scrolling
    const enableScrolling = () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
      document.documentElement.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
    };
    enableScrolling();

    // Initialize plugins
    const initializePlugins = () => {
      enableScrolling();
      if (window.AOS) {
        window.AOS.refresh();
        window.AOS.init({ duration: 1200, once: true });
      }
      if (window.jQuery && window.jQuery.fn.select2) {
        window.jQuery('.select2').select2({ minimumResultsForSearch: -1 });
      }
      if (window.jQuery) {
        window.jQuery('#mobile_btn').off('click').on('click', function() {
          window.jQuery('.main-menu-wrapper').addClass('open');
        });
        window.jQuery('#menu_close').off('click').on('click', function() {
          window.jQuery('.main-menu-wrapper').removeClass('open');
        });
        window.jQuery('.has-submenu > a').off('click').on('click', function(e) {
          if (window.jQuery(window).width() < 992) {
            e.preventDefault();
            window.jQuery(this).parent().toggleClass('open');
            window.jQuery(this).parent().find('.submenu').first().slideToggle();
          }
        });
      }
    };
    const timer = setTimeout(initializePlugins, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      overflow: 'visible',
      position: 'relative',
      width: '100%'
    }}>


    
	<div className="main-wrapper">

		
       <div className="container-fuild">
        <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 z-1">
            <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
                <div className="col-lg-6">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <div className="error-images mb-4">
                            <img src="/assets/img/error/error-500.svg" alt="image" className="img-fluid" />
                        </div>
                        <div className="text-center">
                            <h4 className="mb-2">500 Unexpected Error</h4>
                            <p className="text-center">WeÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢re having some issues at the moment. weÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ll have it fixed in no time.</p>
                            <div className="d-flex justify-content-center">
                                <Link to="/" className="btn btn-dark d-flex align-items-center">Back to Home</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    

    </div>
    </div>
  );
};

export default Error500;



