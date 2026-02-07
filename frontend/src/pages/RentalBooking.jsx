import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const RentalBooking = () => {
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
                        <h1 className="breadcrumb-title">Rental Booking</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Rental Booking</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row">
                        <div className="col-lg-10 mx-auto">

							<div className="booking-wrap">
								<div className="booking-item-01">
									<p className="d-inline-flex align-items-center mb-0"><i className="material-icons-outlined me-1">check_circle</i>Modern apartment in the city centre is available for rental</p>
								</div>
							</div>

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

							<div className="card">
								<div className="card-body">
									<div className="details-time">
										<div className="row row-gap-3">
											<div className="col-xl-6">
												<div className="arrival-div">
													<h5>Arrival Time</h5>
													<ul>
														<li>
															<input type="radio" id="radio1" name="Arrival" />
															<label htmlFor="radio1">Tue<span>21</span>Feb</label>
														</li>
														<li>
															<input type="radio" id="radio2" name="Arrival" checked />
															<label htmlFor="radio2">Wed<span>22</span>Feb</label>
														</li>
														<li>
															<input type="radio" id="radio3" name="Arrival" />
															<label htmlFor="radio3">Thur<span>23</span>Feb</label>
														</li>
														<li>
															<input type="radio" id="radio4" name="Arrival" />
															<label htmlFor="radio4">Feb<span>24</span>Feb</label>
														</li>
														<li>
															<input type="radio" id="radio5" name="Arrival" />
															<label htmlFor="radio5">Sat<span>25</span>Feb</label>
														</li>
													</ul>
												</div>	
												<div className="mb-0">
													<label className="form-label">Select Time</label>
													<input type="time" className="form-control timepicker" />
												</div>
											</div>
											<div className="col-xl-6">
												<div className="arrival-div arrival-dept">
													<h5>Departure Time</h5>
													<ul>
														<li>
															<input type="radio" id="Departure1" name="Departure" />
															<label htmlFor="Departure1">Tue<span>21</span>Feb</label>
														</li>
														<li>
															<input type="radio" id="Departure2" name="Departure" checked />
															<label htmlFor="Departure2">Wed<span>22</span>Feb</label>
														</li>
														<li>
															<input type="radio" id="Departure3" name="Departure" />
															<label htmlFor="Departure3">Thur<span>23</span>Feb</label>
														</li>
														<li>
															<input type="radio" id="Departure4" name="Departure" />
															<label htmlFor="Departure4">Feb<span>24</span>Feb</label>
														</li>
														<li>
															<input type="radio" id="Departure5" name="Departure" />
															<label htmlFor="Departure5">Sat<span>25</span>Feb</label>
														</li>
													</ul>
												</div>	
												<div className="review-form mb-0">
													<label className="form-label">Select Time</label>
													<input type="time" className="form-control timepicker" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="card border-0 shadow-none bg-light">
								<div className="card-body">
									<div className="row align-items-center justify-content-end">
										<div className="col-lg-4">

											
											<div className="row row-gap-1 mb-2">
												<div className="col-6 text-end">
													<p className="mb-0">Booking Price</p>
												</div>
												<div className="col-6 text-end">
													<p className="fw-semibold mb-0">$300</p>
												</div>
											</div>
											

											
											<div className="row row-gap-1 mb-2">
												<div className="col-6 text-end">
													<p className="mb-0">Service Charge</p>
												</div>
												<div className="col-6 text-end">
													<p className="fw-semibold mb-0">$10</p>
												</div>
											</div>
											

											
											<div className="row row-gap-1">
												<div className="col-6 text-end">
													<p className="mb-0">Tax</p>
												</div>
												<div className="col-6 text-end">
													<p className="fw-semibold mb-0">$5</p>
												</div>
											</div>
											

										</div>
									</div>
								</div>
							</div>

							<div className="card border-0 shadow-none bg-light">
								<div className="card-body">
									<div className="row align-items-center justify-content-end">
										<div className="col-lg-4">

											
											<div className="row mb-2">
												<div className="col-6 text-end">
													<h6 className="mb-0">Booking Price</h6>
												</div>
												<div className="col-6 text-end">
													<h6 className="mb-0">$300</h6>
												</div>
											</div>
											

										</div>
									</div>
								</div>
							</div>

							<div className="d-flex align-items-center justify-content-end">
								<Link to="/rent-details" className="btn btn-dark me-2">Previous</Link>
								<Link to="/rental-order-details" className="btn btn-primary me-2">Go to Order Details</Link>
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

export default RentalBooking;



