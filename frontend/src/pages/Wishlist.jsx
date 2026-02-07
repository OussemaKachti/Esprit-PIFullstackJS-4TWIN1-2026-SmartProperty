import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
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
                        <h1 className="breadcrumb-title">Wishlist</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Wishlist</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">
                <div className="container"> 

                    <ul className="nav nav-pills whishlist-item gap-2" role="tablist">
                        <li className="nav-item" role="presentation">
                            <Link className="nav-link active" data-bs-toggle="tab" to="/wishlist" role="tab" aria-controls="listing-1" aria-selected="true"> 
                                <i className="material-icons-outlined me-2">shopping_basket</i> Properties
                            </Link>
                        </li>
                        <li className="nav-item" role="presentation">
                            <Link className="nav-link" data-bs-toggle="tab" to="/wishlist" role="tab" aria-controls="listing-2" aria-selected="false" tabindex="-1">
                                <i className="material-icons-outlined me-2">king_bed</i>Apartment
                            </Link>
                        </li>
                    </ul>
                    <div className="tab-content">
                        <div className="tab-pane fade active show" id="listing-1" role="tabpanel">
                            <div className="row mb-4">

                                
                                <div className="col-xl-4 col-lg-6 col-md-6 d-flex">
                                    <div className="property-card mb-lg-0 flex-fill">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to="/buy-details">
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
                                                            <Link to="/rent-details">Serenity Condo Suite</Link> 
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar avatar-lg user-avatar">
                                                            <img src="/assets/img/users/user-10.jpg" alt="" className="rounded-circle" />
                                                        </div>
                                                        <h6 className="mb-0 fs-16 fw-medium text-dark">Ethan Brooks<span className="d-block fs-14 text-body pt-1">United States</span> </h6>
                                                    </div>
                                                    <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-xl-4 col-lg-6 col-md-6 d-flex">
                                    <div className="property-card mb-lg-0 flex-fill">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to="/buy-details">
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
                                                            <Link to="/rent-details">Getaway Apartment</Link> 
                                                        </h6>
                                                        <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>54, Coral Sands Apartments, Gold Coast, Australia</p>
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar avatar-lg user-avatar">
                                                            <img src="/assets/img/users/user-11.jpg" alt="" className="rounded-circle" />
                                                        </div>
                                                        <h6 className="mb-0 fs-16 fw-medium text-dark">Olivia Hayes<span className="d-block fs-14 text-body pt-1">Australia</span> </h6>
                                                    </div>
                                                    <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-xl-4 col-lg-6 col-md-6 d-flex">
                                    <div className="property-card mb-lg-0  d-flex">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to="/buy-details">
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
                                                            <Link to="/rent-details">Cozy Urban Condo</Link> 
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar avatar-lg user-avatar">
                                                            <img src="/assets/img/users/user-12.jpg" alt="" className="rounded-circle" />
                                                        </div>
                                                        <h6 className="mb-0 fs-16 fw-medium text-dark">Daniel Carter<span className="d-block fs-14 text-body pt-1">United Kingdom</span> </h6>
                                                    </div>
                                                    <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                            </div>
                            
                        </div>

                        <div className="tab-pane fade" id="listing-2" role="tabpanel">
                            <div className="row mb-4">
                                
                                <div className="col-xl-4 col-lg-6 col-md-6 d-flex">
                                    <div className="property-card mb-lg-o flex-fill">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to="/buy-details">
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
                                                            <Link to="/rent-details">Majestic Stay</Link> 
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar avatar-lg user-avatar">
                                                            <img src="/assets/img/users/user-14.jpg" alt="" className="rounded-circle" />
                                                        </div>
                                                        <h6 className="mb-0 fs-16 fw-medium text-dark">Leo Ramirez<span className="d-block fs-14 text-body pt-1">Italy</span> </h6>
                                                    </div>
                                                    <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-xl-4 col-lg-6 col-md-6  d-flex">
                                    <div className="property-card mb-lg-o flex-fill">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to="/buy-details">
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
                                                            <Link to="/rent-details">Noble Nest</Link> 
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar avatar-lg user-avatar">
                                                            <img src="/assets/img/users/user-15.jpg" alt="" className="rounded-circle" />
                                                        </div>
                                                        <h6 className="mb-0 fs-16 fw-medium text-dark">Maya Rivera<span className="d-block fs-14 text-body pt-1">Japan</span> </h6>
                                                    </div>
                                                    <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                                </div>
                                            </div>
                                        </div> 
                                    </div> 
                                </div> 

                                
                                <div className="col-xl-4 col-lg-6 col-md-6 d-flex">
                                    <div className="property-card mb-lg-0 flex-fill">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to="/buy-details">
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
                                                            <Link to="/rent-details">Holiday Haven Homes</Link> 
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar avatar-lg user-avatar">
                                                            <img src="/assets/img/users/user-16.jpg" alt="" className="rounded-circle" />
                                                        </div>
                                                        <h6 className="mb-0 fs-16 fw-medium text-dark">Marcus Bennett<span className="d-block fs-14 text-body pt-1">Australia</span> </h6>
                                                    </div>
                                                    <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
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
    </div>
  );
};

export default Wishlist;



