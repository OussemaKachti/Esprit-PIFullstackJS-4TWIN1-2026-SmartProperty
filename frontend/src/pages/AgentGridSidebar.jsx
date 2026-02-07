import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const AgentGridSidebar = () => {
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
					<h1 className="breadcrumb-title">Agent Grid With Sidebar</h1>
					<nav aria-label="breadcrumb" className="page-breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
							<li className="breadcrumb-item active" aria-current="page">Agent Grid With Sidebar</li>
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
								<Link to="/agent-grid-sidebar" className="text-danger">Reset</Link>
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
						
						<div className="row justify-content-center">

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-01.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">10 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.4 (25 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Brenda Palmer</Link></h5>
										<p className="mb-0">Buying Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-02.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">59 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.1 (64 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Julie Connor</Link></h5>
										<p className="mb-0">Selling Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-03.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">53 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.3 (21 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Amanda Stiner</Link></h5>
										<p className="mb-0">Selling Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-04.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">21 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.6 (18 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Larry Gardner</Link></h5>
										<p className="mb-0">Buying Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-05.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">130 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.9 (139 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Robert Henry</Link></h5>
										<p className="mb-0">Selling Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-06.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">78 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.8 (36 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Esther Reyes</Link></h5>
										<p className="mb-0">Buying Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-07.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">70 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.5 (19 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Albert Scott</Link></h5>
										<p className="mb-0">Buying Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-08.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">93 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.2 (28 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Lisa Sheppard</Link></h5>
										<p className="mb-0">Selling Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-xl-4 col-md-6">
								<div className="agent-item">
									<div className="agent-img">
										<Link to="/agent-details"><img src="/assets/img/agents/agent-09.jpg" className="img-fluid" alt="" /></Link>
										<div className="position-absolute top-0 end-0 p-3">
											<span className="badge bg-secondary">10 Listings</span>
										</div>
									</div>
									<div className="agent-content">
										<div className="d-flex align-items-center justify-content-center mb-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons text-warning">star_border</i>
											<i className="material-icons text-warning">star_border</i>
											<span className="ms-1 fs-14">4.8 (25 Reviews)</span>
										</div>
										<h5 className="mb-1"><Link to="/agent-details">Mariana Wolf</Link></h5>
										<p className="mb-0">Buying Agent</p>
									</div>
								</div>
							</div> 

							<div className="col-md-12">
								<div className="text-center pt-3">
									<Link to="/agent-grid-sidebar" className="btn btn-dark align-items-center d-inline-flex"><i className="material-icons-outlined me-1">autorenew</i>Load More</Link>
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

export default AgentGridSidebar;



