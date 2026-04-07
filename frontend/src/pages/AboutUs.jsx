import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
	const tunisianPartners = [
		'Tunisie Telecom',
		'Topnet',
		'Ooredoo Tunisie',
		'Orange Tunisie',
		'BIAT',
		'Amen Bank',
		'Attijari Bank Tunisie',
		'Sotetel',
		'Telnet Holding',
		'Vermeg',
		'Oxia',
		'Discovery Informatique',
	];

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
                        <h1 className="breadcrumb-title">About Us</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">About Us</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

            <div className="about-us-item-06">

				<div className="container">
					
					<div className="row">
						<div className="col-lg-12 mx-auto">
								
							<div className="about-us-item-01">
								<h2>Smart Property, Built For Tunisia</h2>
								<p className="mb-0">Smart Property is a modern real estate solution designed to simplify how people buy, rent, and manage property. We connect property owners, agencies, and clients on one trusted platform with verified listings, clear information, and a smooth digital experience. From first search to final decision, our mission is to make real estate in Tunisia faster, safer, and more transparent.</p>
							</div>

							
							<div className="row row-gap-4 about-us-img-wrap">
								<div className="col-md-4 col-lg-4">
									<img src="/assets/img/about-us/about-us-01.jpg" alt="img" className="img-fluid rounded" />
								</div>
								<div className="col-md-4 col-lg-4">
									<img src="/assets/img/about-us/about-us-02.jpg" alt="img" className="img-fluid rounded" />
								</div>
								<div className="col-md-4 col-lg-4">
									<img src="/assets/img/about-us/about-us-03.jpg" alt="img" className="img-fluid rounded" />
								</div>
							</div>
							

							
							<div className="row row-gap-4">
								<div className="col-md-6 col-lg-3">
									<div className="about-us-item-02">
										<div className="d-flex align-items-center">
											<img src="/assets/img/about-us/listing.svg" alt="" className="img-fluid me-3" />
											<div>
												<h4 className="mb-1">18K+</h4>
												<p className="mb-0">Verified Listings</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 col-lg-3">
									<div className="about-us-item-02">
										<div className="d-flex align-items-center">
											<img src="/assets/img/about-us/agents.svg" alt="" className="img-fluid me-3" />
											<div>
												<h4 className="mb-1">1.2K+</h4>
												<p className="mb-0">Agencies & Agents</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 col-lg-3">
									<div className="about-us-item-02">
										<div className="d-flex align-items-center">
											<img src="/assets/img/about-us/sales.svg" alt="" className="img-fluid me-3" />
											<div>
												<h4 className="mb-1">9.5K+</h4>
												<p className="mb-0">Deals Facilitated</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 col-lg-3">
									<div className="about-us-item-02">
										<div className="d-flex align-items-center">
											<img src="/assets/img/about-us/users.svg" alt="" className="img-fluid me-3" />
											<div>
												<h4 className="mb-1">65K+</h4>
												<p className="mb-0">Monthly Visitors</p>
											</div>
										</div>
									</div>
								</div>
							</div>
							

						</div>
					</div>
					
				</div>

			</div>

			<div className="about-us-item-03">
				<img src="/assets/img/bg/about-us-bg-01.png" alt="" className="img-fluid about-us-bg-01 d-none d-lg-flex" />
				<img src="/assets/img/bg/about-us-bg-02.png" alt="" className="img-fluid about-us-bg-02 d-none d-lg-flex" />
				<div className="container">

					
					<div className="row align-items-center row-gap-4 position-relative z-2">
						<div className="col-xl-5">
							<div className="me-3">
								<h2 className="mb-4">Ready to Find, List, or Invest?</h2>
								<img src="/assets/img/about-us/about-us-04.jpg" alt="" className="img-fluid rounded w-100" />
							</div>
						</div>
						<div className="col-xl-7">
							<h5 className="mb-4">Smart tools, real market data, and trusted support to help you move faster with confidence.</h5>
							<p>Our platform is designed for every profile in the property journey: buyers, tenants, owners, agencies, and investors. With advanced filters, map-based discovery, high-quality media, and transparent pricing, Smart Property helps users compare opportunities quickly and make better decisions.</p>
							<p className="mb-0">For professionals, Smart Property offers powerful backoffice features to publish listings, manage leads, monitor performance, and streamline operations in one place. We combine local market understanding with modern technology to deliver a reliable real estate experience across Tunisia.</p>
						</div>
					</div>
					

				</div>
			</div>

			<div className="about-us-item-04">
				<div className="container">
					
					
					<div className="row">
						<div className="col-lg-11 mx-auto">
							<div className="text-center about-us-item-05">
								<h2 className="mb-3">Trusted Tunisian Partners</h2>
								<p className="mb-0">You can place your official partner logos in these slots. Suggested local names are listed below.</p>
							</div>

							
							<div className="row align-items-center row-gap-4">
								{tunisianPartners.map((partner) => (
									<div className="col-md-6 col-lg-3 d-flex" key={partner}>
										<div className="card border-0 bg-light shadow-none flex-fill mb-0">
											<div className="card-body text-center py-4 px-3">
												<div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '54px', height: '54px', background: '#EAF3FF', color: '#1B5FC6', fontWeight: 700 }}>
													{partner.split(' ').map((w) => w[0]).join('').slice(0, 2)}
												</div>
												<h6 className="mb-1">{partner}</h6>
												<p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Logo placeholder</p>
											</div>
										</div>
									</div>
								))}
							</div>
							

						</div>
					</div>
					
					
				</div>
			</div>

		</div>

		

		

		

		
		<div className="modal fade" id="search-modal" tabIndex="-1" aria-hidden="true">
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

export default AboutUs;
