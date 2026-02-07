import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
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

        

		

		
		<section className="Home-banner-section">
			<div className="container">
				
				
				<div className="row">
					<div className="col-lg-6">
						<div className="banner-content aos" data-aos="fade-up">
							<h1 className="mb-2">Find Your Best Dream House for Rental, Buy & Sell...</h1>
							<p className="mb-0">Properties for buy / rent in in your location. We have more than 3000+ listings for you to choose</p>
						</div>
					</div>
				</div>
				

				
				<div className="home-search-1 home-search-2">
					<ul className="nav nav-tabs justify-content-lg-start justify-content-center aos" data-aos="fade-up" role="tablist">
						<li className="nav-item" role="presentation">
							<Link className="nav-link active" data-bs-toggle="tab" to="/" role="tab" aria-controls="buy_property" aria-selected="true"> 
								<i className="material-icons-outlined me-2">shopping_basket</i>Buy Property
							</Link>
						</li>
						<li className="nav-item" role="presentation">
							<Link className="nav-link" data-bs-toggle="tab" to="/" role="tab" aria-controls="rent_property" aria-selected="false">
								<i className="material-icons-outlined me-2">king_bed</i>Rent Property
							</Link>
						</li>
					</ul>

					<div className="tab-content aos" data-aos="fade-down" data-aos-duration="1000">
						
						<div className="tab-pane fade show active" id="buy_property" role="tabpanel">
							<div className="search-item">
								<form action="buy-property-grid-sidebar.html">
									<div className="d-flex align-items-bottom flex-wrap flex-lg-nowrap gap-3">
										<div className="flex-fill select-field w-100">
											<label className="form-label">Keyword</label>
											<select className="select">
												<option>Select</option>
												<option>Buy</option>
												<option>Sell</option>
											</select>
										</div>
										<div className="flex-fill select-field w-100">
											<label className="form-label">Property Type</label>
											<select className="select">
												<option>Select</option>
												<option>Buy Property</option>
												<option>Rent Property</option>
											</select>
										</div>
										<div className="flex-fill select-field w-100">
											<label className="form-label">Address</label>
											<input type="text" className="form-control" />
										</div>
										<div className="flex-fill select-field w-100">
											<label className="form-label">Min Price</label>
											<input type="text" className="form-control" placeholder="$" />
										</div>
										<div className="flex-fill select-field w-100">
											<label className="form-label">Max Price</label>
											<input type="text" className="form-control" placeholder="$" />
										</div>
										<div className="custom-search-item d-flex align-items-end">
											<button type="submit" className="btn btn-primary">
												<i className="material-icons-outlined">search</i>
											</button>
										</div>
									</div>
								</form>
							</div>
						</div>

						
						<div className="tab-pane fade" id="rent_property" role="tabpanel">
							<div className="search-item">
								<form action="rent-property-grid-sidebar.html">
									<div className="d-flex align-items-bottom flex-wrap flex-lg-nowrap gap-3">
										<div className="flex-fill select-field  w-100">
											<label className="form-label">Keyword</label>
											<select className="select">
												<option>Select</option>
												<option>Buy</option>
												<option>Sell</option>
											</select>
										</div>
										<div className="flex-fill select-field w-100">
											<label className="form-label">Property Type</label>
											<select className="select">
												<option>Select</option>
												<option>Buy Property</option>
												<option>Rent Property</option>
											</select>
										</div>
										<div className="flex-fill select-field w-100">
											<label className="form-label">Address</label>
											<input type="text" className="form-control" />
										</div>
										<div className="flex-fill select-field w-100">
											<label className="form-label">Min Price</label>
											<input type="text" className="form-control" placeholder="$" />
										</div>
										<div className="flex-fill select-field w-100">
											<label className="form-label">Max Price</label>
											<input type="text" className="form-control" placeholder="$" />
										</div>
										<div className="custom-search-item d-flex align-items-end">
											<button type="submit" className="btn btn-primary">
												<i className="material-icons-outlined">search</i>
											</button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
				
			</div>
		</section>
		

		
		<section className="how-work-section section-padding">
			<div className="container">

				
				<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
					<h2 className="mb-2 text-center">How It Works</h2>
					<div className="sec-line">
						<span className="sec-line1"></span>
						<span className="sec-line2"></span>
					</div>
					<p className="mb-0 text-center">Follow these 3 steps to book your place</p>
				</div>
				

				
				<div className="row">
					<div className="col-lg-4 d-flex aos" data-aos="fade-up" data-aos-duration="500">
						<div className="howit-work-item text-center aos-init aos-animate flex-fill" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
							<div className="mb-3 bg-secondary avatar avatar-md rounded-circle p-2">
								<img src="/assets/img/home/icons/work-icon-1.svg" alt="icon" />
							</div>
							<h5 className="mb-3">01. Search for Location</h5>
							<p className="mb-0">Find properties by location quickly, matching your lifestyle and preferences easily.</p>
						</div>
					</div> 

					<div className="col-lg-4 d-flex aos" data-aos="fade-down" data-aos-duration="1000">
						<div className="howit-work-item text-center aos-init aos-animate flex-fill" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
							<div className=" mb-3 bg-danger avatar avatar-md rounded-circle p-2">
								<img src="/assets/img/home/icons/work-icon-2.svg" alt="icon" />
							</div>
							<h5 className="mb-3">02. Select Property Type</h5>
							<p className="mb-0">Choose your ideal property type easily, from apartments to villas.</p>
						</div>
					</div> 

					<div className="col-lg-4 d-flex aos" data-aos="fade-up" data-aos-duration="500">
						<div className="howit-work-item text-center aos-init aos-animate flex-fill" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
							<div className="mb-3 bg-success avatar avatar-md rounded-circle p-2">
								<img src="/assets/img/home/icons/work-icon-3.svg" alt="icon" />
							</div>
							<h5 className="mb-3">03. Book Your Property</h5>
							<p className="mb-0">Secure your dream property quickly with a simple, hassle-free booking process.</p>
						</div>
					</div> 
				</div>
				
			</div>
		</section>
		

		 
		<section className="home-property-section section-padding bg-dark position-relative overflow-hidden">
			<div className="container">
				
				
				<div className="row position-relative">
					<div className="col-lg-4 aos" data-aos="fade-down" data-aos-duration="1000">
						
						<div className="section-heading">
							<h2 className="mb-2 text-lg-start text-center text-white">Explore by  <span className="d-lg-block "> Property Type </span></h2>
							<div className="sec-line justify-content-lg-start">
								<span className="sec-line1"></span>
								<span className="sec-line2"></span>
							</div>
							<p className="mb-0 text-lg-start text-center text-light">Whether you're looking for a cozy apartment, a luxurious villa, or a commercial investment, weÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ve got you covered.</p>
						</div>
						
					</div>

					<div className="col-lg-8">
						<div className="property-slider">
							<div className="property-item aos" data-aos="fade-up" data-aos-duration="1000">
								<div className="property-card-item">
									<div className="mb-3 text-center">
										<img src="/assets/img/home/icons/property-icon-1.svg" alt="property-icon-1" className="m-auto" />
									</div>
									<h5 className="mb-1"> Houses </h5>
									<p className="mb-0"> 30 Properties</p>
								</div>
							</div>

							<div className="property-item">
								<div className="property-card-item aos" data-aos="fade-down" data-aos-duration="1000">
									<div className="mb-3 text-center">
										<img src="/assets/img/home/icons/property-icon-2.svg" alt="property-icon-1" className="m-auto" />
									</div>
									<h5 className="mb-1"> Offices </h5>
									<p className="mb-0"> 45 Properties</p>
								</div>
							</div>

							<div className="property-item aos" data-aos="fade-up" data-aos-duration="1000">
								<div className="property-card-item">
									<div className="mb-3 text-center">
										<img src="/assets/img/home/icons/property-icon-3.svg" alt="property-icon-1" className="m-auto" />
									</div>
									<h5 className="mb-1"> Villas </h5>
									<p className="mb-0"> 28 Properties</p>
								</div>
							</div>

							<div className="property-item aos" data-aos="fade-down" data-aos-duration="1000">
								<div className="property-card-item">
									<div className="mb-3 text-center">
										<img src="/assets/img/home/icons/property-icon-4.svg" alt="property-icon-1" className="m-auto" />
									</div>
									<h5 className="mb-1"> Apartment </h5>
									<p className="mb-0"> 35 Properties</p>
								</div>
							</div>

							<div className="property-item aos" data-aos="fade-up" data-aos-duration="1000">
								<div className="property-card-item">
									<div className="mb-3 text-center">
										<img src="/assets/img/home/icons/property-icon-4.svg" alt="property-icon-1" className="m-auto" />
									</div>
									<h5 className="mb-1"> Apartment </h5>
									<p className="mb-0"> 30 Properties</p>
								</div>
							</div>
							

						</div>
					</div>
				</div>
				

			</div>

			
			<img src="/assets/img/home/icons/property-element-1.svg" alt="property-element-0" className="img-fluid custom-element-img-1 d-lg-block d-none" />
			<img src="/assets/img/home/icons/property-element-2.svg" alt="property-element-0" className="img-fluid custom-element-img-2 d-lg-block d-none" />
		</section>
		

		 
		<section className="features-section section-padding bg-light position-relative">
			<div className="container">

				
				<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
					<h2 className="mb-2 text-center">Featured Properties for Sales</h2>
					<div className="sec-line">
						<span className="sec-line1"></span>
						<span className="sec-line2"></span>
					</div>
					<p className="mb-0 text-center">Hand-picked selection of quality places</p>
				</div>
				

				<div className="feature-slider-item features-slider position-none">
					
					<div className="features-slide-card">
						
                        <div className="d-flex aos" data-aos="fade-down" data-aos-duration="1000">
                            <div className="property-card flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/buy-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-01.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="badge badge-sm bg-danger d-flex align-items-center">
                                                    <i className="material-icons-outlined">offline_bolt</i>New
                                                </div>
                                                <div className="badge badge-sm bg-orange d-flex align-items-center">
                                                    <i className="material-icons-outlined">loyalty</i>Featured
                                                </div>
                                            </div>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$21000</h6>
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-01.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">5.0 (20 Reviews)</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Serenity Condo Suite</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>17, Grove Towers, New York, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                4 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                4 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                350 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap flex-wrap gap-1">
                                            <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 16 Jan 2023</span> </p>
                                            <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Apartment</span> </p>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
						
						<div className="d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="property-card flex-fill mb-0">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/buy-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-04.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-end position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1370</h6>
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-04.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">4.8 (26 Reviews)</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Palm Cove Bungalows</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>42, Pine Residency, Miami, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                5 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                3 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                700 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                            <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 16 Mar 2025</span> </p>
                                            <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Bungalow </span> </p>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div> 
					</div>

					
					<div className="features-slide-card">
						
						<div className="d-flex aos" data-aos="fade-down" data-aos-duration="1000">
                            <div className="property-card flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/buy-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-02.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-end position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1940</h6>
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-02.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">4.6 (36 Reviews)</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Loyal Apartment</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>25, Willow Crest Apartment, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                2 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                2 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                350 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                            <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 02 May 2025</span> </p>
                                            <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Apartment</span> </p>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
						
						<div className="d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="property-card flex-fill mb-0">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/buy-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-05.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-end position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$2000</h6>
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-05.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">4.9 (19 Reviews)</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Blue Horizon Villa</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>76, Golden Oaks, Dallas, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                2 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                1 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                400 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                            <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 08 Mar 2025</span> </p>
                                            <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Residencey </span> </p>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
					</div>
					
					<div className="features-slide-card">
						
						<div className="d-flex aos" data-aos="fade-down" data-aos-duration="1000">
                            <div className="property-card flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/buy-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-03.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="badge badge-sm bg-orange d-flex align-items-center">
                                                    <i className="material-icons-outlined">loyalty</i>Featured
                                                </div>
                                            </div>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1370</h6>
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-03.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">4.9 (25 Reviews)</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Grand Villa House</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>10, Oak Ridge Villa, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                4 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                3 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                520 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                            <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 28 Apr 2025</span> </p>
                                            <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Villa</span> </p>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div> 
						
                        <div className="d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="property-card mb-0 flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/buy-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-06.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-end position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1950</h6>
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-06.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">4.7 (45 Reviews)</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Wanderlust Lodge</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>91, Birch Residences, Boston, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                3 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                2 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                550 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                            <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 25 Feb 2025</span> </p>
                                            <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Lodge </span> </p>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
					</div>

					
					<div className="features-slide-card">
						
                        <div className="d-flex aos" data-aos="fade-down" data-aos-duration="1000">
                            <div className="property-card flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/buy-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-07.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-end position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$2470</h6>
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-07.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">4.4 (79 Reviews)</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Elite Suite Room</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>42, Maple Grove Residences, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                2 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                1 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                480 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                            <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 14 Apr 2025</span> </p>
                                            <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Suite </span> </p>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
						
                        <div className="d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="property-card mb-0 flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/buy-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-08.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-end position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1900</h6>
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-08.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">4.6 (47 Reviews)</span>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Celestial Residency</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>28, Hilltop Gardens, San Francisco, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                2 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                2 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                354 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                            <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 06 Apr 2025</span> </p>
                                            <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Villa </span> </p>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
					</div>
				</div>

				<div className="text-center d-flex align-items-center justify-content-center m-auto">
					<Link to="/buy-property-grid" className="btn btn-lg btn-dark d-flex align-items-center gap-1"> Explore All <i className="material-icons-outlined">arrow_forward</i></Link>
				</div>
			</div>
		</section>
		

		 
		<section className="cities-section section-padding">
			<div className="container">

				
				<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
					<h2 className="mb-2 text-center">Cities With Listing</h2>
					<div className="sec-line">
						<span className="sec-line1"></span>
						<span className="sec-line2"></span>
					</div>
					<p className="mb-0 text-center">Destinations we love the most</p>
				</div>
				


				<div className="cities-slider">

					
					<div className="city-items-slide" >

						
						<div className="city-item position-relative mb-4 aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-1.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5 className="mb-1">New York</h5>
								<p className="mb-0">300 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

						
						<div className="city-item position-relative aos" data-aos="fade-down" data-aos-duration="1500">
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-4.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5 className="mb-1">Argentina</h5>
								<p className="mb-0">740 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

					</div>

					
					<div className="city-items-slide">

						
						<div className="city-item position-relative mb-4 aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-2.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5 className="mb-1">Singapore</h5>
								<p className="mb-0">400 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

						
						<div className="city-item position-relative aos" data-aos="fade-down" data-aos-duration="1500">
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-5.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5 className="mb-1">United Kingdom</h5>
								<p className="mb-0">1450 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

					</div>

					
					<div className="city-items-slide" >

						
						<div className="city-item position-relative mb-4 aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-3.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5 className="mb-1">New York</h5>
								<p className="mb-0">300 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

						
						<div className="city-item position-relative aos" data-aos="fade-down" data-aos-duration="1500">
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-6.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5>Singapore</h5>
								<p>400 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

					</div>

					
					<div className="city-items-slide" >

						
						<div className="city-item position-relative mb-4 aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-1.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5 className="mb-1">Thailand</h5>
								<p className="mb-0">300 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

						
						<div className="city-item position-relative">
							<div className="city-img position-relative aos" data-aos="fade-down" data-aos-duration="1500">
								<img src="/assets/img/home/city/city-img-2.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5 className="mb-1">United Arab Emirates</h5>
								<p className="mb-0">100 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

					</div>

					
					<div className="city-items-slide">

						
						<div className="city-item position-relative mb-4 aos" data-aos="fade-down" data-aos-duration="1000"> 
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-3.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5 className="mb-1">New York</h5>
								<p className="mb-0">300 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

						
						<div className="city-item position-relative aos" data-aos="fade-down" data-aos-duration="1500">
							<div className="city-img position-relative">
								<img src="/assets/img/home/city/city-img-6.jpg" alt="City" className="img-fluid" />
							</div>
							<div className="city-name">
								<h5>Singapore</h5>
								<p>400 Properties</p>
							</div>
							<div className="arrow-overlay">
								<Link to="/rent-property-grid"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>

					</div>

				</div>

			</div>
		</section>
		 

		 
		<section className="features-section section-padding bg-light position-relative">
			<div className="container">

				
				<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
					<h2 className="mb-2 text-center">Featured Properties for Rent</h2>
					<div className="sec-line">
						<span className="sec-line1"></span>
						<span className="sec-line2"></span>
					</div>
					<p className="mb-0 text-center">Hand-picked selection of quality places</p>
				</div>
				

				<div className="feature-slider-item features-slider position-none">
					
					<div className="features-slide-card">
						
                        <div className="d-flex aos" data-aos="fade-down" data-aos-duration="1000">
                            <div className="property-card flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-01.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3 z-1">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="badge badge-sm bg-danger d-flex align-items-center">
                                                    <i className="material-icons-outlined">offline_bolt</i>New
                                                </div>
                                                <div className="badge badge-sm bg-orange d-flex align-items-center">
                                                    <i className="material-icons-outlined">loyalty</i>Featured
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$21000 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Lodge</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Serenity Condo Suite</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>17, Grove Towers, New York, USA</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                4 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                4 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                350 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3 gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-10.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Ethan Brooks<span className="d-block fs-14 text-body pt-1">United States</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>

						
						<div className="d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="property-card flex-fill property-card mb-0">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-04.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1580 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Residency</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Coral Bay Cabins</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>7, Rosewood Court, Brighton, UK</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                5 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                3 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                700 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3 gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-13.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Sophia Mitchell<span className="d-block fs-14 text-body pt-1">United Kingdom</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div>
                        </div>
					</div>

					
					<div className="features-slide-card">
						
						<div className="d-flex aos" data-aos="fade-down" data-aos-duration="1000">
                            <div className="property-card flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-02.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1130 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Apartment</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Gateway Apartment</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>54, Coral Sands Apartments, Australia </p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                2 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                4 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                350 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3 gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-11.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Olivia Hayes<span className="d-block fs-14 text-body pt-1">Australia</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>

						
						<div className="d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="property-card flex-fill mb-0">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-05.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$4500 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Residency</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Majestic Stay</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>10, Bella Vista Villas, Rome, Italy</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                2 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                1 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                400 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3 gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-14.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Leo Ramirez<span className="d-block fs-14 text-body pt-1">Italy</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
					</div>

					
					<div className="features-slide-card">
						
						<div className="d-flex aos" data-aos="fade-down" data-aos-duration="1000">
                            <div className="property-card flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-03.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$2450 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Condo</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Cozy Urban Condo</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>130, Elmstone Flats, Manchester, UK</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                4 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                3 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                520 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3 gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-12.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Daniel Carter<span className="d-block fs-14 text-body pt-1">United Kingdom</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>

						
                        <div className="d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="property-card flex-fill mb-0">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-06.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$3000 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Lodge</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Noble Nest</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>76, Sakura Heights, Kyoto, Japan</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                3 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                2 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                550 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3 gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-15.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Maya Rivera<span className="d-block fs-14 text-body pt-1">Japan</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
					</div>

					
					<div className="features-slide-card">
						
                        <div className="d-flex aos" data-aos="fade-down" data-aos-duration="1000">
                            <div className="property-card flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-07.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1800 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Villa</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Holiday Haven Homes</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>88, Eucalypt Lane Suites, Sydney, Australia</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                2 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                1 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                480 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3 gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-16.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Marcus Bennett<span className="d-block fs-14 text-body pt-1">Australia</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>

						
                        <div className="d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="property-card mb-0 flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-08.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$2680 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Apartment</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/buy-details">Rentora Apartment</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>305, Palm View Towers, Dubai, UAE</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                2 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                2 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                350 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3 gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-17.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Zara Collins<span className="d-block fs-14 text-body pt-1">United Arab Emirates</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div>
					</div>
				</div>

				<div className="text-center d-flex align-items-center justify-content-center m-auto">
					<Link to="/rent-property-grid" className="btn btn-lg btn-dark d-flex align-items-center gap-1"> Explore All <i className="material-icons-outlined">arrow_forward</i></Link>
				</div>
			</div>
		</section>
		

		 
		<section className="statistics-section section-padding bg-dark position-relative">
			<div className="container">

				
				<div className="d-flex align-items-center justify-content-lg-between justify-content-md-between justify-content-center flex-wrap gap-2">
					<div className="statistics-item d-flex align-items-center gap-2 flex-wrap aos" data-aos="fade-down" data-aos-duration="1000">
						<div>
							<img src="/assets/img/home/icons/stat-icon-1.svg" alt="stat-icon-1" className="img-fluid stat-img" />
						</div>
						<div>
							<h4 className="mb-1"><span>50K</span></h4>
							<p className="mb-0">Listings Added</p>
						</div>
					</div>

					<div className="statistics-item d-flex align-items-center gap-2 flex-wrap aos" data-aos="fade-up" data-aos-duration="1000">
						<div>
							<img src="/assets/img/home/icons/stat-icon-2.svg" alt="stat-icon-1" className="img-fluid stat-img" />
						</div>
						<div>
							<h4 className="mb-1"><span>3000+</span></h4>
							<p className="mb-0">Agents Listed</p>
						</div>
					</div>

					<div className="statistics-item d-flex align-items-center gap-2 flex-wrap aos" data-aos="fade-down" data-aos-duration="1000">
						<div>
							<img src="/assets/img/home/icons/stat-icon-3.svg" alt="stat-icon-1" className="img-fluid stat-img" />
						</div>
						<div>
							<h4 className="mb-1"><span>2000+</span></h4>
							<p className="mb-0">Sales Completed</p>
						</div>
					</div>

					<div className="statistics-item d-flex align-items-center gap-2 flex-wrap aos" data-aos="fade-up" data-aos-duration="1000">
						<div>
							<img src="/assets/img/home/icons/stat-icon-4.svg" alt="stat-icon-1" className="img-fluid stat-img" />
						</div>
						<div> 
							<h4 className="mb-1"> <span>5000+</span></h4>
							<p className="mb-0">Users </p>
						</div>
					</div>
				</div>
				

			</div>
			
			<img src="/assets/img/home/icons/property-element-1.svg" alt="property-element-0" className="img-fluid custom-element-img-1 d-lg-block d-none" />
			<img src="/assets/img/home/icons/property-element-2.svg" alt="property-element-0" className="img-fluid custom-element-img-2 d-lg-block d-none" />
		</section>
		 

		 
		<section className="buy-property-section section-padding pb-0">
			<div className="container">

				<div className="row justify-content-center">
					
					<div className="col-lg-4 col-md-6">
						<div className="buy-property-item text-center mb-lg-0 mb-md-0  mb-4 aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="img-card overflow-hidden text-center">
								<Link to="/buy-property-grid"><img src="/assets/img/home/city/property-img-1.jpg" alt="Property Image" /></Link>
							</div>
							<div className="buy-property bg-white d-flex align-items-center justify-content-between">
								<h6 className="mb-0"><Link to="/buy-property-grid">Buy a Property</Link></h6>
								<Link to="/buy-property-grid" className="arrow buy-arrow d-flex align-items-center justify-content-center bg-error rounded-circle"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>
					</div>

					
					<div className="col-lg-4 col-md-6" >
						<div className="buy-property-item mb-lg-0 mb-4 text-center aos" data-aos="fade-up" data-aos-duration="1000">
							<div className="img-card overflow-hidden text-center">
								<Link to="/rent-property-grid"><img src="/assets/img/home/city/property-img-2.jpg" alt="Property Image" /></Link>
							</div>
							<div className="buy-property bg-white d-flex align-items-center justify-content-between">
								<h6 className="mb-0"><Link to="/rent-property-grid">Sell a Property</Link></h6>
								<Link to="/rent-property-grid" className="arrow sell-arrow d-flex align-items-center justify-content-center bg-warning rounded-circle"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>
					</div>

					
					<div className="col-lg-4 col-md-6" >
						<div className="buy-property-item mb-0 text-center aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="img-card overflow-hidden text-center">
								<Link to="/rent-property-grid"><img src="/assets/img/home/city/property-img-3.jpg" alt="Property Image" /></Link>
							</div>
							<div className="buy-property bg-white d-flex align-items-center justify-content-between">
								<h6 className="mb-0"><Link to="/rent-property-grid">Rent a Property</Link></h6>
								<Link to="/rent-property-grid" className="arrow rent-arrow d-flex align-items-center justify-content-center bg-info rounded-circle"><i class='fa-solid fa-arrow-right'></i></Link>
							</div>
						</div>
					</div>
				</div>

			</div>
		</section>
		 

		 
		<section className="partners-section section-padding ">
			<div className="container">

				
				<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
					<h2 className="mb-2 text-center">Hundreds of Partners Around  the World</h2>
					<div className="sec-line">
						<span className="sec-line1"></span>
						<span className="sec-line2"></span>
					</div>
					<p className="mb-0 text-center"> Every day, we build trust through  communication, transparency, and results.</p>
				</div>
				

				<div className="partners-slide-item partners-slider">
					<div className="partners-slide aos" data-aos="fade-right" data-aos-duration="1000">
						<div className="partners-items">
							<img src="/assets/img/home/icons/partners-img-1.svg" alt="partners-icon-1.svg" className="img-fluid partners-icon" />
						</div>
					</div>

					<div className="partners-slide">
						<div className="partners-items aos" data-aos="fade-right" data-aos-duration="1500">
							<img src="/assets/img/home/icons/partners-img-2.svg" alt="partners-icon-1.svg" className="img-fluid partners-icon" />
						</div>
					</div>

					<div className="partners-slide">
						<div className="partners-items aos" data-aos="fade-right" data-aos-duration="1000">
							<img src="/assets/img/home/icons/partners-img-3.svg" alt="partners-icon-1.svg" className="img-fluid partners-icon" />
						</div>
					</div>

					<div className="partners-slide">
						<div className="partners-items aos" data-aos="fade-right" data-aos-duration="1500">
							<img src="/assets/img/home/icons/partners-img-4.svg" alt="partners-icon-1.svg" className="img-fluid partners-icon" />
						</div>
					</div>

					<div className="partners-slide">
						<div className="partners-items aos" data-aos="fade-right" data-aos-duration="1000">
							<img src="/assets/img/home/icons/partners-img-5.svg" alt="partners-icon-1.svg" className="img-fluid partners-icon" />
						</div>
					</div>

					<div className="partners-slide">
						<div className="partners-items aos" data-aos="fade-right" data-aos-duration="1500">
							<img src="/assets/img/home/icons/partners-img-3.svg" alt="partners-icon-1.svg" className="img-fluid partners-icon" />
						</div>
					</div>

					<div className="partners-slide">
						<div className="partners-items aos" data-aos="fade-right" data-aos-duration="1000">
							<img src="/assets/img/home/icons/partners-img-2.svg" alt="partners-icon-1.svg" className="img-fluid partners-icon" />
						</div>
					</div>

				</div>
			</div>
		</section>
		 

		 
		<section className="testimonials-section section-padding ">
			<div className="container">

				
				<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
					<h2 className="mb-2 text-center text-white">Testimonials</h2>
					<div className="sec-line">
						<span className="sec-line1"></span>
						<span className="sec-line2"></span>
					</div>
					<p className="mb-0 text-center text-light">What our happy client says</p>
				</div>
				

				<div className="testimonials-slider-item testimonials-slider">

					<div className="testimonials-slide">
						
						<div className="testimonials-item aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="avatar avatar-lg mb-4">
								<img src="/assets/img/users/user-02.jpg" alt="user-01" className="img-fluid rounded-circle" />
							</div>
							<p className="mb-2"> Booking our dream home was incredibly easy with Dreams Estate The interface was user-friendly </p>
							<h6 className="mb-2"> Lily Brooks </h6>
							<div className="d-flex align-items-center justify-content-center">
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
							</div>
						</div>
					</div>

					<div className="testimonials-slide">
						
						<div className="testimonials-item aos" data-aos="fade-up" data-aos-duration="1000">
							<div className="avatar avatar-lg mb-4">
								<img src="/assets/img/users/user-01.jpg" alt="user-01" className="img-fluid rounded-circle" />
							</div>
							<p className="mb-2"> Dreams Estate made home booking a breeze. Super easy and stress-free! listing Portal of all time </p>
							<h6 className="mb-2">Daniel Cooper </h6>
							<div className="d-flex align-items-center justify-content-center">
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
							</div>
						</div>
					</div>

					<div className="testimonials-slide">
						
						<div className="testimonials-item aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="avatar avatar-lg mb-4">
								<img src="/assets/img/users/user-03.jpg" alt="user-01" className="img-fluid rounded-circle" />
							</div>
							<p className="mb-2"> From browsing to booking, everything felt effortless great design, clear information.</p>
							<h6 className="mb-2"> Karen Maria </h6>
							<div className="d-flex align-items-center justify-content-center">
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
							</div>
						</div>
					</div>

					<div className="testimonials-slide">
						
						<div className="testimonials-item aos" data-aos="fade-up" data-aos-duration="1000">
							<div className="avatar avatar-lg mb-4">
								<img src="/assets/img/users/user-04.jpg" alt="user-01" className="img-fluid rounded-circle" />
							</div>
							<p className="mb-2"> Inding the perfect home was a breeze. The platform was smooth, intuitive, and made experience. </p>
							<h6 className="mb-2"> John Carter </h6>
							<div className="d-flex align-items-center justify-content-center">
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
							</div>
						</div>
					</div>

					<div className="testimonials-slide">
						
						<div className="testimonials-item aos" data-aos="fade-down" data-aos-duration="1000">
							<div className="avatar avatar-lg mb-4">
								<img src="/assets/img/users/user-06.jpg" alt="user-01" className="img-fluid rounded-circle" />
							</div>
							<p className="mb-2"> Dreams Estate made home booking a breeze. Super easy and stress-free! listing Portal of all time </p>
							<h6 className="mb-2"> Daniel Cooper </h6>
							<div className="d-flex align-items-center justify-content-center">
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
								<i className="material-icons-outlined text-warning">star</i>
							</div>
						</div>
					</div>

				</div>

			</div>
		</section>
		 

		 
		<section className="pricing-plan-section section-padding">
			<div className="container">

				
				<div className="row align-items-center">
					<div className="col-lg-6">
						
						<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
							<h2 className="mb-2 text-center text-lg-start">Pricing & Subscriptions</h2>
							<div className="sec-line justify-content-lg-start">
								<span className="sec-line1"></span>
								<span className="sec-line2"></span>
							</div>
							<p className="mb-0 text-center text-lg-start"> Checkout our package, choose your package wisely.</p>
						</div>
					</div> 

					<div className="col-lg-6">
						<div className="pricing-item-01 justify-content-lg-end aos" data-aos="fade-down" data-aos-duration="1500">
							<div className="pricing-item-nav d-flex align-items-center justify-content-between">
								Yearly
								<ul className="nav nav-tabs nav-tabs-rounded nav-justified">
									<li className="nav-item"><Link className="nav-link active" to="/" data-bs-toggle="tab"></Link></li>
									<li className="nav-item"><Link className="nav-link" to="/" data-bs-toggle="tab"></Link></li>
								</ul>
								Monthly
							</div>
						</div>
					</div>
				</div>
				


				
				<div className="row">
					<div className="col-lg-12 mx-auto">

						<div className="tab-content">
							<div className="tab-pane show active" id="monthly">

								
								<div className="row row-gap-3">
									<div className="col-lg-4 aos" data-aos="fade-down" data-aos-duration="1600">
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
												<a href="#" className="btn btn-dark border-0">Get a Quote</a>
											</div>
										</div>
									</div>

									<div className="col-lg-4 aos" data-aos="fade-down" data-aos-duration="1600">
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
												<a href="#" className="btn btn-dark border-0">Get a Quote</a>
											</div>
										</div>
									</div>

									<div className="col-lg-4 aos" data-aos="fade-down" data-aos-duration="1600">
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
												<p><i className="material-icons-outlined">check_circle</i>Full Api Access</p>
												<p><i className="material-icons-outlined">check_circle</i>Full Transaction Tracking</p>
												<p><i className="material-icons-outlined">check_circle</i>White-Label Branding</p>
											</div>
											<div className="plan-btn">
												<a href="#" className="btn btn-dark border-0">Get a Quote</a>
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
												<p>Unlimited listings, full API access, 24/7 support, and advanced featured organizations.</p>
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
												<p><i className="material-icons-outlined">check_circle</i>Full Api Access</p>
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
		</section>
		 

		 
		<section className="faq-section section-padding bg-light ">
			<div className="container">

				
				<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
					<h2 className="mb-2 text-center">Frequently Asked Questions</h2>
					<div className="sec-line">
						<span className="sec-line1"></span>
						<span className="sec-line2"></span>
					</div>
					<p className="mb-0 text-center"> Ready to buy your dream home? find it here.</p>
				</div>
				

				
				<div className="row">
					<div className="col-lg-6 aos" data-aos="fade-up" data-aos-duration="1500">
						<img src="/assets/img/home/bg/faq-img.jpg" alt="" className="img-fluid custom-faq-img rounded" />
					</div>
					<div className="col-lg-6">
						
						<div className="card mb-0">
							<div className="card-body">
								<div>
									<h5 className="mb-4"> General FAQÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s </h5>
									<div className="accordion accordions-items-seperate faq-accordion m-0" id="faq-accordion">

										
										<div className="accordion-item">
											<div className="accordion-header aos" data-aos="fade-down" data-aos-duration="1000">
												<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-1" aria-expanded="true">
													What is real estate?
												</button>
											</div>
											<div id="accordion-1" className="accordion-collapse collapse show" data-bs-parent="#faq-accordion">
												<div className="accordion-body">
													<p className="mb-0">Real estate refers to land and any permanent structures on it, such as homes or buildings.</p>
												</div>
											</div>
										</div>

										
										<div className="accordion-item aos" data-aos="fade-down" data-aos-duration="1000">
											<div className="accordion-header">
												<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-2" aria-expanded="false">
													What types of properties are included in real estate?
												</button>
											</div>
											<div id="accordion-2" className="accordion-collapse collapse" data-bs-parent="#faq-accordion">
												<div className="accordion-body">
													<p className="mb-0">Real estate includes residential, commercial, industrial, land, and special-purpose properties.</p>
												</div>
											</div>
										</div>

										
										<div className="accordion-item aos" data-aos="fade-down" data-aos-duration="1000">
											<div className="accordion-header">
												<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-3" aria-expanded="false">
													What is the role of a real estate agent?
												</button>
											</div>
											<div id="accordion-3" className="accordion-collapse collapse" data-bs-parent="#faq-accordion">
												<div className="accordion-body">
													<p className="mb-0">A real estate agent assists clients in buying, selling, or renting properties by guiding them through the process.</p>
												</div>
											</div>
										</div>
										
									</div>
								</div>
								<div>
									<h5 className="mb-4 mt-4"> Buying FAQÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s </h5>
									<div className="accordion accordions-items-seperate faq-accordion m-0" id="faq-accordion1">

										
										<div className="accordion-item aos" data-aos="fade-down" data-aos-duration="1000">
											<div className="accordion-header">
												<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-4" aria-expanded="true">
													How do I start the home-buying process?
												</button>
											</div>
											<div id="accordion-4" className="accordion-collapse collapse" data-bs-parent="#faq-accordion1">
												<div className="accordion-body">
													<p className="mb-0">Start the home-buying process by checking your budget, getting pre approved for a mortgage, and consulting a real estate agent.</p>
												</div>
											</div>
										</div>
										
										
										<div className="accordion-item aos" data-aos="fade-down" data-aos-duration="1000">
											<div className="accordion-header">
												<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-5" aria-expanded="false">
													How much down payment do I need?
												</button>
											</div>
											<div id="accordion-5" className="accordion-collapse collapse" data-bs-parent="#faq-accordion1">
												<div className="accordion-body">
													<p className="mb-0">The down payment typically ranges from 3% to 20% of the home's price, depending on the loan type and lender requirements.</p>
												</div>
											</div>
										</div>

										
										<div className="accordion-item aos" data-aos="fade-down" data-aos-duration="1000">
											<div className="accordion-header">
												<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-6" aria-expanded="false">
													What is a home inspection?
												</button>
											</div>
											<div id="accordion-6" className="accordion-collapse collapse" data-bs-parent="#faq-accordion1">
												<div className="accordion-body">
													<p className="mb-0">A home inspection is a professional evaluation of a property's condition to identify any issues before finalizing the purchase.</p>
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
		</section>
		 

		 
		<section className="agent-section section-padding bg-dark position-relative">
			<div className="container">

				
				<div className="row align-items-center justify-content-lg-between justify-content-md-between flex-wrap">
					<div className="col-lg-7 aos" data-aos="zoom-in" data-aos-duration="1000">
						
						<div className="section-heading mb-3 mb-lg-0">
							<h2 className="mb-2 text-center text-lg-start  text-white ">Become a Real Estate Agent</h2>
							<p className="mb-0 text-center text-lg-start text-light">At Dream Estate, we provide the tools, training, and support you need to succeed in the competitive real estate market.</p>
						</div>
						
					</div>
					<div className="col-lg-5 position-relative z-1 aos" data-aos="zoom-in" data-aos-duration="1500">
						<div className="text-lg-end text-center ">
							<Link to="/" className="btn btn-xl btn-primary"> Register Now </Link>
						</div>
					</div>
				</div>
				

			</div>


			<i className="fa-solid fa-circle custom-circle-line-1 d-lg-block d-none"></i>
			<i className="fa-solid fa-circle custom-circle-line-2 d-lg-block d-none"></i>


			<img src="/assets/img/home/icons/property-element-1.svg" alt="property-element-0" className="img-fluid custom-element-img-1 d-lg-block d-none" />
			<img src="/assets/img/home/icons/property-element-2.svg" alt="property-element-0" className="img-fluid custom-element-img-2 d-lg-block d-none" />
			<img src="/assets/img/home/city/cities-img.png" alt="property-element-0" className="img-fluid custom-element-img-3 position-absolute end-0 bottom-0 z-0 d-lg-block d-none" />
		</section>
		 

		 
		<section className="home-blog-section section-padding ">
			<div className="container">

				
				<div className="section-heading aos" data-aos="fade-down" data-aos-duration="1000">
					<h2 className="mb-2 text-center">Latest Blog</h2>
					<div className="sec-line">
						<span className="sec-line1"></span>
						<span className="sec-line2"></span>
					</div>
					<p className="mb-0 text-center"> Explore our featured blog posts on premium properties for sales & rents.</p>
				</div>
				


				
                    <div className="row row-gap-4 justify-content-center">

						<div className="col-md-6 col-lg-4 d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="blog-item-01 flex-fill">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-01.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Property</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-01.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Susan Culli</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>10 Apr 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Location is Everything</Link></h5>
                                        <p className="mb-0">The value of a property largely depends on where itÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s located.</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="col-md-6 col-lg-4 d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="blog-item-01 flex-fill">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-02.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Vila</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-04.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Shelly Cox</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>24 Apr 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Real Estate is a Investment</Link></h5>
                                        <p className="mb-0">Unlike stocks, real estate usually grows in value over time.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4 d-flex aos" data-aos="fade-down" data-aos-duration="1500">
                            <div className="blog-item-01 flex-fill">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-03.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Godown</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-02.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Eva Jones</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>27 Sep 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Market Trends Matter</Link></h5>
                                        <p className="mb-0">Staying informed about housing market trends helps you make smarter.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

					</div>

				<div className="text-center d-flex align-items-center justify-content-center m-auto">
					<Link to="/rent-property-grid" className="btn btn-lg btn-dark d-flex align-items-center gap-1"> Explore All <i className="material-icons-outlined">arrow_forward</i></Link>
				</div>

			</div>
		</section>
		 

		 
		<section className="home-support-section section-padding bg-light">
			<div className="container">

				
				<div className="row align-items-center">
					<div className="col-lg-6 aos" data-aos="fade-down" data-aos-duration="1000">
						
						<div className="section-heading mb-3 mb-lg-0">
							<h2 className="mb-2 text-lg-start text-center">Sign Up for Our Newsletter</h2>
							<p className="mb-0 text-lg-start text-center"> Receive news, stay updated, and special offers.</p>
						</div>
						
					</div> 

					<div className="col-lg-6 aos" data-aos="fade-down" data-aos-duration="1500">
						<div className="d-flex align-items-center justify-content-between gap-2">
							<div className="position-relative support-custom-icons">
								<div className="input-group input-group-flat">
									<input type="text" className="form-control bg-white w-100" placeholder="Enter Email Address" /> 
								</div>
								<i className="material-icons-outlined text-dark z-2">email</i>
							</div>
							<Link to="/" className="btn btn-lg btn-primary"> Subscribe</Link>
						</div>
					</div> 

				</div>
				
				
			</div>
		</section>
		 


		

		


		
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

export default Index;



