import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
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
                        <h1 className="breadcrumb-title">Contact Us</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Contact Us</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			<div className="contact-us-wrap-01">

				<div className="container">

					
					<div className="row align-items-center row-gap-3">
						<div className="col-lg-6">
							<div className="card border-0">
								<div className="card-body p-4">
									<h4 className="mb-2">Talk to Member of Sales Team</h4>
									<p className="mb-3">Connect with our expert sales team for personalized guidance, property insights, and support tailored to your real estate needs.</p>
									<p className="fw-semibold mb-0">Toll Free : 888 634-5891</p>
								</div>
							</div>
							<div className="card border-0 mb-0">
								<div className="card-body p-4">
									<h4 className="mb-2">Product & Account Support</h4>
									<p className="mb-3">Get dedicated help with your account, features, and services through our expert Product & Account Support team today.</p>
									<Link to="/faq" className="btn btn-dark">Go to FAQ</Link>
								</div>
							</div>
						</div>
						<div className="col-lg-6">
							<div className="ms-0 ms-lg-4">
								<img src="/assets/img/contact-us/contact-us-img-01.jpg" alt="img" className="img-fluid" />
							</div>
						</div>
					</div>
					

				</div>

			</div>

			<div className="contact-us-wrap-02">
			
				<div className="container">

					
					<div className="row">
						<div className="col-lg-12 mx-auto">

							
							<div className="row align-items-center justify-content-center mb-3">
								<div className="col-md-6 col-lg-4">
									<div className="contact-us-item-01">
										<div className="d-flex align-items-center">
											<span className="material-icons-outlined">mail</span>
											<div>
												<h6 className="mb-2">Email Address</h6>
												<p className="mb-0"></p>
												<p className="mb-0"></p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 col-lg-4">
									<div className="contact-us-item-01">
										<div className="d-flex align-items-center">
											<span className="material-icons-outlined">call</span>
											<div>
												<h6 className="mb-2">Phone Number</h6>
												<p className="mb-0">+81649 48103</p>
												<p className="mb-0">+78301 71940</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 col-lg-4">
									<div className="contact-us-item-01">
										<div className="d-flex align-items-center">
											<span className="material-icons-outlined">location_on</span>
											<div>
												<h6 className="mb-2">Address</h6>
												<p className="mb-0">509 Rosewood Drive, San Francisco, California</p>
											</div>
										</div>
									</div>
								</div>
							</div>
							

						</div>
					</div>
					

					
					<div className="row align-items-center row-gap-3">
						<div className="col-lg-6">
							<img src="/assets/img/contact-us/contact-us-img-02.jpg" alt="img" className="img-fluid" />
						</div>
						<div className="col-lg-6">
							<div className="contact-us-item-02">
								<h2>Get In Touch</h2>
								
								<div className="row">
									<div className="col-md-12">
										<div className="mb-3">
											<label className="form-label">Your Name</label>
											<input type="text" className="form-control" />
										</div>
									</div>
									<div className="col-md-6">
										<div className="mb-3">
											<label className="form-label">Phone Number</label>
											<input type="text" className="form-control" id="phone" />
										</div>
									</div>
									<div className="col-md-6">
										<div className="mb-3">
											<label className="form-label">Email</label>
											<input type="text" className="form-control" />
										</div>
									</div>
									<div className="col-md-6">
										<div className="mb-3">
											<label className="form-label">Country</label>
											<select className="select">
												<option>Select</option>
												<option>America</option>
												<option>England</option>
												<option>Russia</option>
												<option>India</option>
											</select>
										</div>
									</div>
									<div className="col-md-6">
										<div className="mb-3">
											<label className="form-label">Subject</label>
											<input type="text" className="form-control" />
										</div>
									</div>
									<div className="col-md-12">
										<div className="mb-3">
											<label className="form-label">Description</label>
											<textarea className="form-control" rows="3" placeholder="Comments"></textarea>
										</div>
									</div>
									<div className="col-md-12">
										<a href="#" className="btn btn-lg btn-dark">Submit Enquiry</a>
									</div>
								</div>
								
							</div>
						</div>
					</div>
					

				</div>
					
			</div>
			
			<div className="google-map">
				<iframe className="rounded-0" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2967.8862835683544!2d-73.98256668525309!3d41.93829486962529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89dd0ee3286615b7%3A0x42bfa96cc2ce4381!2s132%20Kingston%20St%2C%20Kingston%2C%20NY%2012401%2C%20USA!5e0!3m2!1sen!2sin!4v1670922579281!5m2!1sen!2sin"  allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
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

export default ContactUs;



