import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ContactUs = () => {
	const { t } = useTranslation();
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

        


		
		<div className="page-wrapper">

            
            <div className="breadcrumb-bar">
                <img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
                <img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
                <img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
                <div className="row align-items-center text-center position-relative z-1">
                    <div className="col-md-12 col-12 breadcrumb-arrow">
						<h1 className="breadcrumb-title">{t('contactPage.title')}</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
								<li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>{t('navigation.home')}</Link></li>
								<li className="breadcrumb-item active" aria-current="page">{t('contactPage.title')}</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			<div className="contact-us-wrap-01">

				<div className="container">

					
					<div className="row align-items-center row-gap-3">
						<div className="col-lg-6">
							<div className="card border-0">
								<div className="card-body p-4">
									<h4 className="mb-2">{t('contactPage.salesTeamTitle')}</h4>
									<p className="mb-3">{t('contactPage.salesTeamDesc')}</p>
									<p className="fw-semibold mb-0">{t('contactPage.tollFree')}</p>
								</div>
							</div>
							<div className="card border-0 mb-0">
								<div className="card-body p-4">
									<h4 className="mb-2">{t('contactPage.productSupportTitle')}</h4>
									<p className="mb-3">{t('contactPage.productSupportDesc')}</p>
									<Link to="/faq" className="btn btn-dark">{t('contactPage.goToFaq')}</Link>
								</div>
							</div>
						</div>
						<div className="col-lg-6">
							<div className="ms-0 ms-lg-4">
								<img src="/assets/img/contact-us/contact-us-img-01.jpg" alt="img" className="img-fluid" />
							</div>
						</div>
					</div>
					

				</div>

			</div>

			<div className="contact-us-wrap-02">
			
				<div className="container">

					
					<div className="row">
						<div className="col-lg-12 mx-auto">

							
							<div className="row align-items-center justify-content-center mb-3">
								<div className="col-md-6 col-lg-4">
									<div className="contact-us-item-01">
										<div className="d-flex align-items-center">
											<span className="material-icons-outlined">mail</span>
											<div>
												<h6 className="mb-2">{t('contactPage.emailAddress')}</h6>
												<p className="mb-0"></p>
												<p className="mb-0"></p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 col-lg-4">
									<div className="contact-us-item-01">
										<div className="d-flex align-items-center">
											<span className="material-icons-outlined">call</span>
											<div>
												<h6 className="mb-2">{t('contactPage.phoneNumber')}</h6>
												<p className="mb-0">+216 93 320 122</p>
												<p className="mb-0">+216 54 141 968</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 col-lg-4">
									<div className="contact-us-item-01">
										<div className="d-flex align-items-center">
											<span className="material-icons-outlined">location_on</span>
											<div>
												<h6 className="mb-2">{t('contactPage.address')}</h6>
												<p className="mb-0">{t('contactPage.addressValue')}</p>
											</div>
										</div>
									</div>
								</div>
							</div>
							

						</div>
					</div>
					

					
					<div className="row align-items-center row-gap-3">
						<div className="col-lg-6">
							<img src="/assets/img/contact-us/contact-us-img-02.jpg" alt="img" className="img-fluid" />
						</div>
						<div className="col-lg-6">
							<div className="contact-us-item-02">
								<h2>{t('contactPage.getInTouch')}</h2>
								
								<div className="row">
									<div className="col-md-12">
										<div className="mb-3">
											<label className="form-label">{t('contactPage.yourName')}</label>
											<input type="text" className="form-control" />
										</div>
									</div>
									<div className="col-md-6">
										<div className="mb-3">
											<label className="form-label">{t('contactPage.phoneNumber')}</label>
											<input type="text" className="form-control" id="phone" />
										</div>
									</div>
									<div className="col-md-6">
										<div className="mb-3">
											<label className="form-label">{t('contactPage.email')}</label>
											<input type="text" className="form-control" />
										</div>
									</div>
									<div className="col-md-6">
										<div className="mb-3">
											<label className="form-label">{t('contactPage.country')}</label>
											<select className="select">
												<option>{t('contactPage.select')}</option>
												<option>{t('contactPage.tunisia')}</option>
												<option>{t('contactPage.algeria')}</option>
												<option>{t('contactPage.morocco')}</option>
												<option>{t('contactPage.mauritania')}</option>
											</select>
										</div>
									</div>
									<div className="col-md-6">
										<div className="mb-3">
											<label className="form-label">{t('contactPage.subject')}</label>
											<input type="text" className="form-control" />
										</div>
									</div>
									<div className="col-md-12">
										<div className="mb-3">
											<label className="form-label">{t('contactPage.description')}</label>
											<textarea className="form-control" rows="3" placeholder={t('contactPage.commentsPlaceholder')}></textarea>
										</div>
									</div>
									<div className="col-md-12">
										<a href="#" className="btn btn-lg btn-dark">{t('contactPage.submitEnquiry')}</a>
									</div>
								</div>
								
							</div>
						</div>
					</div>
					

				</div>
					
			</div>
			
			<div className="google-map">
				<iframe className="rounded-0" src="https://maps.google.com/maps?q=P%C3%B4le%20Technologique%2C%201%2C%202%20rue%20Andr%C3%A9%20Amp%C3%A8re%2C%20Cebalat%202083&z=17&output=embed" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
			</div>

		</div>

		


		

		
		<div className="modal fade" id="search-modal" tabIndex="-1" aria-hidden="true">
			<div className="modal-dialog  modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-body search-wrap">
						<form className="search-form" id="search-form" action="rent-property-grid.html">
							<div className="d-flex align-items-center justify-content-between mb-4">
								<h5>{t('propertyPages.whatLookingFor')}</h5>
								<a href="#" className="close" data-bs-dismiss="modal"><i className="material-icons-outlined">close</i></a>
							</div>
							<div className="input-group input-group-flat">
								<input type="text" className="form-control" placeholder={t('propertyPages.typeKeywordPlaceholder')} />
								<span className="input-group-text">
									<i className="material-icons-outlined">search</i>
								</span>
							</div>
							<h6>{t('propertyPages.popularProperties')}</h6>
							<div className="search-list">
								<p><Link to="/rent-property-grid">{t('contactPage.popular1')}</Link></p>
								<p><Link to="/rent-property-grid">{t('contactPage.popular2')}</Link></p>
								<p><Link to="/rent-property-grid">{t('contactPage.popular3')}</Link></p>
								<p><Link to="/rent-property-grid">{t('contactPage.popular4')}</Link></p>
								<p><Link to="/rent-property-grid">{t('contactPage.popular5')}</Link></p>
								<p><Link to="/rent-property-grid">{t('contactPage.popular6')}</Link></p>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
		

    </div>
    </div>
  );
};

export default ContactUs;



