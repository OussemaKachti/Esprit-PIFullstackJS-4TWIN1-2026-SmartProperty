import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const AgencyListSidebar = () => {
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
					<h1 className="breadcrumb-title">Agency List With Sidebar</h1>
					<nav aria-label="breadcrumb" className="page-breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
							<li className="breadcrumb-item active" aria-current="page">Agency List With Sidebar</li>
						</ol>
					</nav>							
				</div>
			</div>
		</div>
		

		
		<div className="content">
			<div className="container">

				<div className="row">
					<div className="col-xl-3 theiaStickySidebar">
						<div className="filter-sidebar border-0">
							<div className="filter-body">
								<div className="filter-set p-0">
									<div className="d-flex align-items-center">
										<div className="d-flex justify-content-between w-100 filter-search-head p-3" data-bs-toggle="collapse" data-bs-target="#search" aria-expanded="false" role="button">
											<h6 className="d-inline-flex align-items-center mb-0">Search</h6>
											<i className="material-icons-outlined expand-arrow">expand_less</i>
										</div>
									</div>
									<div id="search" className="collapse show p-3 border-top">
										<div className="input-group input-group-flat mb-3">
											<span className="input-group-text border-0">
												<i className="material-icons-outlined">search</i>
											</span>
											<input type="text" className="form-control" placeholder="Search here..." />
										</div>
										<div className="mb-3">
											<label className="form-label">Agency Type</label>
											<select className="select">
												<option>Buying Agency</option>
												<option>Selling Agency</option>
											</select>
										</div>
										<div className="mb-3">
											<label className="form-label">Select City</label>
											<select className="select">
												<option>Select</option>
												<option>Texas</option>
												<option>New York</option>
											</select>
										</div>
										<div className="mb-3">
											<label className="form-label">Select Area</label>
											<select className="select">
												<option>Select</option>
												<option>Chicago</option>
												<option>Los Angeles</option>
												<option>Miami Beach</option>
												<option>New York</option>
											</select>
										</div>
										<div>
											<label className="form-label">Select Category</label>
											<select className="select">
												<option>Select</option>
												<option>Villa</option>
												<option>Apartment</option>
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="filter-sidebar border-0 mb-xl-0">
							<div className="filter-body">
								<div className="filter-set p-0">
									<div className="d-flex align-items-center">
										<div className="d-flex justify-content-between w-100 filter-search-head p-3" data-bs-toggle="collapse" data-bs-target="#category" aria-expanded="false" role="button">
											<h6 className="mb-0">Categories</h6>
											<i className="material-icons-outlined expand-arrow">expand_less</i>
										</div>
									</div>
									<div id="category" className="collapse show p-3 border-top">
										<div>
											<div className="form-check d-flex align-items-center ps-0 mb-2">
												<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_1" />
												<label className="form-check-label ms-2" htmlFor="check_1">
													Rentals (24)
												</label>
											</div>
											<div className="form-check d-flex align-items-center ps-0">
												<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_2" />
												<label className="form-check-label ms-2" htmlFor="check_2">
													Sales (75)
												</label>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-9">
						<div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agency-details"><img src="/assets/img/agency/agency-01.png" alt="" /></Link>
								</div>
								<div className="agent-content">
									<div className="d-flex align-items-center mb-2">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons text-warning">star_border</i>
										<i className="material-icons text-warning">star_border</i>
										<span className="ms-1 fs-14">4.2 (28 Reviews)</span>
									</div>
									<div className="d-flex align-items-center justify-content-between mb-3">
										<div>
											<h5 className="mb-1"><Link to="/agency-details">Greens Reality</Link></h5>
											<p className="mb-0 d-inline-flex align-items-center"><i className="material-icons-outlined me-1">place</i>New York, Queens</p>
										</div>
										<span className="badge bg-secondary">10 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">We offer a free, data-driven property valuation to help you price it right from day oneÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âno guesswork.</p>
									</div>
									<div className="social-icons">
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agency-details"><img src="/assets/img/agency/agency-02.png" alt="" /></Link>
								</div>
								<div className="agent-content">
									<div className="d-flex align-items-center mb-2">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons text-warning">star_border</i>
										<i className="material-icons text-warning">star_border</i>
										<span className="ms-1 fs-14">4.0 (28 Reviews)</span>
									</div>
									<div className="d-flex align-items-center justify-content-between mb-3">
										<div>
											<h5 className="mb-1"><Link to="/agency-details">Homes Estate</Link></h5>
											<p className="mb-0 d-inline-flex align-items-center"><i className="material-icons-outlined me-1">place</i>City Center, Manhattan</p>
										</div>
										<span className="badge bg-secondary">10 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">From high-quality photography and video tours to listings on top portals and social mediaÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âyour property gets maximum exposure.</p>
									</div>
									<div className="social-icons">
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agency-details"><img src="/assets/img/agency/agency-03.png" alt="" /></Link>
								</div>
								<div className="agent-content">
									<div className="d-flex align-items-center mb-2">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons text-warning">star_border</i>
										<i className="material-icons text-warning">star_border</i>
										<span className="ms-1 fs-14">3.0 (17 Reviews)</span>
									</div>
									<div className="d-flex align-items-center justify-content-between mb-3">
										<div>
											<h5 className="mb-1"><Link to="/agency-details">Luxurious Estate</Link></h5>
											<p className="mb-0 d-inline-flex align-items-center"><i className="material-icons-outlined me-1">place</i>Las Vegas</p>
										</div>
										<span className="badge bg-secondary">10 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">We know the neighborhoods, trends, and buyer behaviorÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âso we market your home with precision.</p>
									</div>
									<div className="social-icons">
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agency-details"><img src="/assets/img/agency/agency-04.png" alt="" /></Link>
								</div>
								<div className="agent-content">
									<div className="d-flex align-items-center mb-2">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons text-warning">star_border</i>
										<i className="material-icons text-warning">star_border</i>
										<span className="ms-1 fs-14">4.0 (25 Reviews)</span>
									</div>
									<div className="d-flex align-items-center justify-content-between mb-3">
										<div>
											<h5 className="mb-1"><Link to="/agency-details">Louis Realtors</Link></h5>
											<p className="mb-0 d-inline-flex align-items-center"><i className="material-icons-outlined me-1">place</i>New York, Queens</p>
										</div>
										<span className="badge bg-secondary">10 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">Our skilled agents negotiate on your behalf to ensure you get the best possible dealÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âfast and hassle-free.</p>
									</div>
									<div className="social-icons">
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agency-details"><img src="/assets/img/agency/agency-05.png" alt="" /></Link>
								</div>
								<div className="agent-content">
									<div className="d-flex align-items-center mb-2">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons text-warning">star_border</i>
										<i className="material-icons text-warning">star_border</i>
										<span className="ms-1 fs-14">4.0 (38 Reviews)</span>
									</div>
									<div className="d-flex align-items-center justify-content-between mb-3">
										<div>
											<h5 className="mb-1"><Link to="/agency-details">Queen Estate</Link></h5>
											<p className="mb-0 d-inline-flex align-items-center"><i className="material-icons-outlined me-1">place</i>Tawin City, NE</p>
										</div>
										<span className="badge bg-secondary">10 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">We handle the paperwork, title checks, and compliance to protect you from any legal pitfalls.</p>
									</div>
									<div className="social-icons">
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agency-details"><img src="/assets/img/agency/agency-06.png" alt="" /></Link>
								</div>
								<div className="agent-content">
									<div className="d-flex align-items-center mb-2">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons text-warning">star_border</i>
										<i className="material-icons text-warning">star_border</i>
										<span className="ms-1 fs-14">5.0 (37 Reviews)</span>
									</div>
									<div className="d-flex align-items-center justify-content-between mb-3">
										<div>
											<h5 className="mb-1"><Link to="/agency-details">Reayal Estate</Link></h5>
											<p className="mb-0 d-inline-flex align-items-center"><i className="material-icons-outlined me-1">place</i>Pawnee City, NE</p>
										</div>
										<span className="badge bg-secondary">10 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">No time-wasters. We pre-screen every potential buyer to ensure theyÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢re financially ready and serious.</p>
									</div>
									<div className="social-icons">
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agency-details"><img src="/assets/img/agency/agency-07.png" alt="" /></Link>
								</div>
								<div className="agent-content">
									<div className="d-flex align-items-center mb-2">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons text-warning">star_border</i>
										<i className="material-icons text-warning">star_border</i>
										<span className="ms-1 fs-14">5.0 (37 Reviews)</span>
									</div>
									<div className="d-flex align-items-center justify-content-between mb-3">
										<div>
											<h5 className="mb-1"><Link to="/agency-details">Newhome Estate</Link></h5>
											<p className="mb-0 d-inline-flex align-items-center"><i className="material-icons-outlined me-1">place</i>Barron, WI</p>
										</div>
										<span className="badge bg-secondary">10 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">YouÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ll never be left wonderingÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âwe keep you in the loop with regular updates on viewings, offers, and market feedback.</p>
									</div>
									<div className="social-icons">
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agency-details"><img src="/assets/img/agency/agency-08.png" alt="" /></Link>
								</div>
								<div className="agent-content">
									<div className="d-flex align-items-center mb-2">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons text-warning">star_border</i>
										<i className="material-icons text-warning">star_border</i>
										<span className="ms-1 fs-14">5.0 (37 Reviews)</span>
									</div>
									<div className="d-flex align-items-center justify-content-between mb-3">
										<div>
											<h5 className="mb-1"><Link to="/agency-details">Real Estate</Link></h5>
											<p className="mb-0 d-inline-flex align-items-center"><i className="material-icons-outlined me-1">place</i>Correll, MN</p>
										</div>
										<span className="badge bg-secondary">10 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">Our proven process and wide buyer network help you sell quicklyÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âoften above market average timeframes.</p>
									</div>
									<div className="social-icons">
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agency-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="text-center pt-3">
								<Link to="/agency-list-sidebar" className="btn btn-dark align-items-center d-inline-flex"><i className="material-icons-outlined me-1">autorenew</i>Load More</Link>
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

export default AgencyListSidebar;



