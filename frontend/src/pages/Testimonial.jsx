import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Testimonial = () => {
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
                        <h1 className="breadcrumb-title">Testimonials</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Testimonials</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row row-gap-4">
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>We ended up with our dream home in less than two months! I canÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢t recommend them enough</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-18.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Robert King</a>
											<p className="mb-0">Harlingen</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œThey explained every step clearly and found me the perfect home within my budget.ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-17.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Erin Hawkins</a>
											<p className="mb-0">Penns Neck.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œSelling our family home was an emotional journey, but Ethel Laughlin made it was easier!ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-02.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Margaret Buchanan</a>
											<p className="mb-0">Wausau.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œHighly recommend for anyone selling a home.Their market expertise helped us price the home rightÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-04.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">George William</a>
											<p className="mb-0">Memphis.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œIÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ve worked with [Agent/Company Name] on three investment properties, and every timeÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-06.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Kent Lintz</a>
											<p className="mb-0">San Jose.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œTheyÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ve brought solid opportunities and helped me maximize returns. Their property managementÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-03.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Margaret Lee</a>
											<p className="mb-0">Montgomery.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œManaging tenants used to be stressful until I hired Anne Smith.ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-13.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Amanda Krahn</a>
											<p className="mb-0">Dallas.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œThey handle everything ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â screening, rent collection, and maintenance.ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-16.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">David Marx</a>
											<p className="mb-0">Aberdeen.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œThe application process was quick, and theyÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ve been responsive with any issues since I moved in.ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-12.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Billy Davis</a>
											<p className="mb-0">Allen.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>We ended up with our dream home in less than two months! I canÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢t recommend them enough</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-09.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Robert King</a>
											<p className="mb-0">Harlingen</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ I was nervous and totally overwhelmed. But our agent walked us through every step.ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-11.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Martina Smith</a>
											<p className="mb-0">Glendale.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6 col-lg-4">
							<div className="card mb-0">
								<div className="card-body">
									<div className="d-flex align-items-center mb-2">
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star</i></span>
										<span className="text-warning"><i className="material-icons-outlined">star_half</i></span>
									</div>
									<p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œThe marketing strategy was spot-on, and they handled everything from staging to closingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
									<div className="d-flex align-items-center">
										<a href="#"><img src="/assets/img/users/user-10.jpg" alt="img" className="avatar avatar-lg rounded-circle me-2" /></a>
										<div>
											<a href="#" className="fw-semibold mb-1">Roy Pasco</a>
											<p className="mb-0">Lompoc, London.</p>
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

export default Testimonial;



