import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const AgentListSidebar = () => {
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
					<h1 className="breadcrumb-title">Agent List With Sidebar</h1>
					<nav aria-label="breadcrumb" className="page-breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
							<li className="breadcrumb-item active" aria-current="page">Agent List With Sidebar</li>
						</ol>
					</nav>							
				</div>
			</div>
		</div>
		

		
		<div className="content">
			<div className="container">

				<div className="row">
					<div className="col-xl-3 theiaStickySidebar">
						<div className="filter-sidebar mb-xl-0">
							<div className="filter-head d-flex align-items-center justify-content-between">
								<h5 className="mb-0">Filter</h5>
								<Link to="/agent-list-sidebar" className="text-danger">Reset</Link>
							</div>
							<div className="filter-body">
								<div className="filter-set">
									<div className="d-flex align-items-center">
										<div className="d-flex justify-content-between w-100 filter-search-head" data-bs-toggle="collapse" data-bs-target="#search" aria-expanded="false" role="button">
											<h6 className="d-inline-flex align-items-center mb-0">Search</h6>
											<i className="material-icons-outlined expand-arrow">expand_less</i>
										</div>
									</div>
									<div id="search" className="collapse show mt-3">
										<div className="input-group input-group-flat mb-3">
											<span className="input-group-text border-0">
												<i className="material-icons-outlined">search</i>
											</span>
											<input type="text" className="form-control" placeholder="Search here..." />
										</div>
										<div className="mb-3">
											<label className="form-label">Agent Type</label>
											<select className="select">
												<option>Selling Agent</option>
												<option>Buying Agent</option>
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
								<div className="filter-set">
									<div className="d-flex align-items-center">
										<div className="d-flex justify-content-between w-100 filter-search-head" data-bs-toggle="collapse" data-bs-target="#category" aria-expanded="false" role="button">
											<h6 className="mb-0">Categories</h6>
											<i className="material-icons-outlined expand-arrow">expand_less</i>
										</div>
									</div>
									<div id="category" className="collapse show mt-3">
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
									<Link to="/agent-details"><img src="/assets/img/agents/agent-01.jpg" alt="" /></Link>
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
											<h5 className="mb-1"><Link to="/agent-details">Lisa Sheppard</Link></h5>
											<p className="mb-0">Buying Agent</p>
										</div>
										<span className="badge bg-secondary">93 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">Dedicated property buying agent with deep market knowledge, negotiation skills, and personalized serviceÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âcommitted to helping clients find the perfect home or
										investment while ensuring a smooth, stress-free buying experience.
										</p>
									</div>
									<div className="social-icons">
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agent-details"><img src="/assets/img/agents/agent-02.jpg" alt="" /></Link>
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
											<h5 className="mb-1"><Link to="/agent-details">Julie Connor</Link></h5>
											<p className="mb-0">Selling Agent</p>
										</div>
										<span className="badge bg-secondary">45 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">Experienced real estate selling agent providing expert pricing, marketing, and negotiation strategies 
										to help homeowners sell faster and at the best possible value in todayÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s competitive market.
										</p>
									</div>
									<div className="social-icons">
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agent-details"><img src="/assets/img/agents/agent-03.jpg" alt="" /></Link>
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
											<h5 className="mb-1"><Link to="/agent-details">Amanda Stiner</Link></h5>
											<p className="mb-0">Selling Agent</p>
										</div>
										<span className="badge bg-secondary">27 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">Dedicated selling agent who listens, advises, and acts quickly. Specializing in smooth, 
										profitable sales with full support from listing to closingÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âalways prioritizing client goals and satisfaction.
										</p>
									</div>
									<div className="social-icons">
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agent-details"><img src="/assets/img/agents/agent-04.jpg" alt="" /></Link>
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
											<h5 className="mb-1"><Link to="/agent-details">Larry Gardner</Link></h5>
											<p className="mb-0">Buying Agent</p>
										</div>
										<span className="badge bg-secondary">54 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">
										Trusted real estate buying agent specializing in residential and investment properties. Delivers tailored advice, strong negotiation, and end-to-end support
										to make your property purchase seamless, successful, and rewarding.
										</p>
									</div>
									<div className="social-icons">
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agent-details"><img src="/assets/img/agents/agent-05.jpg" alt="" /></Link>
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
											<h5 className="mb-1"><Link to="/agent-details">Robert Henry</Link></h5>
											<p className="mb-0">Selling Agent</p>
										</div>
										<span className="badge bg-secondary">36 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">
										Helping sellers stand out with modern marketing, high-quality listings, and targeted exposure. 
										From staging to final signatures, I manage every detail to ensure maximum value and minimal hassle.
										</p>
									</div>
									<div className="social-icons">
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agent-details"><img src="/assets/img/agents/agent-06.jpg" alt="" /></Link>
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
											<h5 className="mb-1"><Link to="/agent-details">Esther Reyes</Link></h5>
											<p className="mb-0">Selling Agent</p>
										</div>
										<span className="badge bg-secondary">29 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">
										Seasoned agent with a strong sales track record. Offers market insights, staging tips, and 
										strategic pricing to attract serious buyers and close deals quickly and efficiently.
										</p>
									</div>
									<div className="social-icons">
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="agent-list-item">
								<div className="agent-img">
									<Link to="/agent-details"><img src="/assets/img/agents/agent-07.jpg" alt="" /></Link>
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
											<h5 className="mb-1"><Link to="/agent-details">Albert Scott</Link></h5>
											<p className="mb-0">Buying Agent</p>
										</div>
										<span className="badge bg-secondary">76 Listings</span>
									</div>
									<div className="border-bottom mb-3 pb-3">
										<p className="mb-0">
										Professional buying agent with a client-first approach, offering expert market analysis, property scouting, and negotiation 
										to secure the best deals and simplify your real estate journey from start to finish.
										</p>
									</div>
									<div className="social-icons">
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-x-twitter"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-facebook"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-instagram"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-linkedin"></i></Link>
										<Link to="/agent-list-sidebar"><i className="fa-brands fa-pinterest"></i></Link>
									</div>
								</div>
							</div>

							<div className="text-center pt-3">
								<Link to="/agent-list-sidebar" className="btn btn-dark align-items-center d-inline-flex"><i className="material-icons-outlined me-1">autorenew</i>Load More</Link>
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
							<div className="d-flex align-items-center justify-content-between">
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

export default AgentListSidebar;



