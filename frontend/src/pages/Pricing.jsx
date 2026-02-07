import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
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
                        <h1 className="breadcrumb-title">Pricing</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Pricing</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row">
                        <div className="col-lg-12 mx-auto">

                            <div className="pricing-item-01">
                                <ul className="nav nav-tabs nav-tabs-rounded nav-justified mb-3">
                                    <li className="nav-item"><Link className="nav-link active" to="/pricing" data-bs-toggle="tab">Monthly</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/pricing" data-bs-toggle="tab">Yearly</Link></li>
                                </ul>
                            </div>
                            
                            <div className="tab-content">
                                <div className="tab-pane show active" id="monthly">
                                    
                                    <div className="row row-gap-3">
                                        <div className="col-lg-4">
                                            <div className="pricing-item-02">
                                                <div className="plan-head">
                                                    <h4 className="mb-1">Standard</h4>
                                                    <p>Manage up to 10 listings with essential features for small teams and businesses.</p>
                                                </div>
                                                <div className="plan-price">
                                                    <h2>$99<span>/month</span></h2>
                                                    <hr />
                                                </div>
                                                <div className="plan-features">
                                                    <h6>Key Features</h6>
                                                    <p><i className="material-icons-outlined">check_circle</i>10 Listing Per Login</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Up to 100 Users</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Enquiry on Listing</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>24 Hrs Support</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Basic Custom Review</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Simple Impact Reporting</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Quick Onboarding & Account</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>No API Access</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Basic Transaction Tracking</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Dreams Estate Branding</p>
                                                </div>
                                                <div className="plan-btn">
                                                    <a href="#" className="btn btn-dark">Get a Quote</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="pricing-item-02 popular">
                                                <span className="bookmark-sideright-ribbone-primary-right">
													<span>Most Popular</span>
												</span>
                                                <div className="plan-head">
                                                    <h4 className="mb-1">Professional</h4>
                                                    <p>Manage up to 10 listings with essential features for small teams and businesses.</p>
                                                </div>
                                                <div className="plan-price">
                                                    <h2>$199<span>/month</span></h2>
                                                    <hr />
                                                </div>
                                                <div className="plan-features">
                                                    <h6>Key Features</h6>
                                                    <p><i className="material-icons-outlined">check_circle</i>50 Listing Per Login</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>500+ Active Users</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Enquiry On Every Listing</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Priority 24 Hrs Support</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Advanced Custom Review</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Standard Impact Reporting</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Standard Impact Reporting</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Partial API Access</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Partial API Access</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Partial Custom Branding</p>
                                                </div>
                                                <div className="plan-btn">
                                                    <a href="#" className="btn btn-dark">Get a Quote</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="pricing-item-02">
                                                <div className="plan-head">
                                                    <h4 className="mb-1">Enterprise</h4>
                                                    <p>Unlimited listings, full API access, 24/7 support, and featured organizations.</p>
                                                </div>
                                                <div className="plan-price">
                                                    <h2>$399<span>/month</span></h2>
                                                    <hr />
                                                </div>
                                                <div className="plan-features">
                                                    <h6>Key Features</h6>
                                                    <p><i className="material-icons-outlined">check_circle</i>Unlimited Listings Per Login</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>1000+ Active Users</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Enquiry Enabled On Listings</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Dedicated 24 Hrs Support</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Full Custom Review Tools</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Advanced Impact Reporting</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Personalized Onboarding & Account</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Full API Access</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Full Transaction Tracking</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>White-Label Branding</p>
                                                </div>
                                                <div className="plan-btn">
                                                    <a href="#" className="btn btn-dark">Get a Quote</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className="tab-pane" id="yearly">
                                    
                                    <div className="row row-gap-3">
                                        <div className="col-lg-4">
                                            <div className="pricing-item-02">
                                                <div className="plan-head">
                                                    <h4 className="mb-1">Standard</h4>
                                                    <p>Manage up to 10 listings with essential features for small teams and businesses.</p>
                                                </div>
                                                <div className="plan-price">
                                                    <h2>$999<span>/year</span></h2>
                                                    <hr />
                                                </div>
                                                <div className="plan-features">
                                                    <h6>Key Features</h6>
                                                    <p><i className="material-icons-outlined">check_circle</i>10 Listing Per Login</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Up to 100 Users</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Enquiry on Listing</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>24 Hrs Support</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Basic Custom Review</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Simple Impact Reporting</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Quick Onboarding & Account</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>No API Access</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Basic Transaction Tracking</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Dreams Estate Branding</p>
                                                </div>
                                                <div className="plan-btn">
                                                    <a href="#" className="btn btn-dark">Get a Quote</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="pricing-item-02 popular">
                                                <span className="bookmark-sideright-ribbone-primary-right">
                                                    <span>Most Popular</span>
                                                </span>
                                                <div className="plan-head">
                                                    <h4 className="mb-1">Professional</h4>
                                                    <p>Manage up to 10 listings with essential features for small teams and businesses.</p>
                                                </div>
                                                <div className="plan-price">
                                                    <h2>$1199<span>/year</span></h2>
                                                    <hr />
                                                </div>
                                                <div className="plan-features">
                                                    <h6>Key Features</h6>
                                                    <p><i className="material-icons-outlined">check_circle</i>50 Listing Per Login</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>500+ Active Users</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Enquiry On Every Listing</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Priority 24 Hrs Support</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Advanced Custom Review</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Standard Impact Reporting</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Standard Impact Reporting</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Partial API Access</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Partial API Access</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Partial Custom Branding</p>
                                                </div>
                                                <div className="plan-btn">
                                                    <a href="#" className="btn btn-dark">Get a Quote</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="pricing-item-02">
                                                <div className="plan-head">
                                                    <h4 className="mb-1">Enterprise</h4>
                                                    <p>Unlimited listings, full API access, 24/7 support, and advanced features.</p>
                                                </div>
                                                <div className="plan-price">
                                                    <h2>$2399<span>/year</span></h2>
                                                    <hr />
                                                </div>
                                                <div className="plan-features">
                                                    <h6>Key Features</h6>
                                                    <p><i className="material-icons-outlined">check_circle</i>Unlimited Listings Per Login</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>1000+ Active Users</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Enquiry Enabled On Listings</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Dedicated 24 Hrs Support</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Full Custom Review Tools</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Advanced Impact Reporting</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Personalized Onboarding & Account</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Full API Access</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>Full Transaction Tracking</p>
                                                    <p><i className="material-icons-outlined">check_circle</i>White-Label Branding</p>
                                                </div>
                                                <div className="plan-btn">
                                                    <a href="#" className="btn btn-dark">Get a Quote</a>
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

export default Pricing;



