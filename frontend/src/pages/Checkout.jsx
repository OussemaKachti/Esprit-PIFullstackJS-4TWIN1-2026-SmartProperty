import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
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
                        <h1 className="breadcrumb-title">Checkout</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Checkout</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row">
                        <div className="col-lg-12 mx-auto">

                            <div className="checkout-wrap">
                                
                                <div className="row row-gap-3">
                                    <div className="col-xl-9">
                                        <div className="checkout-item-01">
                                            <h6>Personal info</h6>

											
											<div className="row">
												<div className="col-lg-6">
													<div className="mb-3">
														<label className="form-label">First Name<span className="text-danger ms-1">*</span></label>
														<input type="text" className="form-control" />
													</div>
												</div>
												<div className="col-lg-6">
													<div className="mb-3">
														<label className="form-label">Last Name<span className="text-danger ms-1">*</span></label>
														<input type="text" className="form-control" />
													</div>
												</div>
												<div className="col-lg-6">
													<div className="mb-3">
														<label className="form-label">Email Address<span className="text-danger ms-1">*</span></label>
														<input type="text" className="form-control" />
													</div>
												</div>
												<div className="col-lg-6">
													<div className="mb-3">
														<label className="form-label">Phone Number<span className="text-danger ms-1">*</span></label>
														<input type="text" className="form-control" id="phone" />
													</div>
												</div>
												<div className="col-lg-12">
													<div className="mb-3">
														<label className="form-label">Address</label>
														<input type="text" className="form-control" />
													</div>
												</div>
												<div className="col-lg-12">
													<div className="mb-3">
														<label className="form-label">Address 2 (Optional)</label>
														<input type="text" className="form-control" />
													</div>
												</div>
												<div className="col-lg-6">
													<div className="mb-3">
														<label className="form-label">Country</label>
														<select className="select">
															<option>Select</option>
															<option>United States</option>
															<option>Canada</option>
															<option>United Kingdom</option>
														</select>
													</div>
												</div>
												<div className="col-lg-6">
													<div className="mb-3">
														<label className="form-label">State</label>
														<select className="select">
															<option>Select</option>
															<option>California</option>
															<option>New York</option>
															<option>Texas</option>
														</select>
													</div>
												</div>
												<div className="col-lg-6">
													<div className="mb-3">
														<label className="form-label">City</label>
														<select className="select">
															<option>Select</option>
															<option>Los Angeles</option>
															<option>Houston</option>
															<option>Munich</option>
														</select>
													</div>
												</div>
												<div className="col-lg-6">
													<div className="mb-3">
														<label className="form-label">Zipcode</label>
														<input type="text" className="form-control" />
													</div>
												</div>
											</div>
											

											<hr />
											<h6 className="tab-head">Contact Info</h6>
											<ul className="nav nav-tabs mb-3">
												<li className="nav-item">
													<input type="radio" id="credit" name="pay-tab" checked />
													<label className="nav-link" htmlFor="credit" data-bs-target="#tab1">Credit / Debit Card</label>
												</li>
												<li className="nav-item">
													<input type="radio" id="paypal" name="pay-tab" />
													<label className="nav-link" htmlFor="paypal" data-bs-target="#tab2">PayPal</label>
												</li>
												<li className="nav-item">
													<input type="radio" id="stripe" name="pay-tab" />
													<label className="nav-link" htmlFor="stripe" data-bs-target="#tab3">Stripe</label>
												</li>
											</ul>

											<div className="tab-content mb-3">
												<div className="tab-pane fade show active" id="tab1">
													<div className="checkout-item-03">
														<h6>Payment With Credit Card</h6>
														
														<div className="row">
															<div className="col-md-6 col-lg-4">
																<div className="card">
																	<div className="card-body">
																		<div className="d-flex align-items-center justify-content-between mb-2">
																			<div>
																				<img src="/assets/img/icons/visa.svg" alt="" className="img-fluid mb-2" />
																				<p className="mb-0">**** **** **** 2547</p>
																			</div>
																			<div className="d-flex align-items-center">
																				<a href="#" className="btn btn-light rounded-circle me-2" data-bs-toggle="modal" data-bs-target="#edit_card"><i className="material-icons-outlined">edit</i></a>
																				<a href="#" className="btn btn-light rounded-circle" data-bs-toggle="modal" data-bs-target="#delete_card"><i className="material-icons-outlined">delete</i></a>
																			</div>
																		</div>
																		<div className="expiry-time">
																			<p>Expiry</p>
																			<span>May 2028</span>
																		</div>
																	</div>
																</div>
															</div>
															<div className="col-md-6 col-lg-4">
																<div className="card">
																	<div className="card-body">
																		<div className="d-flex align-items-center justify-content-between mb-2">
																			<div>
																				<img src="/assets/img/icons/rupay.svg" alt="" className="img-fluid mb-2" />
																				<p className="mb-0">**** **** **** 2547</p>
																			</div>
																			<div className="d-flex align-items-center">
																				<a href="#" className="btn btn-light rounded-circle me-2" data-bs-toggle="modal" data-bs-target="#edit_card"><i className="material-icons-outlined">edit</i></a>
																				<a href="#" className="btn btn-light rounded-circle" data-bs-toggle="modal" data-bs-target="#delete_card"><i className="material-icons-outlined">delete</i></a>
																			</div>
																		</div>
																		<div className="expiry-time">
																			<p>Expiry</p>
																			<span>May 2028</span>
																		</div>
																	</div>
																</div>
															</div>
															<div className="col-md-6 col-lg-4 d-flex">
																<div className="card bg-light flex-fill">
																	<div className="card-body">
																		<div className="d-flex align-items-center justify-content-center h-100">
																			<a href="#" className="btn btn-white d-inline-flex align-items-center justify-content-center p-2 rounded-circle" data-bs-toggle="modal" data-bs-target="#add_card"><i className="material-icons-outlined">add</i></a>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														
													</div>

													
													<div className="row row-gap-2">
														<div className="col-lg-6">
															<div className="checkout-item-04">
																<div className="mb-0">
																	<label className="form-label">Card Holder Name</label>
																	<div className=" form-cover">
																		<input type="text" className="form-control" />
																		<i className="material-icons-outlined">person</i>
																	</div>
																</div>
															</div>
														</div>
														<div className="col-lg-6">
															<div className="checkout-item-04">
																<div className="mb-0">
																	<label className="form-label">Card Number</label>
																	<div className=" form-cover">
																		<input type="text" className="form-control" />
																		<i className="material-icons-outlined">account_balance_wallet</i>
																	</div>
																</div>
															</div>
														</div>
														<div className="col-lg-6">
															<div className="checkout-item-04">
																<div className="mb-0">
																	<label className="form-label">Expiry Date</label>
																	<div className="input-group input-group-flat mb-3">
																		<input type="text" className="datetimepicker form-control" placeholder="dd/mm/yyyy" />
																		<span className="input-group-text border-0">
																			<i className="material-icons-outlined text-dark">calendar_today</i>
																		</span>
																	</div>
																</div>
															</div>
														</div>
														<div className="col-lg-6">
															<div className="checkout-item-04">
																<div className="mb-0">
																	<label className="form-label">CVV</label>
																	<div className=" form-cover">
																		<input type="text" className="form-control" />
																		<i className="material-icons-outlined">fact_check</i>
																	</div>
																</div>
															</div>
														</div>
													</div>
													
												</div>
												<div className="tab-pane fade" id="tab2">
													<div className="checkout-item-03">
														<h6>Payment With PayPal</h6>
														
														<div className="row row-gap-2">
															<div className="col-lg-6">
																<div className="checkout-item-04">
																	<div className="mb-0">
																		<label className="form-label">Email</label>
																		<div className="form-cover">
																			<input type="text" className="form-control" placeholder="Enter your email" />
																			<i className="material-icons-outlined">mail</i>
																		</div>
																	</div>
																</div>
															</div>
															<div className="col-lg-6">
																<div className="checkout-item-04">
																	<div className="mb-0">
																		<label className="form-label">Password</label>
																		<div className="position-relative form-cover password">
																			<input type="password" className="pass-inputs form-control" />
																			<i className="material-icons-outlined">lock</i>
																			<span className="fas toggle-passwords fa-eye-slash"></span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														
													</div>
												</div>
												<div className="tab-pane fade" id="tab3">
													<div className="checkout-item-03">
														<h6>Payment With Stripe</h6>
														
														<div className="row row-gap-2">
															<div className="col-lg-6">
																<div className="checkout-item-04">
																	<div className="mb-0">
																		<label className="form-label">Email</label>
																		<div className="form-cover">
																			<input type="text" className="form-control" placeholder="Enter your email" />
																			<i className="material-icons-outlined">mail</i>
																		</div>
																	</div>
																</div>
															</div>
															<div className="col-lg-6">
																<div className="checkout-item-04">
																	<div className="mb-0">
																		<label className="form-label">Password</label>
																		<div className="position-relative form-cover password">
																			<input type="password" className="pass-inputs form-control" />
																			<i className="material-icons-outlined">lock</i>
																			<span className="fas toggle-passwords fa-eye-slash"></span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														
													</div>
												</div>
											</div>

											<div className="d-flex align-items-center justify-content-end flex-wrap gap-3 pay-submit">
												<Link to="/cart" className="btn btn-dark">Back to Cart</Link>
												<a href="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#payment-success">Confirm & Pay $8395</a>
											</div>
											
                                        </div>
                                    </div>
                                    <div className="col-xl-3 theiaStickySidebar">
                                        <div className="checkout-item-02">
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
                                            <div className="mb-0">
                                                <label className="form-label">Promo Code</label>
                                                <div className="d-flex align-items-center">
                                                    <input type="text" className="form-control me-1" placeholder="Type here..." />
                                                    <a href="#" className="btn btn-lg btn-dark">Apply</a>
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
            

			
			<div id="add_card" className="modal fade">
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
						<form action="checkout.html">
							<div className="modal-header">
								<h4 className="text-dark modal-title fw-bold">Add New Card</h4>
								<button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="material-icons-outlined">close</i></button>
							</div>
							<div className="modal-body">
								<div className="mb-3">
									<label className="form-label">Card Number<span className="text-danger ms-1">*</span></label>
									<input type="text" className="form-control" />
								</div>
								<div className="mb-3">
									<label className="form-label">Expiration Date<span className="text-danger ms-1">*</span></label>
									<div className="input-group input-group-flat mb-3">
										<input type="text" className="datetimepicker form-control" placeholder="dd/mm/yyyy" />
										<span className="input-group-text border-0">
											<i className="material-icons-outlined text-dark">calendar_today</i>
										</span>
									</div>
								</div>
								<div className="mb-0">
									<label className="form-label">CVV<span className="text-danger ms-1">*</span></label>
									<input type="text" className="form-control" />
								</div>
							</div>
							<div className="modal-body border-top">
								<div className="d-flex align-items-center justify-content-end">
									<button type="button" className="btn btn-lg btn-light me-2" data-bs-dismiss="modal">Close</button>
									<button type="submit" className="btn btn-lg btn-primary">Add New Card</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
			

			
			<div id="edit_card" className="modal fade">
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
						<form action="checkout.html">
							<div className="modal-header">
								<h4 className="text-dark modal-title fw-bold">Edit Card</h4>
								<button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="material-icons-outlined">close</i></button>
							</div>
							<div className="modal-body">
								<div className="mb-3">
									<label className="form-label">Card Number<span className="text-danger ms-1">*</span></label>
									<input type="text" className="form-control" value="1234 5678 9876 5432" />
								</div>
								<div className="mb-3">
									<label className="form-label">Expiration Date<span className="text-danger ms-1">*</span></label>
									<div className="input-group input-group-flat mb-3">
										<input type="text" className="datetimepicker form-control" placeholder="dd/mm/yyyy" />
										<span className="input-group-text border-0">
											<i className="material-icons-outlined text-dark">calendar_today</i>
										</span>
									</div>
								</div>
								<div className="mb-0">
									<label className="form-label">CVV<span className="text-danger ms-1">*</span></label>
									<input type="text" className="form-control" value="645" />
								</div>
							</div>
							<div className="modal-body border-top">
								<div className="d-flex align-items-center justify-content-end">
									<button type="button" className="btn btn-lg btn-light me-2" data-bs-dismiss="modal">Close</button>
									<button type="submit" className="btn btn-lg btn-primary">Save Changes</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
			

			
			<div className="modal fade" id="delete_card">
				<div className="modal-dialog modal-dialog-centered modal-sm">
					<div className="modal-content">
						<div className="modal-body text-center">
							<div className="mb-3">
								<span className="avatar avatar-lg bg-danger rounded-circle text-white"><i className="material-icons-outlined fs-24">delete</i></span>
							</div>
							<h6 className="mb-1">Delete Confirmation</h6>
							<p className="mb-3">Are you sure want to delete?</p>
							<div className="d-flex justify-content-center">
								<a href="#" className="btn btn-light position-relative z-1 me-3" data-bs-dismiss="modal">Cancel</a>
								<Link to="/checkout" className="btn btn-danger position-relative z-1">Yes, Delete</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
			

			
			<div className="modal fade" id="payment-success">
				<div className="modal-dialog modal-dialog-centered modal-md">
					<div className="modal-content payment">
						<div className="modal-body text-center">
							<div className="mb-3">
								<span className="avatar avatar-lg bg-success rounded-circle text-white"><i className="material-icons-outlined fs-24">done_all</i></span>
							</div>
							<h6 className="mb-2">Payment Successful</h6>
							<p className="mb-2">You Payment has been successfully done.</p>
							<p className="mb-4">Trasaction Id : #5064164454</p>
							<div className="d-flex justify-content-center">
								<Link to="/" className="btn btn-lg btn-dark">Back to Home</Link>
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

export default Checkout;



