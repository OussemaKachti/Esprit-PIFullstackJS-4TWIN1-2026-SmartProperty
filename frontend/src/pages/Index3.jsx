import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Index3 = () => {
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


			
			<section className="banner-section-three aos">
				<div className="container">

					
					<div className="row align-items-center justify-content-between">

						<div className="col-xxl-6 col-lg-7">
							<div className="banner-content" data-aos="fade-up">
								<div className="banner-badge d-inline-flex align-items-center">
									<span className="badge bg-warning me-2">New</span>
									<p className="mb-0">No 1 Best Selling Realestate Website</p>
								</div>
								<h1>World's Largest Property Listing site for <span>Rental, Buy & Sell...</span></h1>
								<p>Properties for buy / rent in in your location. We have more than 3000+ listings </p>
								<Link to="/buy-property-grid" className="btn btn-primary"><i className="material-icons-outlined me-2">lock</i>List Your Property</Link>
							</div>
						</div> 

						<div className="col-xxl-4 col-lg-5">
							<div className="banner-right-content">
								<div className="banner-card">
									<div className="me-3 card-img">
										<Link to="/buy-details"><img src="/assets/img/home-3/banner-01.png" className="rounded" alt="" /></Link>
									</div>
									<div>
										<h6 className="text-white"><Link to="/buy-details" className="text-white">Beautiful Condo Room</Link></h6>
										<span className="text-white mb-1 d-block">Willow Crest Apartment</span>
										<p className="rate-info mb-3"><span>$400 </span> / Month</p>
										<div className="d-flex align-items-center card-info">
											<p className="me-3"><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bedroom</p>
											<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										</div>
									</div>
								</div>
								<div className="banner-users d-flex align-items-center flex-wrap gap-2 mb-3">
									<div className="avatar-list-stacked"> 
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-01.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-02.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-03.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-04.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
									</div>
									<div>
										<div className="d-flex align-items-center mb-1">
											<h6 className="mb-0 me-2 text-white fw-semibold fs-14">Ratings 5.0</h6>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
										</div>
										<p className="mb-0 text-white fs-13">Trusted By Client around the World</p>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

					
					<div className="row">

						<div className="col-lg-12">
							<div className="banner-search banner-search-three"  data-aos="fade-down">
								<div className="banner-tab">

									
									<div className="row">
										<div className="col-lg-4">
											<div>
												<h5 className="mb-0">Search For your Property</h5>
											</div>
										</div> 

										<div className="col-lg-8">
											<div>
												<ul className="nav nav-tabs justify-content-lg-end" role="tablist">
													<li className="nav-item" role="presentation">
														<a className="nav-link active" data-bs-toggle="tab" href="#buy_property" role="tab" aria-controls="buy_property" aria-selected="true"> 
															<i className="material-icons-outlined me-2">shopping_basket</i>Buy Property
														</a>
													</li>
													<li className="nav-item" role="presentation">
														<a className="nav-link" data-bs-toggle="tab" href="#rent_property" role="tab" aria-controls="rent_property" aria-selected="false">
															<i className="material-icons-outlined me-2">king_bed</i>Rent Property
														</a>
													</li>
													<li className="nav-item" role="presentation">
														<a className="nav-link" data-bs-toggle="tab" href="#commercial_property" role="tab" aria-controls="commercial_property" aria-selected="false">
															<i className="material-icons-outlined me-2">home</i>Commercial
														</a>
													</li>
												</ul>
											</div>
										</div> 

									</div>
									

								</div>
								<div className="tab-content">
									<div className="tab-pane fade show active" id="buy_property" role="tabpanel">
										<div>
											<form action="buy-property-grid-sidebar.html">

												
												<div className="row g-3">

													<div className="col-lg-4">
														<div>
															<label className="form-label">Type of Property</label>
															<select className="select">
																<option>Select</option>
																<option>Buy Property</option>
																<option>Rent Property</option>
															</select>
														</div>
													</div> 

													<div className="col-lg-4">
														<div>
															<label className="form-label">Location</label>
															<input type="email" className="form-control" placeholder="Search location" />
														</div>
													</div> 

													<div className="col-lg-4">
														<div className="d-flex align-items-end">
															<div className="flex-fill me-3">
																<label className="form-label">Min Price</label>
																<input type="text" className="form-control" placeholder="$" />
															</div>
															<div className="flex-fill me-3">
																<label className="form-label">Max Price</label>
																<input type="text" className="form-control" placeholder="$" />
															</div>
															<div>
																<button type="submit" className="btn btn-primary"><span><i className='material-icons-outlined'>search</i></span></button>
															</div>
														</div>
													</div> 

												</div>
												
												
											</form>
										</div>
									</div>
									<div className="tab-pane fade" id="rent_property" role="tabpanel">
										<div>
											<form action="buy-property-grid-sidebar.html">

												
												<div className="row g-3">

													<div className="col-lg-4">
														<div>
															<label className="form-label">Type of Property</label>
															<select className="select">
																<option>Select</option>
																<option>Buy Property</option>
																<option>Rent Property</option>
															</select>
														</div>
													</div> 

													<div className="col-lg-4">
														<div>
															<label className="form-label">Location</label>
															<input type="email" className="form-control" placeholder="Search location" />
														</div>
													</div> 

													<div className="col-lg-4">
														<div className="d-flex align-items-end">
															<div className="banner-property-grid flex-fill me-3">
																<label className="form-label">Min Price</label>
																<input type="text" className="form-control" placeholder="$" />
															</div>
															<div className="flex-fill me-3">
																<label className="form-label">Max Price</label>
																<input type="text" className="form-control" placeholder="$" />
															</div>
															<div>
																<button type="submit" className="btn btn-primary"><span><i className='material-icons-outlined'>search</i></span></button>
															</div>
														</div>
													</div> 

												</div>
												

											</form>
										</div>
									</div>
									<div className="tab-pane fade" id="commercial_property" role="tabpanel">
										<div>
											<form action="buy-property-grid-sidebar.html">

												
												<div className="row g-3">

													<div className="col-lg-4">
														<div>
															<label className="form-label">Type of Property</label>
															<select className="select">
																<option>Select</option>
																<option>Buy Property</option>
																<option>Rent Property</option>
															</select>
														</div>
													</div> 

													<div className="col-lg-4">
														<div>
															<label className="form-label">Location</label>
															<input type="email" className="form-control" placeholder="Search location" />
														</div>
													</div> 

													<div className="col-lg-4">
														<div className="d-flex align-items-end">
															<div className="banner-property-grid flex-fill me-3">
																<label className="form-label">Min Price</label>
																<input type="text" className="form-control" placeholder="$" />
															</div>
															<div className="flex-fill me-3">
																<label className="form-label">Max Price</label>
																<input type="text" className="form-control" placeholder="$" />
															</div>
															<div>
																<button type="submit" className="btn btn-primary"><span><i className='material-icons-outlined'>search</i></span></button>
															</div>
														</div>
													</div> 

												</div>
												

											</form>
										</div>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="work-section-three">
				<div className="container">

					
					<div className="row justify-content-center gy-4">

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
							<div className="work-card bg-soft-warning flex-fill">
								<div className="work-card-icon mb-3">
									<span className="bg-warning me-2">
										<img src="/assets/img/icons/work-icon-01.svg" alt="icon" />
									</span>
									<h5>Verified Listings</h5>
								</div>
								<p>All properties are thoroughly checked to ensure authenticity and avoid time-wasting.</p>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="200">
							<div className="work-card bg-soft-secondary flex-fill">
								<div className="work-card-icon mb-3">
									<span className="bg-secondary me-2">
										<img src="/assets/img/icons/work-icon-02.svg" alt="icon" />
									</span>
									<h5>Wide Reach</h5>
								</div>
								<p>Access thousands of listings across top cities, towns, and emerging locations.</p>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="300">
							<div className="work-card bg-soft-pink flex-fill">
								<div className="work-card-icon mb-3">
									<span className="bg-pink me-2">
										<img src="/assets/img/icons/work-icon-03.svg" alt="icon" />
									</span>
									<h5>Direct Communication</h5>
								</div>
								<p>Connect instantly with sellers, agents, or property managersÃ¢â‚¬â€no middlemen.</p>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="400">
							<div className="work-card bg-soft-teal flex-fill">
								<div className="work-card-icon mb-3">
									<span className="bg-teal me-2">
										<img src="/assets/img/icons/work-icon-04.svg" alt="icon" />
									</span>
									<h5>Time-Saving </h5>
								</div>
								<p>No need to hop between sitesÃ¢â‚¬â€everything you need to discover and decide is right here.</p>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="property-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>Recommended Properties</h2>
						<p>Discover our top service areas, where quality meets convenience.</p>
					</div>
					

					
					<div className="row gy-4 justify-content-center">

						<div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<a href="#"><img src="/assets/img/home-3/location/location-01.jpg" alt="" /></a>
									<div className="bottom-text">
										<div className="location-name">
											<h5>Ukraine</h5>
											<p>300 Properties</p>
										</div>
										<div className="arrow-overlay">
											<a href="#"><i className="material-icons-outlined">north_east</i></a>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<a href="#"><img src="/assets/img/home-3/location/location-02.jpg" alt="" /></a>
									<div className="bottom-text">
										<div className="location-name">
											<h5>Russia</h5>
											<p>458 Properties</p>
										</div>
										<div className="arrow-overlay">
											<a href="#"><i className="material-icons-outlined">north_east</i></a>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<a href="#"><img src="/assets/img/home-3/location/location-03.jpg" alt="" /></a>
									<div className="bottom-text">
										<div className="location-name">
											<h5>Thailand</h5>
											<p>175 Properties</p>
										</div>
										<div className="arrow-overlay">
											<a href="#"><i className="material-icons-outlined">north_east</i></a>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-6" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<a href="#"><img src="/assets/img/home-3/location/location-04.jpg" alt="" /></a>
									<div className="bottom-text">
										<div className="location-name">
											<h5>Azerbaijan</h5>
											<p>155 Properties</p>
										</div>
										<div className="arrow-overlay">
											<a href="#"><i className="material-icons-outlined">north_east</i></a>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-6" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<a href="#"><img src="/assets/img/home-3/location/location-05.jpg" alt="" /></a>
									<div className="bottom-text">
										<div className="location-name">
											<h5>Germany</h5>
											<p>265 Properties</p>
										</div>
										<div className="arrow-overlay">
											<a href="#"><i className="material-icons-outlined">north_east</i></a>
										</div>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

					<div className="text-center mt-4 pt-3">
						<a href="#" className="btn btn-dark btn-lg d-inline-flex align-items-center">View More Locations<i className="material-icons-outlined ms-1">north_east</i></a>
					</div>
				</div>
			</section>
			

			
			<section className="about-us-section">
				<div className="section-bg">
					<img src="/assets/img/home-3/bg/sec-bg-01.png" className="bg-1" alt="" />
				</div>
				<div className="container">

					
					<div className="row align-items-center">

						<div className="col-lg-6">
							<div className="about-left-content">

								
								<div className="section-headings" data-aos="fade-up" data-aos-duration="1200">
									<span className="text-primary d-block mb-3">About Us</span>
									<div className="sec-line-three justify-content-start">
										<span className="sec-line1"></span>
										<span className="sec-line2"></span>
									</div>
									<h2 className="text-white">Your next property move starts here.</h2>
									<h6 className="mb-3 text-primary">We make property discovery simple, transparent, and stress-free.</h6>
									<p className="text-white mb-4">These hand-picked locations highlight our strongest presence, fastest response times, and highest customer satisfaction. Whether you're looking for expert professionals or trusted services nearby, explore what's available in your area.</p>
									<Link to="/about-us" className="btn btn-primary d-inline-flex">Know More</Link>
								</div>
								

								<div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mt-3">
									<div className="d-flex align-items-center">
										<span className="flex-shrink-0 me-3"><img src="/assets/img/icons/counter-icon-01.svg" alt="" /></span>
										<div className="counter-value">
											<h4 className="dash-count text-white"><span className="counter-up text-white">1514</span>+</h4>
											<p className="text-white">Trusted Owners</p>
										</div>
									</div>
									<div className="d-flex align-items-center">
										<span className="flex-shrink-0 me-3"><img src="/assets/img/icons/counter-icon-02.svg" alt="" /></span>
										<div className="counter-value">
											<h4 className="dash-count text-white"><span className="counter-up text-white">12000</span>+</h4>
											<p className="text-white">Rentals Completed</p>
										</div>
									</div>
									<div className="d-flex align-items-center">
										<span className="flex-shrink-0 me-3"><img src="/assets/img/icons/counter-icon-03.svg" alt="" /></span>
										<div className="counter-value">
											<h4 className="dash-count text-white"><span className="counter-up text-white">9000</span>+</h4>
											<p className="text-white">Happy Clients</p>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-6">
							<div className="property-sec-img">
								<div className="row g-3">
									<div className="col-md-6 d-flex" data-aos="fade-up" data-aos-duration="1200">
										<div className="flex-fill">
											<div><img src="/assets/img/home-3/property/property-01.jpg" alt="" /></div>
										</div>
									</div>
									<div className="col-md-6 d-flex" data-aos="fade-up" data-aos-duration="1200">
										<div className="flex-fill">
											<div className="mb-3"><img src="/assets/img/home-3/property/property-02.jpg" alt="" /></div>
											<div><img src="/assets/img/home-3/property/property-03.jpg" alt="" /></div>
										</div>
									</div>
								</div>
								<div className="img-left-top"><img src="/assets/img/icons/rounded-img.png" alt="" /></div>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="feature-property-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>Featured Property Type</h2>
						<p>Explore Our Curated Selection of Premium Properties for Unmatched Luxury</p>
					</div>
					

					
					<div className="row justify-content-center gy-4">

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-04.jpg" alt="" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-02.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Houses</Link></h5>
										<p>288 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-05.jpg" alt="" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-04.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Offices</Link></h5>
										<p>300 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-06.jpg" alt="" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-01.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Villas</Link></h5>
										<p>250 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-07.jpg" alt="" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-03.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Apartments</Link></h5>
										<p>230 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-08.jpg" alt="" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-05.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Duplexes</Link></h5>
										<p>320 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="post-propert-section">
				<div className="sec-img">
					<img src="/assets/img/home-3/bg/sec-bg-03.png" className="bg-1" alt="" />
					<img src="/assets/img/home-3/bg/sec-bg-09.png" className="bg-2" alt="" />
				</div>
				<div className="container">

					
					<div className="row">

						<div className="col-lg-6">

							
							<div className="section-headings">
								<div className="sec-line-three justify-content-start mb-3">
									<span className="sec-line1"></span>
									<span className="sec-line2"></span>
								</div>
								<span className="text-white d-block mb-3">Post Your Property</span>
								<h2 className="text-white">Looking to Post your Exsisting Property  We Provide Awesome Solution</h2>
								<Link to="/add-property-buy" className="btn btn-primary d-inline-flex">Start Post Your Property</Link>
							</div>
							

						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="rent-propery-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>Featured Properties For Rentals</h2>
						<p>Hand-picked locations highlight our strongest presence, and highest customer satisfaction.</p>
					</div>
					

					
					<div className="row justify-content-center gy-4">

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/rent-details">
										<img src="/assets/img/home-3/property/property-09.jpg" alt="" />
									</Link>
									<div className="favourite">
										<a href="#"><i className="material-icons-outlined">favorite_border</i></a>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-01.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-secondary">Condo</span>
										<span className="date">Listed on : 25 May 2025</span>
									</div>
									<div className="mb-3">
										<h5><Link to="/rent-details">Beautiful Condo Room</Link></h5>
										<p className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">location_on</i>25, Willow Crest Apartment</p>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info mb-0"><span>$400 </span> / Month</p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/rent-details">
										<img src="/assets/img/home-3/property/property-10.jpg" alt="" />
									</Link>
									<div className="favourite">
										<a href="#"><i className="material-icons-outlined">favorite_border</i></a>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-02.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-pink">Suite</span>
										<span className="date">Listed on : 18 Apr 2025</span>
									</div>
									<div className="mb-3">
										<h5><Link to="/rent-details">Serenity Condo Suite</Link></h5>
										<p className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">location_on</i>17, Grove Towers, New York</p>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info mb-0"><span>$500 </span> / Month</p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>1 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>400 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/rent-details">
										<img src="/assets/img/home-3/property/property-11.jpg" alt="" />
									</Link>
									<div className="favourite">
										<a href="#"><i className="material-icons-outlined">favorite_border</i></a>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-03.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-purple">Luxe</span>
										<span className="date">Listed on : 12 Apr 2025</span>
									</div>
									<div className="mb-3">
										<h5><Link to="/rent-details">Downtown Luxe Room</Link></h5>
										<p className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">location_on</i>88, Springs Lane, Austin</p>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info mb-0"><span>$450 </span> / Month</p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>1 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>460 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/rent-details">
										<img src="/assets/img/home-3/property/property-12.jpg" alt="" />
									</Link>
									<div className="favourite">
										<a href="#"><i className="material-icons-outlined">favorite_border</i></a>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-04.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-pink">Suite</span>
										<span className="date">Listed on : 27 Mar 2025</span>
									</div>
									<div className="mb-3">
										<h5><Link to="/rent-details">Modern Haven Suite</Link></h5>
										<p className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">location_on</i>42, Hill Residence, Los Angeles</p>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info mb-0"><span>$600 </span> / Month</p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>1 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>460 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

					<div className="text-center mt-4 pt-3">
						<Link to="/rent-property-grid" className="btn btn-dark d-inline-flex align-items-center">View More<i className="material-icons-outlined ms-1">north_east</i></Link>
					</div>
				</div>
			</section>
			

			
			<section className="how-it-work-section">
				<div className="section-bg">
					<img src="/assets/img/home-3/bg/sec-bg-05.png" className="bg-1" alt="" />
					<img src="/assets/img/home-3/bg/shape-01.svg" className="bg-2" alt="" />
					<img src="/assets/img/home-3/bg/shape-02.svg" className="bg-3" alt="" />
				</div>
				<div className="container">

					
					<div className="row align-items-center">

						<div className="col-lg-7">
							<div className="work-sec-img">
								<div><img src="/assets/img/home-3/bg/sec-bg-04.png" alt="" /></div>
								<div className="banner-users section-users d-flex align-items-center flex-wrap gap-3">
									<div className="avatar-list-stacked"> 
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-01.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-02.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-03.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-04.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
									</div>
									<div>
										<div className="d-flex align-items-center mb-1">
											<h6 className="mb-0 me-2 fs-14 fw-semibold text-white">Ratings 5.0</h6>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
										</div>
										<p className="mb-0 text-white">Trusted By 1000+ Client</p>
									</div>
								</div>
								<div className="shape-3"><img src="/assets/img/home-3/bg/shape-03.svg" alt="" /></div>
							</div>
						</div> 

						<div className="col-lg-5">
							<div>
								<div className="section-headings mb-4">
									<span className="text-primary d-block mb-3">How it Works</span>
									<div className="sec-line-three justify-content-start">
										<span className="sec-line1"></span>
										<span className="sec-line2"></span>
									</div>
									<h2 className="mb-3 text-white">Want tailor this more for a specific niche</h2>
								</div>
								<div>
									<div className="work-steps mb-4">
										<span className="d-block mb-2 text-orange">Step 1</span>
										<h6 className="mb-2 text-white">Search for Location</h6>
										<p className="text-white">Search by location, category, budget, and amenities. Find listings that match your needsÃ¢â‚¬â€whether it's a home, office, or land.</p>
									</div>
									<div className="work-steps mb-4">
										<span className="d-block mb-2 text-pink">Step 2</span>
										<h6 className="mb-2 text-white">Select Property Type</h6>
										<p className="text-white">Choose from modern apartments, spacious houses, stylish condos, or commercial spaces that meet your specific needs.</p>
									</div>
									<div className="work-steps mb-0">
										<span className="d-block mb-2 text-teal">Step 3</span>
										<h6 className="mb-2 text-white">Book Your Property</h6>
										<p className="text-white">Select your preferred property type, provide your details, and confirm your booking in just a few easy steps.</p>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="rent-propery-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>Featured Properties For Sale</h2>
						<p>Discover Exclusive Listings of Premium Properties Available for Purchase</p>
					</div>
					

					
					<div className="row justify-content-center gy-4">

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/buy-details">
										<img src="/assets/img/home-3/property/property-13.jpg" alt="" />
									</Link>
									<div className="favourite">
										<a href="#"><i className="material-icons-outlined">favorite_border</i></a>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-01.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-secondary">Apartment</span>
										<span className="date">Listed on : 25 May 2025</span>
									</div>
									<div className="mb-3">
										<p className="d-inline-flex align-items-center mb-1"><i className="material-icons-outlined me-1">location_on</i>25, Willow Crest Apartment</p>
										<h5><Link to="/buy-details">Royal Apartment</Link></h5>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info d-inline-flex align-items-center mb-0">Starts From <span className="ms-2">$400 </span></p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/buy-details">
										<img src="/assets/img/home-3/property/property-14.jpg" alt="" />
									</Link>
									<div className="favourite">
										<a href="#"><i className="material-icons-outlined">favorite_border</i></a>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-02.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-purple">Villa</span>
										<span className="date">Listed on : 18 Apr 2025</span>
									</div>
									<div className="mb-3">
										<p className="d-inline-flex align-items-center mb-1"><i className="material-icons-outlined me-1">location_on</i>10, Oak Ridge Villa</p>
										<h5><Link to="/buy-details">Grand Villa House</Link></h5>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info d-inline-flex align-items-center mb-0">Starts From <span className="ms-2">$2200 </span></p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/buy-details">
										<img src="/assets/img/home-3/property/property-15.jpg" alt="" />
									</Link>
									<div className="favourite">
										<a href="#"><i className="material-icons-outlined">favorite_border</i></a>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-03.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-pink">Suite</span>
										<span className="date">Listed on : 20 Mar 2025</span>
									</div>
									<div className="mb-3">
										<p className="d-inline-flex align-items-center mb-1"><i className="material-icons-outlined me-1">location_on</i>42, Maple Grove Residences</p>
										<h5><Link to="/buy-details">Elite Suite Room</Link></h5>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info d-inline-flex align-items-center mb-0">Starts From <span className="ms-2">$1680</span></p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/buy-details">
										<img src="/assets/img/home-3/property/property-16.jpg" alt="" />
									</Link>
									<div className="favourite">
										<a href="#"><i className="material-icons-outlined">favorite_border</i></a>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-04.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-orange">Residency</span>
										<span className="date">Listed on : 12 Mar 2025</span>
									</div>
									<div className="mb-3">
										<p className="d-inline-flex align-items-center mb-1"><i className="material-icons-outlined me-1">location_on</i>88, Pine Valley Heights</p>
										<h5><Link to="/buy-details">Celestial Residency</Link></h5>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info d-inline-flex align-items-center mb-0">Starts From <span className="ms-2">$1800</span></p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

					<div className="text-center mt-4 pt-3">
						<Link to="/buy-property-grid" className="btn btn-dark d-inline-flex align-items-center">View More<i className="material-icons-outlined ms-1">north_east</i></Link>
					</div>
				</div>
			</section>
			

			
			<section className="success-stories-section">
				<div className="section-bg">
					<img src="/assets/img/home-3/bg/sec-bg-07.png" className="bg-1" alt="" />
					<img src="/assets/img/home-3/bg/sec-bg-10.png" className="bg-2" alt="" />
				</div>
				<div className="container">

					
					<div className="row align-items-center">

						<div className="col-lg-4">
							<div className="section-left-content">
								<div className="section-headings mb-4">
									<div className="sec-line-three justify-content-start mb-3">
										<span className="sec-line1"></span>
										<span className="sec-line2"></span>
									</div>
									<h2 className="mb-2">Success stories in their own words</h2>
									<p className="mb-4">Read what our satisfied clients have to say about their experiences with our platform.</p>
									<a href="#" className="btn btn-dark d-inline-flex align-items-center">View More<i className="material-icons-outlined ms-1">north_east</i></a>
								</div>
								<div className="success-customer mb-4">
									<h6>Trusted by 50K+ customers</h6>
									<div className="d-flex align-items-center rating mb-1">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										4.4/5.0
										<span className="border-start ps-2 ms-2">3,857 Reviews</span>
									</div>
								</div>
								<div className="arrow-bottom"><img src="/assets/img/home-3/bg/arrow.svg" alt="" /></div>
							</div>
						</div> 

						<div className="col-lg-8">
							<div>

								
								<div className="row">

									<div className="col-md-6">
										<div className="review-item mb-4">
											<span className="d-block mb-3"><img src="/assets/img/icons/quote-down-02.svg" alt="" /></span>
											<div className="d-flex align-items-center mb-2">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
											</div>
											<p>Booking our dream home was incredibly easy with Dreams Estate The interface was user-friendly</p>
											<div className="review-customer">
												<a href="#" className="avatar avatar-md rounded-circle flex-shrink-0 me-2">
													<img src="/assets/img/users/user-02.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
												</a>
												<h6 className="me-2"><a href="#">Lily Brooks</a></h6>
												<span className="d-inline-flex align-items-center"><i className="fa-solid fa-circle me-2"></i>South Africa</span>
											</div>
										</div>
										<div className="review-item mb-4">
											<span className="d-block mb-3"><img src="/assets/img/icons/quote-down-02.svg" alt="" /></span>
											<div className="d-flex align-items-center mb-2">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
											</div>
											<p>Dreams Estate made home booking a breeze. Super easy and stress-free!</p>
											<div className="review-customer">
												<a href="#" className="avatar avatar-md rounded-circle flex-shrink-0 me-2">
													<img src="/assets/img/users/user-04.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
												</a>
												<h6 className="me-2"><a href="#">Daniel Cooper</a></h6>
												<span className="d-inline-flex align-items-center"><i className="fa-solid fa-circle me-2"></i>United States of America</span>
											</div>
										</div>
									</div> 

									<div className="col-md-6 mt-4">
										<div className="review-item mb-4">
											<span className="d-block mb-3"><img src="/assets/img/icons/quote-down-02.svg" alt="" /></span>
											<div className="d-flex align-items-center mb-2">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
											</div>
											<p>Booking our dream home was so simple with Dreams Estate. The site was easy to use!</p>
											<div className="review-customer">
												<a href="#" className="avatar avatar-md rounded-circle flex-shrink-0 me-2">
													<img src="/assets/img/users/user-06.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
												</a>
												<h6 className="me-2"><a href="#">Ethan Wells</a></h6>
												<span className="d-inline-flex align-items-center"><i className="fa-solid fa-circle me-2"></i>United Kingdom</span>
											</div>
										</div>
										<div className="review-item mb-4">
											<span className="d-block mb-3"><img src="/assets/img/icons/quote-down-02.svg" alt="" /></span>
											<div className="d-flex align-items-center mb-2">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
											</div>
											<p>Dreams Estate made booking our dream home effortless. The interface was so easy to navigate!</p>
											<div className="review-customer">
												<a href="#" className="avatar avatar-md rounded-circle flex-shrink-0 me-2">
													<img src="/assets/img/users/user-17.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
												</a>
												<h6 className="me-2"><a href="#">Emma Davidson</a></h6>
												<span className="d-inline-flex align-items-center"><i className="fa-solid fa-circle me-2"></i>Japan</span>
											</div>
										</div>
									</div> 

								</div>
								

							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<div className="partners-logos">
				<div className="container">

					
					<div className="row">

						<div className="col-md-12">
							<div className="partner-slider swiper">
								<div className="swiper-wrapper">
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-07.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-08.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-09.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-10.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-11.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-12.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-13.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-08.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-07.svg" alt="" /></div>
								</div>
							</div>
						</div> 

					</div>
					

				</div>
			</div>
			

			
			<section className="latest-blog-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>Latest Blogs</h2>
						<p>Explore our featured blog posts on premium properties for sales & rents</p>
					</div>
					

					
					<div className="row">

						<div className="col-xl-6 d-flex">
							<div className="blog-item mb-4 flex-fill">
								<div className="blog-img">
									<Link to="/blog-details">
										<img src="/assets/img/home-3/blog/blog-01.jpg" alt="" />
									</Link>
									<span className="badge bg-secondary badge-top">Booking Tips</span>
								</div>
								<div className="blog-content">
									<h5 className="mb-2"><Link to="/blog-details">Top 10 Tips for First-Time Homebuyers</Link></h5>
									<p className="mb-2">Buying your first home? Learn how to budget, choose the right location, and avoid common mistakes.</p>
									<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-2">event</i>27 Sep 2025</span>
								</div>
							</div>
						</div> 

						<div className="col-xl-6 d-flex">
							<div className="flex-fill">
								<div className="blog-item blog-item-2 mb-4">

									
									<div className="row">

										<div className="col-md-6 d-flex">
											<div className="blog-img flex-fill">
												<Link to="/blog-details">
													<img src="/assets/img/home-3/blog/blog-02.jpg" alt="" />
												</Link>
												<span className="badge bg-secondary badge-top">Invest</span>
											</div>
										</div> 
										<div className="col-md-6 d-flex">
											<div className="blog-content flex-fill">
												<h5 className="mb-2"><Link to="/blog-details">Best Emerging Locations to Invest in 2025</Link></h5>
												<p className="mb-2">Discover fast-growing areas offering high returns on real estate investments this year.</p>
												<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-2">event</i>27 Sep 2025</span>
											</div>
										</div> 

									</div>
									

								</div>
								<div className="blog-item blog-item-2 mb-4">

									
									<div className="row">

										<div className="col-md-6 d-flex">
											<div className="blog-img flex-fill">
												<Link to="/blog-details">
													<img src="/assets/img/home-3/blog/blog-03.jpg" alt="" />
												</Link>
												<span className="badge bg-secondary badge-top">Renting</span>
											</div>
										</div> 

										<div className="col-md-6 d-flex">
											<div className="blog-content flex-fill">
												<h5 className="mb-2"><Link to="/blog-details">Renting vs. Buying: Which Is Right for You?</Link></h5>
												<p className="mb-2">A practical guide to help you decide whether to rent or buy based on your lifestyle and finances.</p>
												<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-2">event</i>17 Jan 2025</span>
											</div>
										</div> 

									</div>
									

								</div>
							</div>
						</div> 

					</div>
					

					<div className="text-center mt-3">
						<Link to="/blog-grid" className="btn btn-dark d-inline-flex align-items-center">View More<i className="material-icons-outlined ms-1">north_east</i></Link>
					</div>
				</div>
			</section>
			

			
			<div className="contact-field-section">
				<div className="container">
					<div className="contact-field">
						<div><img src="/assets/img/home-3/bg/sec-bg-08.png" className="bg-1" alt="" /></div>

						
						<div className="row align-items-center justify-content-lg-between gy-4">

							<div className="col-lg-5">
								<div>
									<h2 className="text-white mb-2">Let's Stay in Touch</h2>
									<p className="text-white">Receive news, stay updated, and special offers</p>
								</div>
							</div> 

							<div className="col-lg-5">
								<form action="#">
									<div className="d-flex align-items-center email-forms">
										<div className="contact-box align-items-center justify-content-center flex-fill">
											<span className="input-icon d-inline-flex align-items-center"><i className="material-icons-outlined">email</i></span>
											<input type="email" className="form-control" placeholder="Enter Email Address" />
										</div>
										<button type="submit"><i className='material-icons-outlined'>send</i></button>
									</div>
								</form>
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

export default Index3;




