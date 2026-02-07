import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
                        <h1 className="breadcrumb-title">Privacy Policy</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Privacy Policy</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row">
						<div className="col-lg-12">
							<p className="mb-3">At Dreams Estate, we are committed to protecting your privacy. This policy outlines how we handle your information:</p>
							<h6 className="mb-3">Introduction</h6>
							<p>Dreams Estate  our operates the Dreams Estate platform the Service, which enables users to browse, book, and manage estate properties. WeÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢re committed to protecting your privacy and handling your personal information with care.</p>
							<h6 className="mb-3">Acceptance of Terms</h6>
							<p>By accessing or using the Dreams Estate platformÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âincluding our website, mobile applications, APIs, and any other services we provideÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âyou (ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œyou,ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œUser,ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â or ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œGuestÃƒÂ¢Ã¢â€šÂ¬Ã‚Â) acknowledge and agree that you have read, understood, and accept these Terms and Conditions (ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œTermsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â), our Privacy Policy, and any other policies or guidelines that we may post from time to time.</p>
							<h6 className="mb-3">How We Use Your Information</h6>
							<ul className="list-styled mb-3">
								<li className="mb-2">Provide & Improve Service: To operate, maintain, and enhance the Dreams Estate platform.</li>
								<li className="mb-2">Communications: To send booking confirmations, updates, security alerts, and support messages.</li>
								<li className="mb-2">Personalization: To tailor search results, recommendations, and marketing communications.</li>
								<li className="mb-2">Payments & Fraud Prevention: To process payments, verify identities, and detect or prevent fraud.</li>
								<li>Legal Compliance: To comply with applicable laws, regulations, or legal processes.</li>
							</ul>
							<h6 className="mb-1">Sharing Your Information</h6>
							<p className="mb-3">We do not sell your personal data. We may share information with:</p>
							<ul className="list-styled mb-3">
								<li className="mb-2">Hosts and Property Managers: Booking details necessary to complete a reservation.</li>
								<li className="mb-2">Service Providers: Payment processors, identity verification, customer support, analytics.</li>
								<li className="mb-2">Legal Authorities: When required by law or to protect rights, property, or safety.</li>
								<li>Business Transfers: In connection with a merger, acquisition, or sale of assets, with notice to you.</li>
							</ul>
							<h6 className="mb-3">Your Choices</h6>
							<ul className="list-styled mb-3">
								<li className="mb-2">Access & Correction: You can access or update your account information at any time via your profile settings.</li>
								<li className="mb-2">Cookies: You may set your browser to refuse cookies or alert you when cookies are being sent.</li>
								<li className="mb-2">Promotional Communications: You can opt out of marketing emails by following the unsubscribe link or contacting us.</li>
							</ul>
							<h6 className="mb-3">Data Security</h6>
							<p className="mb-3">We implement reasonable technical and organizational measuresÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âencryption, access controls, and secure serversÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âto protect your information. However, no method of transmission over the Internet is 100% secure.</p>
							<h6 className="mb-3">Data Retention</h6>
							<p className="mb-3">We retain personal information as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
							<h6 className="mb-3">International Transfers</h6>
							<p className="mb-3">Your information may be transferred to and maintained on servers located outside your jurisdiction. By using the Service, you consent to such transfers under applicable data-transfer mechanisms.</p>
							<h6 className="mb-3">Changes to This Policy</h6>
							<p className="mb-0">We may update this Privacy Policy from time to time. WeÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ll notify you of material changes by posting the new policy on this page with a new ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œLast UpdatedÃƒÂ¢Ã¢â€šÂ¬Ã‚Â date.</p>
						</div>
					</div>
                    

                </div>

			</div>
            

		</div>

		

		

		

		
		<div className="modal fade" id="search-modal" tabindex="-1" aria-hidden="true">
			<div className="modal-dialog  modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-body search-wrap">
						<form className="search-form" id="search-form" action="rent-property-grid.html">
							<div className="d-flex align-items-center justify-content-between mb-4">
								<h5>What Are You Looking for?</h5>
								<a href="#" className="close" data-bs-dismiss="modal"><i className="material-icons-outlined">close</i></a>
							</div>
							<div className="input-group input-group-flat">
								<input type="text" className="form-control" placeholder="Type a Keyword...." />
								<span className="input-group-text">
									<i className="material-icons-outlined">search</i>
								</span>
							</div>
							<h6>Popular Properties</h6>
							<div className="search-list">
								<p><Link to="/rent-property-grid">Beautiful Condo Room</Link></p>
								<p><Link to="/rent-property-grid">Royal Apartment</Link></p>
								<p><Link to="/rent-property-grid">Grand Villa House</Link></p>
								<p><Link to="/rent-property-grid">Grand Mahaka</Link></p>
								<p><Link to="/rent-property-grid">Lunaria Residence</Link></p>
								<p><Link to="/rent-property-grid">Stephen Alexander Homes</Link></p>
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

export default PrivacyPolicy;



