import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsCondition = () => {
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
                        <h1 className="breadcrumb-title">Terms & Conditions</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Terms & Conditions</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row">
						<div className="col-lg-12">
							<h6 className="mb-3">Introduction</h6>
							<p className="mb-3">Welcome to Dreams Estate. By accessing or using our platformÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âwhether via web, mobile, or any other interfaceÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âyou acknowledge that you have read, understood, and agree to be bound by these terms and conditions (ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œTermsÃƒÂ¢Ã¢â€šÂ¬Ã‚Â), our Privacy Policy, and any other policies or guidelines that we publish.</p>
							<h6 className="mb-3">Acceptance of Terms</h6>
							<p className="mb-3">By accessing or using the estate property located at [Estate Address], you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, you may not use the estate.</p>
							<h6 className="mb-3">Booking and Payment</h6>
							<ul className="list-styled mb-3">
								<li className="mb-2">Reservations must be confirmed with a signed agreement and a non-refundable deposit of [percentage]% of the total cost.</li>
								<li className="mb-2">The balance must be paid in full by [number] days before the event or stay.</li>
								<li className="mb-0">Payment methods accepted: [e.g., bank transfer, credit card, PayPal].</li>
							</ul>
							<h6 className="mb-3">Use of Property</h6>
							<ul className="list-styled mb-3">
								<li className="mb-2">The estate is to be used for [type of use, e.g., private events, short-term stays, residential lease] only.</li>
								<li className="mb-2">Maximum occupancy is [number of guests/residents] unless otherwise agreed in writing.</li>
								<li className="mb-0">No commercial activity may take place on the property without prior written approval.</li>
							</ul>
							<h6 className="mb-3">Rules and Conduct</h6>
							<ul className="list-styled mb-3">
								<li className="mb-2">No smoking inside the buildings.</li>
								<li className="mb-2">No pets allowed unless prior permission is granted.</li>
								<li className="mb-0">The client is responsible for the conduct of all guests and any damage caused.</li>
							</ul>
							<h6 className="mb-3">Damages and Liability</h6>
							<ul className="list-styled mb-3">
								<li className="mb-2">Any damages to the property or its contents will be charged to the client.</li>
								<li className="mb-0">The estate owner is not liable for injury, loss, or damage to personal property during your stay or event.</li>
							</ul>
							<h6 className="mb-3">Cancellations and Refunds</h6>
							<ul className="list-styled mb-3">
								<li className="mb-2">Cancellations made 02 days before the reservation date will receive a [percentage]% refund, excluding the deposit.</li>
								<li className="mb-0">No refunds will be issued for cancellations within [number] days of the reservation date.</li>
							</ul>
							<h6 className="mb-3">Force Majeure</h6>
							<p className="mb-3">The estate shall not be liable for any failure to perform due to causes beyond its reasonable control, including natural disasters, government restrictions, or pandemics.</p>
							<h6 className="mb-3">Insurance</h6>
							<p className="mb-3">It is recommended that clients obtain event or rental insurance to cover unexpected incidents.</p>
							<h6 className="mb-3">Governing Law</h6>
							<p className="mb-0">These terms and conditions shall be governed by and interpreted according to the laws of London.</p>
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

export default TermsCondition;



