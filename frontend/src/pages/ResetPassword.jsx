import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
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

		
		<div className="container-fuild position-relative z-1">
			<div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 sign-">
				
				<div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap py-3">
					<div className="col-md-8 col-lg-6 col-xl-4 mx-auto">
						<div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
							<div className=" mx-auto mb-4 text-center">
								<img src="/assets/img/logo.svg" className="img-fluid" alt="Logo" />
							</div>
							<div>
								<div className="login-item-01">
									<h4>Reset Password</h4>
									<div className="mb-3">
										<label className="form-label">Password<span className="text-danger ms-1">*</span></label>
										<div className="position-relative form-cover password">
											<input type="password" className="pass-input form-control" />
											<i className="material-icons-outlined">lock</i>
											<span className="fas toggle-password fa-eye-slash"></span>
										</div>
									</div>
									<div className="mb-3">
										<label className="form-label">Confirm Password<span className="text-danger ms-1">*</span></label>
										<div className="position-relative form-cover password">
											<input type="password" className="pass-inputs form-control" />
											<i className="material-icons-outlined">lock</i>
											<span className="fas toggle-passwords fa-eye-slash"></span>
										</div>
									</div>
									<div className="d-flex align-items-center mb-4">
										<div className="d-flex align-items-center">
											<div className="form-check form-check-md mb-0">
												<input className="form-check-input" id="remember_me" type="checkbox" />
												<label htmlFor="remember_me" className="mt-0">Remember Me</label>
											</div>
										</div>
									</div>
									<div className="mb-3">
										<Link to="/login" className="btn btn-lg bg-primary text-white w-100">Reset Password</Link>
									</div>
									<div className="text-center">
										<h6 className="fw-normal fs-14 text-dark mb-0">Return to
											<Link to="/login" className="register-btn">Sign In</Link>
										</h6>
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

export default ResetPassword;



