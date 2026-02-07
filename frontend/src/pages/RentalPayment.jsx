import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const RentalPayment = () => {
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
                        <h1 className="breadcrumb-title">Rental Payment</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Rental Payment</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row">
                        <div className="col-lg-10 mx-auto">
							<div className="card border-0 bg-light shadow-none">
								<div className="card-body">
									
									 <div className="row row-gap-3">
										<div className="col-lg-5">
											<p className="fw-semibold text-dark mb-1">Details</p>
											<p className="fs-14 mb-0">Modern Apartment in the city centre</p>
										</div>
										<div className="col-lg-5">
											<p className="fw-semibold text-dark mb-1">Location</p>
											<p className="fs-14 mb-0">318-330 S Oakley Blvd, Chicago, IL 60612, USA</p>
										</div>
										<div className="col-lg-2">
											<p className="fw-semibold text-dark mb-1">Booking Amount</p>
											<h4 className="text-primary mb-0">$300 <span className="text-dark fs-14 fw-normal">/ Day</span></h4>
										</div>
									 </div>
									 
								</div>
							</div>

							<div className="card mb-5">
								<div className="card-body">
									<h6 className="mb-3">Choose Payment Method</h6>

									<div className="rental-payment-wrap">
										<ul className="nav nav-tabs">
											<li className="nav-item">
												<a className="nav-link mb-4" href="#" data-bs-toggle="tab" data-bs-target="#tab1">
													<img src="/assets/img/payment/paypal.svg" alt="img" className="img-fluid" />
												</a>
											</li>
											<li className="nav-item">
												<a className="nav-link mb-4" href="#" data-bs-toggle="tab" data-bs-target="#tab2">
													<img src="/assets/img/payment/stripe.svg" alt="img" className="img-fluid" />
												</a>
											</li>
											<li className="nav-item">
												<a className="nav-link active mb-4" href="#" data-bs-toggle="tab" data-bs-target="#tab3">
													<img src="/assets/img/payment/credit-card.svg" alt="img" className="img-fluid" />
												</a>
											</li>
											<li className="nav-item">
												<a className="nav-link mb-4" href="#" data-bs-toggle="tab" data-bs-target="#tab4">
													<img src="/assets/img/payment/wallet.svg" alt="img" className="img-fluid" />
												</a>
											</li>
										</ul>

										<div className="tab-content">
											<div className="tab-pane" id="tab1" role="tabpanel" tabindex="0">
												<div>
													<h6>Add New Paypal</h6>
													
													<div className="row row-gap-3">
														<div className="col-lg-6">
															<div className="mb-0">
																<label className="form-label">Email<span className="text-danger ms-1">*</span></label>
																<div className="form-cover">
																	<input type="text" className="form-control" placeholder="Enter your email" />
																	<i className="material-icons-outlined">mail</i>
																</div>
															</div>
														</div>
														<div className="col-lg-6">
															<div className="mb-0">
																<label className="form-label">Password<span className="text-danger ms-1">*</span></label>
																<div className="position-relative form-cover password">
																	<input type="password" className="pass-input form-control" />
																	<i className="material-icons-outlined">lock</i>
																	<span className="fas toggle-password fa-eye-slash"></span>
																</div>
															</div>
														</div>
													</div>
													
												</div>
											</div>
											<div className="tab-pane" id="tab2" role="tabpanel" tabindex="0">
												<div>
													<h6>Add New Stripe</h6>
													
													<div className="row row-gap-3">
														<div className="col-lg-6">
															<div className="mb-0">
																<label className="form-label">Email<span className="text-danger ms-1">*</span></label>
																<div className="form-cover">
																	<input type="text" className="form-control" placeholder="Enter your email" />
																	<i className="material-icons-outlined">mail</i>
																</div>
															</div>
														</div>
														<div className="col-lg-6">
															<div className="mb-0">
																<label className="form-label">Password<span className="text-danger ms-1">*</span></label>
																<div className="position-relative form-cover password">
																	<input type="password" className="pass-input form-control" />
																	<i className="material-icons-outlined">lock</i>
																	<span className="fas toggle-password fa-eye-slash"></span>
																</div>
															</div>
														</div>
													</div>
													
												</div>
											</div>
											<div className="tab-pane active" id="tab3" role="tabpanel" tabindex="0">
												<div>
													<h6>Add New Card</h6>
													
													<div className="row row-gap-3">
														<div className="col-lg-4">
															<div className="mb-0">
																<label className="form-label">Card Number<span className="text-danger ms-1">*</span></label>
																<input type="text" className="form-control" />
															</div>
														</div>
														<div className="col-lg-4">
															<div className="mb-0">
																<label className="form-label">Card Holder Name<span className="text-danger ms-1">*</span></label>
																<input type="text" className="form-control" />
															</div>
														</div>
														<div className="col-lg-4">
															<div className="mb-0">
																<label className="form-label">Date<span className="text-danger ms-1">*</span></label>
																<div className="input-group input-group-flat mb-3">
																	<input type="text" className="datetimepicker form-control" placeholder="dd/mm/yyyy" />
																	<span className="input-group-text border-0">
																		<i className="material-icons-outlined text-dark">calendar_today</i>
																	</span>
																</div>
															</div>
														</div>
														<div className="col-lg-4">
															<div className="mb-0">
																<label className="form-label">Year<span className="text-danger ms-1">*</span></label>
																<select className="select">
																	<option>Select</option>
																	<option>2025</option>
																	<option>2024</option>
																	<option>2023</option>
																	<option>2022</option>
																</select>
															</div>
														</div>
														<div className="col-lg-4">
															<div className="mb-0">
																<label className="form-label">CVV<span className="text-danger ms-1">*</span></label>
																<input type="text" className="form-control" />
															</div>
														</div>
													</div>
													
												</div>
											</div>
											<div className="tab-pane" id="tab4" role="tabpanel" tabindex="0">
												<div>
													<h6>Add New Wallet</h6>
													
													<div className="row row-gap-3">
														<div className="col-lg-6">
															<div className="mb-0">
																<label className="form-label">User Name<span className="text-danger ms-1">*</span></label>
																<div className="form-cover">
																	<input type="text" className="form-control" placeholder="Enter Name" />
																	<i className="material-icons-outlined">person</i>
																</div>
															</div>
														</div>
														<div className="col-lg-6">
															<div className="mb-0">
																<label className="form-label">Password<span className="text-danger ms-1">*</span></label>
																<div className="position-relative form-cover password">
																	<input type="password" className="pass-input form-control" />
																	<i className="material-icons-outlined">lock</i>
																	<span className="fas toggle-password fa-eye-slash"></span>
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

							<div className="d-flex align-items-center justify-content-end">
								<Link to="/rental-order-confirmation" className="btn btn-dark me-2">Go Back</Link>
								<a href="#" data-bs-toggle="modal" data-bs-target="#payment-success" className="btn btn-primary me-2">Book Now</a>
							</div>
                            
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

export default RentalPayment;



