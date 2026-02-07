import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const BuyPropertyGridSidebar = () => {
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
                        <h1 className="breadcrumb-title">Buy Grid Sidebar</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Buy Grid Sidebar</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">
                <div className="container">
                    <div className="card border-0 search-item mb-4">
                        <div className="card-body">

                            
                            <div className="row align-items-center">
                                <div className="col-lg-3">
                                    <p className="mb-4 mb-lg-0 mb-md-3 text-lg-start text-md-start  text-center">Showing result <span className="result-value"> 06</span> of<span className="result-value"> 125</span></p>
                                </div> 

                                <div className="col-lg-9">
                                    <div className="d-flex align-items-center gap-3 flex-wrap justify-content-lg-end flex-lg-row flex-md-row flex-column">
                                        <div className="result-list d-flex d-block flex-lg-row flex-md-row flex-column align-items-center gap-2">
                                            <h5>Sort By</h5>
                                            <div className="result-select">
                                                <select className="select">
                                                    <option value="0">Default</option>
                                                    <option value="1" >A-Z</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="result-list d-flex flex-lg-row flex-md-row flex-column align-items-center gap-2">
                                            <h5>Price Range</h5>
                                            <div className="result-select">
                                                <select className="select">
                                                    <option>Low to High</option>
                                                    <option>High to Low</option>
                                                </select>
                                            </div>
                                        </div>
                                        <ul className="grid-list-view d-flex align-items-center justify-content-center">
                                            <li><Link to="/buy-property-list-sidebar"  className="list-icon "><i className="material-icons">list</i></Link></li>
                                            <li><Link to="/buy-property-grid-sidebar" className="list-icon active"><i className="material-icons">grid_view</i></Link></li>
                                            <li><Link to="/buy-grid-map" className="list-icon"><i className="material-icons-outlined">location_on</i></Link></li>
                                        </ul>
                                    </div>
                                </div> 
                            </div>
                            

                        </div>
                    </div> 

                    
                    <div className="row">
                        <div className="col-lg-4 theiaStickySidebar">
							<div className="filter-sidebar buy-grid-sidebar-item-02 mb-lg-0">
								<div className="filter-head d-flex align-items-center justify-content-between">
									<h5 className="mb-0">Filter</h5>
									<Link to="/buy-property-grid-sidebar" className="text-danger">Reset</Link>
								</div>
								<div className="filter-body">

                                    
									<div className="filter-set">
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-between w-100 filter-search-head" data-bs-toggle="collapse" data-bs-target="#search" aria-expanded="false" role="button">
												<h6 className="d-inline-flex align-items-center mb-0"><i className="material-icons-outlined me-2 text-secondary">search</i>Search</h6>
												<i className="material-icons-outlined expand-arrow">expand_less</i>
											</div>
										</div>
										<div id="search" className="card-collapse collapse show mt-3">
											<div className="input-group input-group-flat mb-3">
												<span className="input-group-text border-0">
                                                    <i className="material-icons-outlined">search</i>
                                                </span>
												<input type="text" className="form-control" placeholder="Search here..." />
											</div>
											<div className="mb-2">
												<label className="form-label mb-1">Select Location</label>
												<select className="select">
													<option>Chicago</option>
                                                    <option>Newyork</option>
												</select>
											</div>
											<div className="mb-2"> 
												<label className="form-label mb-1">No of Bedrooms</label>
												<select className="select">
													<option>Select</option>
													<option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
												</select>
											</div>
											<div className="mb-2">
												<label className="form-label mb-1">No of Bathrooms</label>
												<select className="select">
													<option>Select</option>
													<option>1</option>
													<option>2</option>
													<option>3</option>
													<option>4</option>
												</select>
											</div>
                                            <div>
                                                <label className="form-label mb-1"> Min Sqft </label>
                                                <div className="input-group input-group-flat mb-0">
                                                    <input type="text" className="form-control" placeholder="Search here..." />
                                                </div>
                                            </div>
										</div>
									</div>

                                    
									<div className="filter-set">
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-between w-100 filter-search-head" data-bs-toggle="collapse" data-bs-target="#category" aria-expanded="false" role="button">
												<h6 className="mb-0 d-flex align-items-center"><i className="material-icons-outlined me-2 text-secondary">category</i>Categories</h6>
												<i className="material-icons-outlined expand-arrow">expand_less</i>
											</div>
										</div>
										<div id="category" className="card-collapse collapse show mt-3">
											<div>
												<div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_1" />
													<label className="form-check-label ms-2" htmlFor="check_1">
														Apartments (45)
													</label>
                                                </div>
												<div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_2" />
													<label className="form-check-label ms-2" htmlFor="check_2">
														Condos (32)
													</label>
                                                </div>
												<div className="more-menu mt-2">
													<div className="form-check d-flex align-items-center ps-0 mb-2">
														<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_3" />
														<label className="form-check-label ms-2" htmlFor="check_3">
															Houses (24)
														</label>
                                                	</div>
													<div className="form-check d-flex align-items-center ps-0 mb-2">
														<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_4" />
														<label className="form-check-label ms-2" htmlFor="check_4">
															Industrial (75)
														</label>
                                                	</div>
												</div>
                                                <div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_5" />
													<label className="form-check-label ms-2" htmlFor="check_5">
														Land (18)
													</label>
                                                </div>
                                                <div className="form-check d-flex align-items-center ps-0 ">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_6" />
													<label className="form-check-label ms-2" htmlFor="check_6">
														Office (12)
													</label>
                                                </div>
												<div className="view-all d-inline-flex align-items-center">
													<a href="#" className="viewall-button text-secondary">See More</a>
												</div>
											</div>
										</div>
									</div>

                                    
                                    <div className="filter-set">
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-between w-100 filter-search-head" data-bs-toggle="collapse" data-bs-target="#amenities" aria-expanded="false" role="button">
												<h6 className="mb-0 d-flex align-items-center"><i className="material-icons-outlined me-2 text-secondary">cake</i>Amenities</h6>
												<i className="material-icons-outlined expand-arrow">expand_less</i>
											</div>
										</div>
										<div id="amenities" className="card-collapse collapse show mt-3">
											<div>
												<div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_7" />
													<label className="form-check-label ms-2" htmlFor="check_7">
														Backyard (34)
													</label>
                                                </div>
												<div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_8" />
													<label className="form-check-label ms-2" htmlFor="check_8">
														Central Air (28)
													</label>
                                                </div>
                                                <div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_9" />
													<label className="form-check-label ms-2" htmlFor="check_9">
														Chair Accessable (39)
													</label>
                                                </div>
												<div className="more-menu1 mt-2">
													<div className="form-check d-flex align-items-center ps-0 mb-2">
														<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_10" />
														<label className="form-check-label ms-2" htmlFor="check_10">
															Elevator (16)
														</label>
                                                	</div>
													<div className="form-check d-flex align-items-center ps-0">
														<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_11" />
														<label className="form-check-label ms-2" htmlFor="check_11">
															Fireplace (23)
														</label>
                                                	</div>
												</div>
												<div className="view-all d-inline-flex align-items-center">
													<a href="#" className="viewall1-button text-secondary">See More</a>
												</div>
											</div>
										</div>
									</div>

                                    
                                    <div className="filter-set">
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-between w-100 filter-search-head" data-bs-toggle="collapse" data-bs-target="#price" aria-expanded="false" role="button">
												<h6 className="mb-0 d-flex align-items-center"><i className="material-icons-outlined me-2 text-secondary">monetization_on</i>Price</h6>
												<i className="material-icons-outlined expand-arrow">expand_less</i>
											</div>
										</div>
										<div id="price" className="card-collapse collapse show mt-3">
											<div>
												<div className="filter-range">
                                                    <input type="text" id="range_03" />
                                                    <p className="mb-0">Range : <span className="text-dark">$200 - $5695</span></p>
                                                </div>
											</div>
										</div>
									</div>

                                    
									<div className="filter-set">
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-between w-100 filter-search-head" data-bs-toggle="collapse" data-bs-target="#reviews" aria-expanded="false" role="button">
												<h6 className="mb-0 d-flex align-items-center"><i className="material-icons-outlined me-2 text-secondary">auto_awesome</i>Reviews</h6>
												<i className="material-icons-outlined expand-arrow">expand_less</i>
											</div>
										</div>
										<div id="reviews" className="card-collapse collapse show mt-3">
											<div>
												<div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_12" />
													<label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_12">
														<span className="review-star mb-0 d-flex align-items-center">
                                                            <i className="material-icons text-warning">star</i>
                                                            <i className="material-icons text-warning">star</i>
                                                            <i className="material-icons text-warning">star</i>
                                                            <i className="material-icons text-warning">star</i>
                                                            <i className="material-icons text-warning">star</i>
                                                        </span>
                                                        <span className="ms-2 mb-0"> 5 Star </span>
													</label>
                                                </div>
												<div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_13" />
													<label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_13">
														<span className="review-star mb-0 d-flex align-items-center">
                                                            <i className="material-icons text-warning">star</i>
                                                            <i className="material-icons text-warning">star</i>
                                                            <i className="material-icons text-warning">star</i>
                                                            <i className="material-icons text-warning">star</i>
                                                        </span>
                                                        <span className="ms-2 mb-0"> 4 Star </span>
													</label>
                                                </div>
                                                <div className="form-check d-flex align-items-center ps-0 mb-2">
                                                    <input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_14" />
                                                    <label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_14">
                                                        <span className="review-star mb-0 d-flex align-items-center">
                                                        <i className="material-icons text-warning">star</i>
                                                        <i className="material-icons text-warning">star</i>
                                                        <i className="material-icons text-warning">star</i>
                                                    </span>
                                                    <span className="ms-2 mb-0"> 3 Star </span>
                                                    </label>
                                                </div>
                                                <div className="form-check d-flex align-items-center ps-0 mb-2">
                                                    <input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_15" />
                                                    <label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_15">
                                                        <span className="review-star mb-0 d-flex align-items-center">
                                                        <i className="material-icons text-warning">star</i>
                                                        <i className="material-icons text-warning">star</i>
                                                    </span>
                                                    <span className="ms-2 mb-0"> 2 Star </span>
                                                    </label>
                                                </div>
                                                <div className="form-check d-flex align-items-center ps-0 mb-0">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_16" />
													<label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_16">
														<span className="review-star mb-0 d-flex align-items-center">
                                                            <i className="material-icons text-warning">star</i>
                                                        </span>
                                                        <span className="ms-2 mb-0"> 1 Star </span>
													</label>
                                                </div>
											</div>
										</div>
									</div>

                                    
									<div className="filter-set">
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-between w-100 filter-search-head" data-bs-toggle="collapse" data-bs-target="#style" aria-expanded="false" role="button">
												<h6 className="mb-0 d-flex align-items-center"><i className="material-icons-outlined me-2 text-secondary">corporate_fare</i>Style</h6>
												<i className="material-icons-outlined expand-arrow">expand_less</i>
											</div>
										</div>
										<div id="style" className="card-collapse collapse show mt-3">
											<div>
												<div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_17" />
													<label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_17">
														Budget
													</label>
                                                </div>
												<div className="form-check d-flex align-items-center ps-0 mb-2">
													<input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_18" />
													<label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_18">
                                                        Midrange
													</label>
                                                </div>
                                                <div className="form-check d-flex align-items-center ps-0 mb-2">
                                                    <input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_19" />
                                                    <label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_19">
                                                        Luxury
                                                    </label>
                                                </div>
                                                <div className="form-check d-flex align-items-center ps-0 mb-0">
                                                    <input className="form-check-input ms-0 mt-0" name="category" type="checkbox" id="check_20" />
                                                    <label className="form-check-label ms-2 d-flex align-items-center" htmlFor="check_20">
                                                        Family Friendly
                                                    </label>
                                                </div>
											</div>
										</div>
									</div>

								</div>

                                <div className="filter-footer">
                                    <Link to="/buy-property-grid-sidebar" className="btn btn-dark w-100"> Apply Filter </Link>
                                </div>
							</div>
						</div>  

                        <div className="col-lg-8">

                            
                            <div className="row mb-4">

                                
                                <div className="col-lg-6 col-md-6 d-flex">
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                                                    <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 16 Jan 2023</span> </p>
                                                    <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Apartment</span> </p>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="property-card flex-fill">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to="/buy-details">
                                                    <img className="img-fluid" src="/assets/img/buy/buy-grid-img-02.jpg" alt="" />
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

                                
                                <div className="col-lg-6 col-md-6 d-flex">
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

                                
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="property-card flex-fill">
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

                                
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="property-card flex-fill">
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
                                                    <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Villa </span> </p>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="property-card flex-fill">
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

                                
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="property-card mb-lg-0 flex-fill">
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

                                
                                <div className="col-lg-6 col-md-6 d-flex">
                                    <div className="property-card mb-lg-0 flex-fill">
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
                                                    <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Residency </span> </p>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                            </div>
                            

                            <div className="text-center">
                                <a href="javascript:void(0)" className="btn btn-dark d-inline-flex align-items-center"><i className="material-icons-outlined me-1">autorenew</i>Load More </a>
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

export default BuyPropertyGridSidebar;



