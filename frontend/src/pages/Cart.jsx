import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
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
                        <h1 className="breadcrumb-title">Cart</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Cart</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row" id="cart-wrap">
                        <div className="col-lg-12 mx-auto">

                            <div className="cart-item-wrap">
                                
                                <div className="row row-gap-3">
                                    <div className="col-xl-9">
                                        <div className="cart-item-01">
                                            <div className="cart-title">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <h5>3 Properties</h5>
                                                    <a href="#" className="btn btn-danger"><i className="material-icons-outlined">delete</i>Clear Cart</a>
                                                </div>
                                                <hr />
                                            </div>
											<div className="cart-item-02">

												
												<div className="row align-items-center row-gap-3">
													<div className="col-lg-7">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-5">
                                                            	<img src="/assets/img/property-type/property-type-01.jpg" alt="" className="img-fluid" />
															</div>
															<div className="col-lg-7">
																<div className="d-flex align-items-center mb-1">
																	<h6 className="mb-0 me-2">Getaway Apartment</h6>
																	<span className="badge badge-sm bg-secondary">Rental</span>
																</div>
																<p className="address mb-0"><i className="material-icons-outlined">location_on</i>54, Coral Sands, Gold Coast, AU</p>
															</div>
                                                        </div>
													</div>
													<div className="col-lg-5">
														<div className="cart-content-01 flex-wrap gap-3">
                                                            <div className="d-flex align-items-center btn-cover">
                                                                <a href="#" className="btn minus-btn">-</a>
                                                                <input type="text" className="quantity-input" value="1" />
                                                                <a href="#" className="btn add-btn">+</a>
                                                            </div>
                                                            <div>
                                                                <h5 className="mb-0">$1630</h5>
                                                            </div>
                                                            <a href="#" className="btn remove-btn"><i className="material-icons-outlined">delete</i>Remove</a>
                                                        </div>
													</div>
												</div>
												

											</div>
											<div className="cart-item-02">

												
												<div className="row align-items-center row-gap-3">
													<div className="col-lg-7">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-5">
                                                            	<img src="/assets/img/property-type/property-type-02.jpg" alt="" className="img-fluid" />
															</div>
															<div className="col-lg-7">
																<div className="d-flex align-items-center mb-1">
																	<h6 className="mb-0 me-2">Stylish Skyline Room</h6>
																	<span className="badge badge-sm bg-secondary">Rental</span>
																</div>
																<p className="address mb-0"><i className="material-icons-outlined">location_on</i>18, Ocean View Heights, Malibu, US</p>
															</div>
                                                        </div>
													</div>
													<div className="col-lg-5">
														<div className="cart-content-01 flex-wrap gap-3">
                                                            <div className="d-flex align-items-center btn-cover">
                                                                <a href="#" className="btn minus-btn">-</a>
                                                                <input type="text" className="quantity-input" value="1" />
                                                                <a href="#" className="btn add-btn">+</a>
                                                            </div>
                                                            <div>
                                                                <h5 className="mb-0">$1170</h5>
                                                            </div>
                                                            <a href="#" className="btn remove-btn"><i className="material-icons-outlined">delete</i>Remove</a>
                                                        </div>
													</div>
												</div>
												

											</div>
											<div className="cart-item-02">

												
												<div className="row align-items-center row-gap-3">
													<div className="col-lg-7">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-5">
                                                            	<img src="/assets/img/property-type/property-type-03.jpg" alt="" className="img-fluid" />
															</div>
															<div className="col-lg-7">
																<div className="d-flex align-items-center mb-1">
																	<h6 className="mb-0 me-2">Majestic Stay</h6>
																	<span className="badge badge-sm bg-secondary">Rental</span>
																</div>
																<p className="address mb-0"><i className="material-icons-outlined">location_on</i>54, Coral Sands, Gold Coast, AU</p>
															</div>
                                                        </div>
													</div>
													<div className="col-lg-5">
														<div className="cart-content-01 flex-wrap gap-3">
                                                            <div className="d-flex align-items-center btn-cover">
                                                                <a href="#" className="btn minus-btn">-</a>
                                                                <input type="text" className="quantity-input" value="1" />
                                                                <a href="#" className="btn add-btn">+</a>
                                                            </div>
                                                            <div>
                                                                <h5 className="mb-0">$4500</h5>
                                                            </div>
                                                            <a href="#" className="btn remove-btn"><i className="material-icons-outlined">delete</i>Remove</a>
                                                        </div>
													</div>
												</div>
												

											</div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 theiaStickySidebar">
                                        <div className="cart-item-03">
                                            <div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="mb-0">Subtotal</p>
                                                    <span>$7300</span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="mb-0">Service Charge</p>
                                                    <span>$365</span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <p className="mb-0">Tax</p>
                                                    <span>$730</span>
                                                </div>
                                            </div>
                                            <hr />
                                            <div className="d-flex align-items-center justify-content-between">
                                                <h6 className="mb-0">Payable Amount</h6>
                                                <h6 className="mb-0">$8395</h6>
                                            </div>
                                            <hr />
                                            <div className="mb-3">
                                                <label className="form-label">Promo Code</label>
                                                <div className="d-flex align-items-center">
                                                    <input type="text" className="form-control me-1" placeholder="Type here..." />
                                                    <a href="#" className="btn btn-lg btn-dark">Apply</a>
                                                </div>
                                            </div>
                                            <Link to="/checkout" className="btn btn-success">Continue to Checkout</Link>
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
  );
};

export default Cart;



