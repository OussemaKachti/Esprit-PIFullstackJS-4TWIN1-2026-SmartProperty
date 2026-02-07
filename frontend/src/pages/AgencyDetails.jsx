import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const AgencyDetails = () => {
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


	

	

	
	<div className="page-wrapper">

		<div className="breadcrumb-bar">
			<img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
			<img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
			<img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
			<div className="row align-items-center text-center position-relative z-1">
				<div className="col-md-12 col-12 breadcrumb-arrow">
					<h1 className="breadcrumb-title">Agency Details</h1>
					<nav aria-label="breadcrumb" className="page-breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
							<li className="breadcrumb-item active" aria-current="page">Agency Details</li>
						</ol>
					</nav>							
				</div>
			</div>
		</div>
		

		
		<div className="content">
			<div className="container">
				<div className="agent-profile-item">
					<div className="agent-img">
						<img src="/assets/img/agency/agency-02.png" alt="" />
					</div>
					<div className="agent-content flex-fill">
						<div className="d-flex align-items-center mb-3">
							<i className="material-icons-outlined text-warning">star</i>
							<i className="material-icons-outlined text-warning">star</i>
							<i className="material-icons-outlined text-warning">star</i>
							<i className="material-icons text-warning">star_border</i>
							<i className="material-icons text-warning">star_border</i>
							<span className="fs-14 ms-1">5.0 (37 Reviews)</span>
						</div>
						<div className="d-flex align-items-center justify-content-between border-bottom flex-wrap row-gap-3 pb-3 mb-3">
							<div>
								<h5 className="mb-1">Greens Reality</h5>
								<p className="mb-0 fs-14">New York, Queens</p>
							</div>
							<div className="d-flex align-items-center">
								<Link to="/agency-details" className="btn btn-primary d-inline-flex align-items-center me-2"><i className="material-icons-outlined me-1">chat_bubble_outline</i>WhatsApp</Link>
								<Link to="/agency-details" className="btn btn-dark d-inline-flex align-items-center"><i className="material-icons-outlined me-1">call</i>Call Me</Link>
							</div>
						</div>
						<div className="agent-info">
							<p>Member Since : <span>28 Apr 2025</span></p>
							<p>Agent License : <span>090-0348-843</span></p>
							<p>Tax Number : <span>090-0348-843</span></p>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-8 theiaStickySidebar">
						<div className="accordion accordions-items-seperate">
							<div className="accordion-item">
								<div className="accordion-header">
									<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-1" aria-expanded="true">
										About 
									</button>
								</div>
								<div id="accordion-1" className="accordion-collapse collapse show">
									<div className="accordion-body">
										<p>
										With generous frontage on a paved county road and all necessary utilities 
										at the boundary, you can build your dream cabin, homestead, or weekend 
										getaway with ease. Imagine sipping your morning coffee on a wrap-around 
										porch as mist drifts through the valley below, or gathering around a firepit under a canopy of stars.
										</p>
										<div className="more-menu">
											<p>Imagine sipping your morning coffee on a wrap-around 
											porch as mist drifts through the valley below, or gathering around a firepit under a canopy of stars.
											</p>
										</div>
										<div className="view-all d-inline-flex align-items-center">
											<a href="#" className="viewall-button">Read More </a>
											<i className="material-icons-outlined">keyboard_arrow_down</i>
										</div>
									</div>
								</div>
							</div>
							<div className="accordion-item">
								<div className="accordion-header">
									<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-2" aria-expanded="true">
										Service Areas
									</button>
								</div>
								<div id="accordion-2" className="accordion-collapse collapse show">
									<div className="accordion-body">
										<div className="service-area">
											<p className="d-inline-flex align-items-center"><span className="d-inline-flex me-2"><i className="material-icons-outlined">place</i></span>Chicago</p>
											<p className="d-inline-flex align-items-center"><span className="d-inline-flex me-2"><i className="material-icons-outlined">place</i></span>Los Angeles</p>
											<p className="d-inline-flex align-items-center"><span className="d-inline-flex me-2"><i className="material-icons-outlined">place</i></span>Miami Beach</p>
											<p className="d-inline-flex align-items-center"><span className="d-inline-flex me-2"><i className="material-icons-outlined">place</i></span>New York</p>
										</div>
									</div>
								</div>
							</div>
							<div className="accordion-item">
								<div className="accordion-header">
									<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-3" aria-expanded="true">
										Specialities
									</button>
								</div>
								<div id="accordion-3" className="accordion-collapse collapse show">
									<div className="accordion-body">
										<div className="d-flex align-items-center flex-wrap row-gap-3">
											<span className="badge bg-light text-dark me-3">Property Management</span>
											<span className="badge bg-light text-dark me-3">Real Estate Management</span>
											<span className="badge bg-light text-dark me-3">Real Estate Appraising</span>
											<span className="badge bg-light text-dark">Apartment Brokerage</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="border-top position-relative mt-3 pt-3 mb-3 mb-lg-0">
							<h5 className="mb-4">My Listing </h5>
							<ul className="nav nav-pills listing-nav" role="tablist">
								<li className="nav-item" role="presentation">
									<Link className="nav-link active" data-bs-toggle="tab" to="/agency-details" role="tab" aria-controls="listing-1" aria-selected="true"> 
										<i className="material-icons-outlined me-2">maps_home_work</i>All Properties (25)
									</Link>
								</li>
								<li className="nav-item" role="presentation">
									<Link className="nav-link" data-bs-toggle="tab" to="/agency-details" role="tab" aria-controls="listing-2" aria-selected="false" tabindex="-1">
										<i className="material-icons-outlined me-2">apartment</i>Apartment
									</Link>
								</li>
								<li className="nav-item" role="presentation">
									<Link className="nav-link" data-bs-toggle="tab" to="/agency-details" role="tab" aria-controls="listing-3" aria-selected="false" tabindex="-1">
										<i className="material-icons-outlined me-2">corporate_fare</i>Condos
									</Link>
								</li>
								<li className="nav-item" role="presentation">
									<Link className="nav-link" data-bs-toggle="tab" to="/agency-details" role="tab" aria-controls="listing-4" aria-selected="false" tabindex="-1">
										<i className="material-icons-outlined me-2">home</i>Home
									</Link>
								</li>
							</ul>
							<div className="tab-content">
								<div className="tab-pane fade active show" id="listing-1" role="tabpanel">
									<div className="swiper listing-slider">

										<div className="swiper-wrapper">

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-01.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-01.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div> 
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Serenity Condo Suite</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-02.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-02.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div>
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Serenity Condo Suite</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-03.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-03.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div> 
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Serenity Condo Suite</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

										</div>
										<div className="swiper-button-next"></div>
										<div className="swiper-button-prev"></div>
									</div>
								</div>
								<div className="tab-pane fade" id="listing-2" role="tabpanel">
									<div className="swiper listing-slider">

										<div className="swiper-wrapper">
											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-04.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-04.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div> 
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Palm Cove Bungalows</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div>
											</div> 

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-05.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-05.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div>
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Blue Horizon Villa</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-06.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-06.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div>
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Wanderlust Lodge</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div>
										</div>

										<div className="swiper-button-next"></div>
										<div className="swiper-button-prev"></div>
									</div>
								</div>
								<div className="tab-pane fade" id="listing-3" role="tabpanel">
									<div className="swiper listing-slider">

										<div className="swiper-wrapper">

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-03.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-03.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div> 
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Grand Villa House</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-01.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-01.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div>
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Serenity Condo Suite</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-07.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-07.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div> 
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Elite Suite Room</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

										</div>
										<div className="swiper-button-next"></div>
										<div className="swiper-button-prev"></div>
										<div className="swiper-pagination"></div>
									</div>
								</div>
								<div className="tab-pane fade" id="listing-4" role="tabpanel">
									<div className="swiper listing-slider">

										<div className="swiper-wrapper">

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-07.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-07.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div> 
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Elite Suite Room</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-08.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-08.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div>
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Celestial Residency</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

											<div className="property-listing-item swiper-slide">
												<div className="buy-grid-img">
													<Link to="/buy-details" className="position-relative">
														<img className="img-fluid rounded" src="/assets/img/buy/buy-grid-img-09.jpg" alt="buy-grid-img-01" />
													</Link>
													<div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3">
														<div className="d-flex align-items-center gap-2">
															<div className="badge badge-sm bg-danger d-flex align-items-center">
																<i className="material-icons-outlined">offline_bolt</i>Trending
															</div>
															<div className="badge badge-sm bg-orange d-flex align-items-center">
																<i className="material-icons-outlined">loyalty</i>Featured
															</div>
														</div>
														<a href="javascript:void(0)" className="favourite">
															<i className="material-icons-outlined">favorite_border</i>
														</a>
													</div>
													<div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3">
														<span className="badge bg-light text-dark">For Rent</span>
														<div className="user-avatar avatar avatar-md">
															<img src="/assets/img/users/user-09.jpg" alt="User" className="rounded-circle" />
														</div>
													</div>
												</div> 
												<div className="buy-grid-content">
													<div className="d-flex align-items-center justify-content-between mb-3">
														<div>
															<h6 className="title">
																<Link to="/buy-details">Cedar Grove Residences</Link> 
															</h6>
															<p className="d-flex align-items-center gap-1 mb-0"><i className="material-icons-outlined ms-0">location_on</i> 17, Grove Towers, New York, USA</p>
														</div>
														<span className="badge bg-secondary">Condo</span>
													</div>
													<div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
														<div className="d-flex align-items-center justify-content-center">
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons-outlined text-warning">star</i>
															<i className="material-icons text-warning">star_border</i>
															<i className="material-icons text-warning">star_border</i>
															<span className="ms-1 fs-14">4.8</span>
														</div>
														<div className="d-flex align-items-center">
															<span>Starts From</span>
															<h6 className="text-primary mb-0 ms-1">$1596</h6>
														</div>
													</div>
													<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1">
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bed</i>
															4 Beds
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">bathtub</i>
															4 Baths
														</li>
														<li className="d-flex align-items-center gap-1">
															<i className="material-icons-outlined bg-light text-dark">straighten</i>
															35000 Sqft
														</li>
													</ul>
												</div> 
											</div> 

										</div>
										<div className="swiper-button-next"></div>
										<div className="swiper-button-prev"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-4 theiaStickySidebar">
						<div className="card">
							<div className="card-header">
								<h5 className="mb-0">Enquiry</h5>
							</div>
							<div className="card-body">
								<div className="mb-3">
									<input type="text" className="form-control" placeholder="Your Name" />
								</div>
								<div className="mb-3">
									<input type="text" className="form-control" placeholder="Your Email" />
								</div>
								<div className="mb-3">
									<input type="text" className="form-control" placeholder="Your Phone Number" />
								</div>
								<div className="mb-3">
									<select className="select">
										<option>Select</option>
										<option>Apartment</option>
										<option>Villa</option>
									</select>
								</div>
								<div className="mb-3">
									<textarea className="form-control" rows="3" placeholder="Yes, IÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢m Interested"></textarea>
								</div>
								<div>
									<Link to="/agency-details" className="btn btn-dark w-100">Send Email</Link>
								</div>
							</div>
						</div>
						<div className="card">
							<div className="card-header">
								<h5 className="mb-0">Our Agents</h5>
							</div>
							<div className="card-body">
								<div className="d-flex align-items-center">
									<span className="avatar avatar-rounded me-2"><img src="/assets/img/users/user-02.jpg" alt="" /></span>
									<div>
										<h6 className="mb-0">Maya Tolliver</h6>
										<div className="d-flex align-items-center">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="fs-14 ms-1">5.0 (37 Reviews)</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="card">
							<div className="card-header">
								<h5 className="mb-0">Contact</h5>
							</div>
							<div className="card-body">
								<ul className="contacts-list">
									<li><span><i className="material-icons-outlined">phone</i></span>Call Us : +1 12545 45548</li>
									<li><span><i className="material-icons-outlined">phone_android</i></span>Mobile : +1 52874 15879</li>
									<li><span><i className="material-icons-outlined">phone</i></span>Fax : 4587921057</li>
									<li><span><i className="material-icons-outlined">language</i></span>Website : example.com</li>
									<li><span><i className="material-icons-outlined">alternate_email</i></span>Address : 7698 Creekwood Blvd</li>
									<li><span><i className="material-icons-outlined">email</i></span>Email : </li>
								</ul>
							</div>
						</div>
						<div className="card mb-0">
							<div className="card-header">
								<h5 className="mb-0">Share Property</h5>
							</div>
							<div className="card-body">
								<div className="social-icons">
									<Link to="/agency-details"><i className="fa-brands fa-x-twitter"></i></Link>
									<Link to="/agency-details"><i className="fa-brands fa-facebook"></i></Link>
									<Link to="/agency-details"><i className="fa-brands fa-instagram"></i></Link>
									<Link to="/agency-details"><i className="fa-brands fa-linkedin"></i></Link>
									<Link to="/agency-details"><i className="fa-brands fa-pinterest"></i></Link>
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

export default AgencyDetails;



