import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const BuyListMap = () => {
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
                        <h1 className="breadcrumb-title">Buy List Map</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Buy List Map</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">
                <div className="container-fluid">

                    
                     <div className="row">
                        <div className="col-xl-8 col-lg-12">
                            <div className="card border-0 search-item mb-4">
							<div className="card-body">

								
								<div className="row align-items-center">
									<div className="col-lg-2">
										<p className="mb-4 mb-lg-0 mb-md-3 text-lg-start text-md-start  text-center"> Result</p>
									</div> 

									<div className="col-lg-10">
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
												<li><Link to="/buy-property-list"  className="list-icon "><i className="material-icons">list</i></Link></li>
												<li><Link to="/buy-property-grid" className="list-icon "><i className="material-icons">grid_view</i></Link></li>
												<li><Link to="/buy-list-map" className="list-icon active"><i className="material-icons-outlined">location_on</i></Link></li>
											</ul>
										</div>
									</div> 
								</div>
								

							</div>
						</div> 

                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="mb-3 ">Filter</h5>
                                    <form>

                                        
                                        <div className="row">
                                            <div className="col-lg-3 col-md-3 col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label mb-1">Categories</label>
                                                    <div className="input-group">
                                                        <select className="select">
                                                            <option value="0">Select</option>
                                                            <option value="1">Categories</option>
                                                            <option value="2">Apartments</option>
                                                            <option value="3">Condos </option>
                                                            <option value="4">Houses </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div> 

                                            <div className="col-lg-3 col-md-3 col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label mb-1">Bedrooms</label>
                                                    <div className="input-group">
                                                        <select className="select">
                                                            <option value="0">Select</option>
                                                            <option value="1" >4 Bedrooms</option>
                                                            <option value="2" >2 Bedrooms</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div> 

                                            <div className="col-lg-3 col-md-3 col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label mb-1">Bathrooms</label>
                                                    <div className="input-group">
                                                        <select className="select">
                                                            <option value="0">Select</option>
                                                            <option value="1" >1 Bathrooms</option>
                                                            <option value="1" >2 Bathrooms</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div> 

                                            <div className="col-lg-3 col-md-3 col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label mb-1">Min Sqft</label>
                                                    <div className="input-group">
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                            </div> 

                                            <div className="col-lg-3 col-md-3 col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label mb-1">Min Price</label>
                                                    <div className="input-group">
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                            </div> 

                                            <div className="col-lg-3 col-md-3 col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label mb-1">Max Price</label>
                                                    <div className="input-group">
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                            </div> 

                                            <div className="col-lg-3 col-md-3 col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label mb-1">Reviews</label>
                                                    <div className="input-group">
                                                        <select className="select">
                                                            <option value="0">5.0</option>
                                                            <option value="1" >4.0</option>
                                                            <option value="1" >3.0</option>
                                                            <option value="1" >2.0</option>
                                                            <option value="1" >1.0</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div> 

                                            <div className="col-lg-3 col-md-3 col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label mb-1">Amenities</label>
                                                    <div className="input-group">
                                                        <input type="text" className="form-control" />
                                                    </div>
                                                </div>
                                            </div> 
                                        </div>
                                        

                                        <div className="d-flex align-items-center justify-content-end gap-2">
											<a href="#" className="btn btn-dark fw-normal">Reset</a>
                                            <a href="#" className="btn btn-primary fw-normal">Apply Filter</a>
                                        </div>
                                    </form>
                                </div> 
                            </div> 

                            
                            <div className="row mb-4 ">

                                
                                <div className="col-xl-12 col-lg-12 col-md-6">
                                    <div className="property-card">
                                        <div className="property-listing-item p-0 mb-0 shadow-none d-flex align-items-center flex-lg-nowrap flex-wrap">
                                            <div className="buy-grid-img buy-list-img  mb-0">
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
                                                    <div className="user-avatar avatar avatar-md border rounded-circle">
                                                        <img src="/assets/img/users/user-01.jpg" alt="User" className="rounded-circle" />
                                                    </div>
                                                </div>
                                            </div> 
                                            <div className="buy-grid-content w-100">
                                                <div className="d-flex align-items-center justify-content-between gap-1 flex-wrap mb-3">
                                                    <div>
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
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="title mb-1">
                                                                    <Link to="/buy-details">Serenity Condo Suite</Link> 
                                                                </h6>
                                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>17, Grove Towers, New York, USA</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h6 className="text-dark fs-16 mb-0"> $1680 </h6>
                                                </div>
                                                <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-2">
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                    <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 16 Jan 2023</span> </p>
                                                    <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Apartment</span> </p>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-xl-12 col-lg-12 col-md-6">
                                    <div className="property-card">
                                        <div className="property-listing-item p-0 mb-0 shadow-none d-flex align-items-center flex-lg-nowrap flex-wrap">
                                            <div className="buy-grid-img buy-list-img  mb-0">
                                                <Link to="/buy-details">
                                                    <img className="img-fluid" src="/assets/img/buy/buy-grid-img-02.jpg" alt="" />
                                                </Link>
                                                <div className="d-flex align-items-center justify-content-end position-absolute top-0 start-0 end-0 p-3 z-1">
                                                    <a href="javascript:void(0)" className="favourite">
                                                        <i className="material-icons-outlined">favorite_border</i>
                                                    </a>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                                    <div className="user-avatar avatar avatar-md border rounded-circle">
                                                        <img src="/assets/img/users/user-02.jpg" alt="User" className="rounded-circle" />
                                                    </div>
                                                </div>
                                            </div> 
                                            <div className="buy-grid-content w-100">
                                                <div className="d-flex align-items-center justify-content-between gap-1 flex-wrap mb-3">
                                                    <div>
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <span className="ms-1 fs-14">4.2 (33 Reviews)</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="title mb-1">
                                                                    <Link to="/buy-details">Loyal Apartment</Link> 
                                                                </h6>
                                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>25, Willow Crest Apartment, USA</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h6 className="text-dark fs-16 mb-0"> $1940 </h6>
                                                </div>
                                                <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-2">
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                    <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 02 May 2023</span> </p>
                                                    <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Apartment</span> </p>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-xl-12 col-lg-12 col-md-6">
                                    <div className="property-card">
                                        <div className="property-listing-item p-0 mb-0 shadow-none d-flex align-items-center flex-lg-nowrap flex-wrap">
                                            <div className="buy-grid-img buy-list-img  mb-0">
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
                                                    <div className="user-avatar avatar avatar-md border rounded-circle">
                                                        <img src="/assets/img/users/user-03.jpg" alt="User" className="rounded-circle" />
                                                    </div>
                                                </div>
                                            </div> 
                                            <div className="buy-grid-content w-100">
                                                <div className="d-flex align-items-center justify-content-between gap-1 flex-wrap mb-3">
                                                    <div>
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <span className="ms-1 fs-14">4.7 (43 Reviews)</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="title mb-1">
                                                                    <Link to="/buy-details">Grand Villa House</Link> 
                                                                </h6>
                                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>10, Oak Ridge Villa, USA</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h6 className="text-dark fs-16 mb-0"> $1370 </h6>
                                                </div>
                                                <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-2">
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                    <p className="fs-14 fw-medium text-dark mb-0">Listed on : <span className="fw-medium text-body"> 28 Apr 2025</span> </p>
                                                    <p className="fs-14 fw-medium text-dark mb-0">Category : <span className="fw-medium text-body"> Villa</span> </p>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-xl-12 col-lg-12 col-md-6">
                                    <div className="property-card mb-lg-0">
                                        <div className="property-listing-item p-0 mb-0 shadow-none d-flex align-items-center flex-lg-nowrap flex-wrap">
                                            <div className="buy-grid-img buy-list-img  mb-0">
                                                <Link to="/buy-details">
                                                    <img className="img-fluid" src="/assets/img/buy/buy-grid-img-04.jpg" alt="" />
                                                </Link>
                                                <div className="d-flex align-items-center justify-content-end position-absolute top-0 start-0 end-0 p-3 z-1">
                                                    <a href="javascript:void(0)" className="favourite">
                                                        <i className="material-icons-outlined">favorite_border</i>
                                                    </a>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                                    <div className="user-avatar avatar avatar-md border rounded-circle">
                                                        <img src="/assets/img/users/user-04.jpg" alt="User" className="rounded-circle" />
                                                    </div>
                                                </div>
                                            </div> 
                                            <div className="buy-grid-content w-100">
                                                <div className="d-flex align-items-center justify-content-between gap-1 flex-wrap mb-3">
                                                    <div>
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <i className="material-icons-outlined text-warning">star</i>
                                                                <span className="ms-1 fs-14">4.8 (56 Reviews)</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="title mb-1">
                                                                    <Link to="/buy-details">Palm Cove Bungalows</Link> 
                                                                </h6>
                                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>42, Pine Residency, Miami, USA</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h6 className="text-dark fs-16 mb-0"> $1560 </h6>
                                                </div>
                                                <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-2">
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
                            

                            <div className="text-center">
                                <a href="javascript:void(0)" className="btn btn-dark d-inline-flex align-items-center"><i className="material-icons-outlined me-1">autorenew</i>Load More </a>
                            </div>
                        </div> 

                        <div className="col-xl-4 col-lg-12">
                            <div className="col-xl-5 col-sm-12 buy-grid-map-item-04">
                                <div id="map" className="map-listing"></div>
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

export default BuyListMap;



