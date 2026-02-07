import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const InvoiceDetails = () => {
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

        
		<header className="header">
            <div className="container">

				<nav className="navbar navbar-expand-lg header-nav">
					<div className="navbar-header">
						<Link to="/" className="navbar-brand logo">
							<img src="/assets/img/logo.svg" className="img-fluid" alt="Logo" />
						</Link>
						<Link to="/" className="navbar-brand logo-dark">
							<img src="/assets/img/logo-white.svg" className="img-fluid" alt="Logo" />
						</Link>
						<a id="mobile_btn" href="#">
							<i className="material-icons-outlined">menu</i>
						</a>
					</div>
					<div className="main-menu-wrapper">

						<div className="menu-header">
							<Link to="/" className="menu-logo">
								<img src="/assets/img/logo.svg" className="img-fluid" alt="Logo" />
							</Link>	
							<Link to="/" className="menu-logo menu-logo-dark">
								<img src="/assets/img/logo-white.svg" className="img-fluid" alt="Logo" />
							</Link>			
							<a id="menu_close" className="menu-close" href="#">
								<i className="material-icons-outlined">close</i>
							</a>
						</div>
						<div className="mobile-search">
							<input type="text" className="form-control form-control-lg" placeholder="Search" />
						</div>

						<ul className="main-nav">
							<li className="has-submenu megamenu">
								<Link to="/invoice-details">Home <i  className="material-icons-outlined">expand_more</i></Link>
								<ul className="submenu mega-submenu">
									<li>
										<div className="megamenu-wrapper">
											<div className="row">
												<div className="col-lg-3">
													<div className="single-demo">
														<div className="demo-img">
															<Link to="/" className="inner-demo-img"><img src="/assets/img/home/home-01.jpg" className="img-fluid " alt="img" /></Link>
														</div>
														<div className="demo-info">
															<Link to="/" className="inner-demo-img">Home 1</Link>
														</div>
													</div>
												</div>
												<div className="col-lg-3">
													<div className="single-demo">
														<div className="demo-img">
															<Link to="/index-2" className="inner-demo-img"><img src="/assets/img/home/home-02.jpg" className="img-fluid " alt="img" /></Link>
														</div>
														<div className="demo-info">
															<Link to="/index-2" className="inner-demo-img">Home 2</Link>
														</div>
													</div>
												</div>
												<div className="col-lg-3">
													<div className="single-demo">
														<div className="demo-img">
															<Link to="/index-3" className="inner-demo-img"><img src="/assets/img/home/home-03.jpg" className="img-fluid " alt="img" /></Link>
														</div>
														<div className="demo-info">
															<Link to="/index-3" className="inner-demo-img">Home 3</Link>
														</div>
													</div>
												</div>
												<div className="col-lg-3">
													<div className="single-demo">
														<div className="demo-img">
															<a href="#" className="inner-demo-img"><img src="/assets/img/home/coming-soon.jpg" className="img-fluid " alt="img" /></a>
														</div>
														<div className="demo-info">
															<a href="#" className="inner-demo-img">Coming Soon</a>
														</div>
													</div>
												</div>
											</div>
										</div>
									</li>
								</ul>
							</li>
							<li className="has-submenu">
								<a href="#">Listing <i  className="material-icons-outlined">expand_more</i></a>
								<ul className="submenu">
									<li className="has-submenu">
										<a href="#">Buy Property</a>
										<ul className="submenu">
											<li><Link to="/buy-property-grid">Buy Grid</Link></li>
											<li><Link to="/buy-property-list">Buy List</Link></li>
											<li><Link to="/buy-property-grid-sidebar">Buy Grid with Sidebar</Link></li>
											<li><Link to="/buy-property-list-sidebar">Buy List with Sidebar</Link></li>
                                            <li><Link to="/buy-grid-map">Buy Grid with map</Link></li>
                                            <li><Link to="/buy-list-map">Buy List with map</Link></li>
                                            <li><Link to="/buy-details">Buy Details</Link></li>
										</ul>
									</li>
									<li className="has-submenu">
										<a href="#">Rent Property</a>
										<ul className="submenu">
											<li><Link to="/rent-property-grid">Rent Grid</Link></li>
											<li><Link to="/rent-property-list">Rent List</Link></li>
											<li><Link to="/rent-property-grid-sidebar">Rent Grid with Sidebar</Link></li>
											<li><Link to="/rent-property-list-sidebar">Rent List with Sidebar</Link></li>
                                            <li><Link to="/rent-grid-map">Rent Grid with map</Link></li>
                                            <li><Link to="/rent-list-map">Rent List with map</Link></li>
                                            <li><Link to="/rent-details">Rent Details</Link></li>
										</ul>
									</li>
								</ul>
							</li>
							<li className="has-submenu">
								<a href="#">Agent <i className="material-icons-outlined">expand_more</i></a>
								<ul className="submenu">
									<li><Link to="/agent-grid">Agent Grid</Link></li>
                                    <li><Link to="/agent-list">Agent List</Link></li>
                                    <li><Link to="/agent-grid-sidebar">Agent Grid with Sidebar</Link></li>
                                    <li><Link to="/agent-list-sidebar">Agent List with Sidebar</Link></li>
                                    <li><Link to="/agent-details">Agent Details</Link></li>
								</ul>
							</li>
                            <li className="has-submenu">
								<a href="#">Agency <i className="material-icons-outlined">expand_more</i></a>
								<ul className="submenu">
									<li><Link to="/agency-grid">Agency Grid</Link></li>
                                    <li><Link to="/agency-list">Agency List</Link></li>
                                    <li><Link to="/agency-grid-sidebar">Agency Grid with Sidebar</Link></li>
                                    <li><Link to="/agency-list-sidebar">Agency List with Sidebar</Link></li>
                                    <li><Link to="/agency-details">Agency Details</Link></li>
								</ul>
							</li>
							<li className="has-submenu active">
								<a href="#">Pages <i className="material-icons-outlined">expand_more</i></a>
								<ul className="submenu">
								    <li><Link to="/about-us">About Us</Link></li>
									<li className="has-submenu">
										<a href="#">Authentication</a>
										<ul className="submenu">
											<li><Link to="/signup">Sign Up</Link></li>
											<li><Link to="/login">Sign In</Link></li>
											<li><Link to="/forgot-password">Forgot Password</Link></li>
											<li><Link to="/reset-password">Reset Password</Link></li>
										</ul>
									</li>
									<li className="active"><Link to="/invoice-details">Invoice Details</Link></li>
									<li><Link to="/contact-us">Contact Us</Link></li>
									<li><Link to="/wishlist">Wishlist</Link></li>
									<li className="has-submenu">
										<a href="#">Error Page</a>
										<ul className="submenu">
											<li><Link to="/error-404">Error 404</Link></li>
											<li><Link to="/error-500">Error 500</Link></li>
										</ul>
									</li>
									<li><Link to="/pricing">Pricing</Link></li>
									<li><Link to="/faq">FAQ</Link></li>
									<li><Link to="/gallery">Gallery</Link></li>
									<li><Link to="/our-team">Our Team</Link></li>
									<li><Link to="/testimonial">Testimonials</Link></li>
									<li><Link to="/terms-condition">Terms & Conditions</Link></li>
									<li><Link to="/privacy-policy">Privacy Policy</Link></li>									
									<li><Link to="/maintenance">Maintenance</Link></li>
									<li><Link to="/coming-soon">Coming Soon</Link></li>
								</ul>
							</li>
							<li className="has-submenu">
								<a href="#">Blog <i className="material-icons-outlined">expand_more</i></a>
								<ul className="submenu">
									<li><Link to="/blog-list">Blog List</Link></li>
									<li><Link to="/blog-grid">Blog Grid</Link></li>
									<li><Link to="/blog-details">Blog Details</Link></li>	
								</ul>
							</li>
						</ul>

						<div className="menu-account">
							<h6>Account</h6>
							<div className="d-flex align-items-center gap-2">
								<div>
									<Link to="/wishlist">
										<i className="material-icons-outlined">favorite_border</i>
										<span className="badge-icon bg-orange">4</span>
									</Link>
								</div>
								<div>
									<Link to="/cart">
										<i className="material-icons-outlined">shopping_cart</i>
										<span className="badge-icon bg-danger">3</span>
									</Link>
								</div>
								<Link to="/invoice-details" className="avatar avatar-sm">
									<img src="/assets/img/users/user-06.jpg" alt="img" className="img-fluid rounded-circle" />
								</Link>
							</div>
						</div>

						<div className="menu-dropdown">
                            <div className="dropdown mb-2">
								<Link to="/invoice-details" className="dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
									<img src="/assets/img/flags/us.svg" alt="Language" className="me-1" height="16" />English
								</Link>
								<div className="dropdown-menu dropdown-menu-end">
									<a href="#" className="dropdown-item d-flex align-items-center">
										<img src="/assets/img/flags/us.svg" alt="" className="me-2" height="16" /> <span className="align-middle">English</span>
									</a>
									<a href="#" className="dropdown-item d-flex align-items-center">
										<img src="/assets/img/flags/de.svg" alt="" className="me-2" height="16" /> <span className="align-middle">German</span>
									</a>
									<a href="#" className="dropdown-item d-flex align-items-center">
										<img src="/assets/img/flags/fr.svg" alt="" className="me-2" height="16" /> <span className="align-middle">French</span>
									</a>
									<a href="#" className="dropdown-item d-flex align-items-center">
										<img src="/assets/img/flags/ae.svg" alt="" className="me-2" height="16" /> <span className="align-middle">Arabic</span>
									</a>								
								</div>		
							</div>
                            <div className="dropdown">
                                <a href="#" className="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    Light
                                </a>
                                <ul className="dropdown-menu mt-2">
                                    <li><a className="dropdown-item light-mode" href="#">Light</a></li>
                                    <li><a className="dropdown-item dark-mode" href="#">Dark</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="menu-login">
                            <Link to="/login" className="btn btn-primary w-100 mb-2">Sign In</Link>
                            <Link to="/signup" className="btn btn-secondary w-100">Register</Link>
                        </div>

					</div>

					<div className="nav header-items">

						<Link to="/invoice-details" className="topbar-link btn btn-light topbar-search" data-bs-toggle="modal" data-bs-target="#search-modal">
							<i className="material-icons-outlined">search</i>
						</Link>

						<div className="dropdown topbar-lang">
							<Link to="/invoice-details" className="topbar-link btn btn-light" data-bs-toggle="dropdown">
								<img src="/assets/img/flags/us.svg" alt="Language" height="16" />
							</Link>
							<div className="dropdown-menu dropdown-menu-end">
								<a href="#" className="dropdown-item d-flex align-items-center">
									<img src="/assets/img/flags/us.svg" alt="" className="me-2" height="16" /> <span className="align-middle">English</span>
								</a>
								<a href="#" className="dropdown-item d-flex align-items-center">
									<img src="/assets/img/flags/de.svg" alt="" className="me-2" height="16" /> <span className="align-middle">German</span>
								</a>
								<a href="#" className="dropdown-item d-flex align-items-center">
									<img src="/assets/img/flags/fr.svg" alt="" className="me-2" height="16" /> <span className="align-middle">French</span>
								</a>
								<a href="#" className="dropdown-item d-flex align-items-center">
									<img src="/assets/img/flags/ae.svg" alt="" className="me-2" height="16" /> <span className="align-middle">Arabic</span>
								</a>								
							</div>		
						</div>

						<div className="dropdown">
							<a href="#" className="topbar-link btn btn-light" data-bs-toggle="dropdown">
								<i className="material-icons-outlined">wb_sunny</i>
							</a>
							<div className="dropdown-menu dropdown-menu-end">
								<a href="#" className="dropdown-item d-flex align-items-center" id="light-mode-toggle">
									<i className="material-icons-outlined me-2">wb_sunny</i> <span className="align-middle">Light Mode</span>
								</a>
								<a href="#" className="dropdown-item d-flex align-items-center" id="dark-mode-toggle">
									<i className="material-icons-outlined me-2">dark_mode</i> <span className="align-middle">Dark Mode</span>
								</a>
							</div>
						</div>

						<div className="dropdown">
							<a href="#" className="topbar-link btn btn-light"  data-bs-toggle="dropdown">
								<i className="material-icons-outlined animate-ring">notifications_none</i>
								<span className="badge-icon bg-orange">4</span>
							</a>
							<div className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg" style={{ minHeight: '300px' }}>
							
								<div className="notification-head">
									<div className="row align-items-center">
										<div className="col">
											<h6 className="m-0"> Notifications</h6>
										</div>
										<div className="col-auto">
											<div className="dropdown">
												<Link to="/invoice-details" className="text-body" data-bs-toggle="dropdown" data-bs-offset="0,15" aria-expanded="false">
													<i className="material-icons-outlined">settings</i>
												</Link>
												<div className="dropdown-menu dropdown-menu-end">
													
													<a href="#" className="dropdown-item">Mark as Read</a>
													
													<a href="#" className="dropdown-item">Delete All</a>
												</div>
											</div>
										</div>
									</div>
								</div>
								
								
								<div className="notification-body position-relative z-2 rounded-0" data-simplebar>
								 
									
									<div className="dropdown-item notification-item text-wrap border-bottom" id="notification-1">
										<div className="d-flex">
											<div className="avatar avatar-md avatar-rounded bg-teal text-white flex-shrink-0">
												MH
											</div>
											<div className="flex-grow-1">
												<p className="mb-1"><span className="fw-medium text-dark">Maria Hill</span> notifications inform you when someone likes</p>
												<div className="d-flex justify-content-between align-items-center">
													<span className="fs-13 d-flex align-items-center"><i className="material-icons-outlined text-body fs-13 me-1">schedule</i>45 mins ago</span>
													<div className="notification-action d-flex align-items-center float-end gap-2">
														<a href="#" className="notification-read rounded-circle bg-danger" data-bs-toggle="tooltip" title="" data-bs-original-title="Make as Read" aria-label="Make as Read"></a>
														<button className="btn rounded-circle p-0" data-dismissible="#notification-1">
															<i className="material-icons-outlined me-1">close</i>
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
							
									
									<div className="dropdown-item notification-item text-wrap border-bottom" id="notification-2">
										<div className="d-flex">
											<div className="avatar avatar-md flex-shrink-0">
												<img src="/assets/img/users/user-03.jpg" alt="img" className="img-fluid rounded-circle" />
											</div>
											<div className="flex-grow-1">
												<p className="mb-1"><span className="fw-medium text-dark">Edward Curr</span> notifications alert you to new messages in your estates inbox.</p>
												<div className="d-flex justify-content-between align-items-center">
													<span className="fs-13 d-flex align-items-center"><i className="material-icons-outlined text-body fs-13 me-1">schedule</i>17 mins ago</span>
													<div className="notification-action d-flex align-items-center float-end gap-2">
														<a href="#" className="notification-read rounded-circle bg-danger" data-bs-toggle="tooltip" title="" data-bs-original-title="Make as Read" aria-label="Make as Read"></a>
														<button className="btn rounded-circle p-0" data-dismissible="#notification-2">
															<i className="material-icons-outlined me-1">close</i>
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									
									<div className="dropdown-item notification-item text-wrap border-bottom" id="notification-3">
										<div className="d-flex">
											<div className="avatar avatar-md flex-shrink-0">
												<img src="/assets/img/users/user-06.jpg" alt="img" className="img-fluid rounded-circle" />
											</div>
											<div className="flex-grow-1">
                                                <p className="mb-1"><span className="fw-medium text-dark">Alex Carter</span>  added a comment to Alex Carter <span className="fw-medium text-dark">ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œOh, I finished de-bugging the phonesÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</span></p>
												<div className="d-flex justify-content-between align-items-center">
													<span className="fs-13 d-flex align-items-center"><i className="material-icons-outlined text-body fs-13 me-1">schedule</i>1 Day Ago</span>
													<div className="notification-action d-flex align-items-center float-end gap-2">
														<a href="#" className="notification-read rounded-circle bg-danger" data-bs-toggle="tooltip" title="" data-bs-original-title="Make as Read" aria-label="Make as Read"></a>
														<button className="btn rounded-circle p-0" data-dismissible="#notification-3">
															<i className="material-icons-outlined me-1">close</i>
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									
									<div className="dropdown-item notification-item text-wrap border-bottom" id="notification-4">
										<div className="d-flex">
											<div className="avatar avatar-md avatar-rounded bg-teal text-white flex-shrink-0">
												AN
											</div>
											<div className="flex-grow-1">
												<p className="mb-1"><span className="fw-medium text-dark">Annie Nirain</span> payment attempt failed. Please verify your details and try again.</p>
												<div className="d-flex justify-content-between align-items-center">
													<span className="fs-13 d-flex align-items-center"><i className="material-icons-outlined text-body fs-13 me-1">schedule</i>45 mins ago</span>
													<div className="notification-action d-flex align-items-center float-end gap-2">
														<a href="#" className="notification-read rounded-circle bg-danger" data-bs-toggle="tooltip" title="" data-bs-original-title="Make as Read" aria-label="Make as Read"></a>
														<button className="btn rounded-circle text-danger p-0" data-dismissible="#notification-4">
															<i className="material-icons-outlined me-1">close</i>
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
									 
								</div>
								
								
								<div className="notification-footer text-center">
									<Link to="/notifications" className="text-center mb-0">
										View All
									</Link>
								</div>
								
							</div>
						</div>

						<Link to="/cart" className="topbar-link btn btn-light topbar-cart">
                            <i className="material-icons-outlined">shopping_cart</i>
							<span className="badge-icon bg-danger">3</span>
                        </Link>

						<Link to="/add-property-buy" className="btn btn-lg btn-dark d-inline-flex align-items-center topbar-add"><i className="material-icons-outlined me-1">home</i>Post Property</Link>

						<div className="dropdown topbar-profile d-flex">
							<Link to="/invoice-details" className="avatar" data-bs-toggle="dropdown">
								<img src="/assets/img/users/user-06.jpg" alt="img" className="img-fluid rounded-circle" />
							</Link>
							<div className="dropdown-menu dropdown-menu-end">
                        
								<div className="d-flex align-items-center user-profile">
									<img src="/assets/img/users/user-06.jpg" className="rounded-circle" width="42" height="42" alt="" />
									<div className="ms-2">
										<h6 className="mb-1">Jafna Cremson</h6>
										<span className="d-block">Administrator</span>
									</div>
								</div>

								
								<a href="#" className="dropdown-item d-inline-flex align-items-center">
									<i className="material-icons-outlined me-2">person_outline</i>Profile Settings
								</a>

								
								<Link to="/notifications" className="dropdown-item d-inline-flex align-items-center">
									<i className="material-icons-outlined me-2">notifications_none</i>Notifications
								</Link>
								
								
								<a href="#" className="dropdown-item d-inline-flex align-items-center">
									<i className="material-icons-outlined me-2">help_outline</i>Help & Support
								</a>
								
								
								<a href="#" className="dropdown-item d-inline-flex align-items-center">
									<i className="material-icons-outlined me-2">settings</i>Settings
								</a>

								<hr className="dropdown-divider" />
								
								<Link to="/login" className="dropdown-item d-inline-flex align-items-center link-danger">
									<i className="material-icons-outlined me-2">logout</i>Sign Out
								</Link>
							</div>
						</div>

					</div>
				</nav>

            </div>
		</header>
		


		
		<div className="page-wrapper">

            
            <div className="breadcrumb-bar">
                <img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
                <img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
                <img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
                <div className="row align-items-center text-center position-relative z-1">
                    <div className="col-md-12 col-12 breadcrumb-arrow">
                        <h1 className="breadcrumb-title">Invoice</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Invoice</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row">
                        <div className="col-xl-8 mx-auto">

                            <div className="invoice-item-wrap">
                                    
                                <div className="border-bottom pb-4 mb-4">
                                    
                                    <div className="row align-items-center row-gap-4">
                                        <div className="col-md-6">
                                            <h5>INVOICE</h5>
                                            <p className="mb-1">Invoice Number : <span className="text-dark">INV-0002</span></p>
                                            <p className="mb-1">Invoice Date : <span className="text-dark">02 Jan 2025</span></p>
                                            <p className="mb-0">Due Date : <span className="text-dark">15 Jan 2025</span></p>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="text-end invoice-logo">
                                                <img src="/assets/img/logo.svg" alt="" className="img-fluid logo mb-1" />
                                                <img src="/assets/img/logo-white.svg" alt="" className="img-fluid logo-dark mb-1" />
                                                <p className="mb-0">Only For Receiptant</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>

                                
                                <div className="row row-gap-3 justify-content-between mb-4">
                                    <div className="col-md-6 col-lg-4">
                                        <div className="invoice-item-01">
                                            <h6>From</h6>
                                            <p>Cartin Joseph</p>
                                            <p>45, 5th Street Newyork, USA</p>
                                            <p>LX6457</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-4">
                                        <div className="invoice-item-01">
                                            <h6>To</h6>
                                            <p>Fazel Yaseer</p>
                                            <p>778 Mittal Street, Germany </p>
                                            <p>454787</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-4">
                                        <div className="invoice-item-02">
                                            <h6>Dreams Estate</h6>
                                            <p>Reg : <span>123000123000</span></p>
                                            <p>Email : <span></span></p>
                                            <p>Mobile : <span>+1 56984 39210</span></p>
                                        </div>
                                    </div>
                                </div>
                                

                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="bg-light">#</th>
                                                <th className="bg-light">Description</th>
                                                <th className="bg-light text-center">Qty</th>
                                                <th className="bg-light text-center">Price</th>
                                                <th className="bg-light text-center">GST</th>
                                                <th className="bg-light text-end">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td>Product Name</td>
                                                <td className="text-center">2</td>
                                                <td className="text-center">650</td>
                                                <td className="text-center">0.00</td>
                                                <td className="text-end">650.00</td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td>Product Name</td>
                                                <td className="text-center">2</td>
                                                <td className="text-center">600</td>
                                                <td className="text-center">0.00</td>
                                                <td className="text-end">600.00</td>
                                            </tr>
                                            <tr>
                                                <td>3</td>
                                                <td>Product Name</td>
                                                <td className="text-center">3</td>
                                                <td className="text-center">200</td>
                                                <td className="text-center">0.00</td>
                                                <td className="text-end">400.00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mb-3 pb-3 border-bottom">
                                    
                                    <div className="row justify-content-end">
                                        <div className="col-lg-6">
                                            
                                            <div className="row row-gap-2 mb-2">
                                                <div className="col-sm-7 text-end">
                                                    <p className="mb-0">Sub Total (excl. GST)</p>
                                                </div>
                                                <div className="col-sm-5 text-end">
                                                    <h6 className="mb-0">$1650.00</h6>
                                                </div>
                                            </div>
                                            
                                            
                                            <div className="row row-gap-2 mb-2">
                                                <div className="col-sm-7 text-end">
                                                    <p className="mb-0">Total GST</p>
                                                </div>
                                                <div className="col-sm-5 text-end">
                                                    <h6 className="mb-0">$0.00</h6>
                                                </div>
                                            </div>
                                            
                                            
                                            <div className="row row-gap-2">
                                                <div className="col-sm-7 text-end">
                                                    <p className="mb-0">Credit Card Fee (if using)</p>
                                                </div>
                                                <div className="col-sm-5 text-end">
                                                    <h6 className="mb-0">$165.00</h6>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                    
                                </div>

                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-3 border-bottom">
                                    <p className="mb-0">Total Items / Qty : 4 / 4.00</p>
                                    <h5 className="mb-0">$1,815.00</h5>
                                </div>

                                <div className="mb-4 pb-3 border-bottom">
                                    <p className="mb-0">Total amount ( in words):   One Thousand Eight Hundred Fifteen Dollars Only.</p>
                                </div>

                                
								<div className="row align-items-center row-gap-3">
									<div className="col-md-6">
										<h6 className="mb-3">PAYMENT INSTRUCTIONS</h6>
										<p className="fw-semibold text-dark mb-1">Dreams Estate</p>
										<p className="mb-1">Bank Name :<span className="text-dark">ABC Bank</span></p>
										<p className="mb-1">SWIFT/IBAN :<span className="text-dark">NZ0201230012</span></p>
										<p className="mb-0">Account Number :<span className="text-dark">936442792418</span></p>
									</div>
									<div className="col-md-6 text-end">
										<p className="fw-semibold text-dark mb-3">Pay Online</p>
										<img src="/assets/img/about-us/qr-code.svg" alt="" className="img-fluid" />
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

export default InvoiceDetails;



