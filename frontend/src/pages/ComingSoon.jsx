import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = () => {
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


    
	<div className="main-wrapper auth-cover">

		
        <div className="container-fuild">
            <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 coming-soon-cover">
                
                <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
                    <div className="col-lg-10 mx-auto">
                        <div className="coming-soon-item">
                            <div className="d-flex flex-column align-items-center justify-content-center">
                                <div>
                                    <h1>Coming Soon</h1>
                                    <div className="row align-items-center">
                                        <div className="col-md-7 mx-auto px-4">
                                            <ul className="d-flex list-unstyled align-items-center justify-content-center mb-3">
                                                <li className="me-sm-3 me-2">
                                                    <div className="timer-cover">
                                                        <h6 className="days fw-bold mb-0">54</h6>
                                                    </div>
                                                    <p className="text-center mb-0">Days</p>
                                                </li>
                                                <li className="me-sm-3 mb-2 me-2">:</li>
                                                <li className="me-sm-3 me-2">
                                                    <div className="timer-cover">
                                                        <h6 className="hours mb-0">02</h6>
                                                    </div>
                                                    <p className="text-center mb-0">Hours</p>
                                                </li>
                                                <li className="me-sm-3 mb-2 me-2">:</li>
                                                <li className="me-sm-3 me-2">
                                                    <div className="timer-cover">
                                                        <h6 className="minutes mb-0">54</h6>
                                                    </div>
                                                    <p className="text-center mb-0">Minutes</p>
                                                </li>
                                                <li className="me-sm-3 mb-2 me-2">:</li>
                                                <li>
                                                    <div className="timer-cover">
                                                        <h6 className="seconds mb-0">10</h6>
                                                    </div>
                                                    <p className="text-center mb-0">Seconds</p>
                                                </li>
                                            </ul>
                                            <div className="mb-3">
                                                <div className="mb-3">
                                                    <p className="d-flex text-center justify-content-center">Our website is under constructions currently. Don't worry! We will coming within a short time. Stay with us </p>
                                                </div>
                                                <div className="subscribe-form">
                                                    <input type="email" className="form-control me-2" placeholder="Enter  Your Email" />
                                                    <a href="#" className="btn btn-secondary">Submit</a>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-center">
                                                <Link to="/" className="btn btn-dark">Back to Home</Link>
                                            </div>
                                        </div>
                                    </div>
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

export default ComingSoon;



