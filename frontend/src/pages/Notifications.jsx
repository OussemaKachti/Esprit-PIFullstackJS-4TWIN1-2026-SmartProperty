import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Notifications = () => {
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
                        <h1 className="breadcrumb-title">Notifications</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Notifications</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row">
                        <div className="col-lg-12 mx-auto">
                            <div className="notification-header">
                                <div className="notication-title">
                                    <h2 className="mb-0">Notifications</h2>
                                    <p className="mb-0">Improve the way your work, discover a brand new tool and drop the hassle once and for all.</p>
                                </div>
                                <ul>
                                    <li className="mb-0">
                                        <a href="#" className="btn mark-all-btn"><span className="material-icons-outlined">check_box</span>Mark All as Read</a>
                                    </li>
                                    <li className="mb-0">
                                        <a href="#" className="btn delete-all-btn"><span className="material-icons-outlined">delete</span>Delete all</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="notication-list">

                                <div className="mb-4">
                                    <h6 className="mb-3">Today</h6>
                                    <div className="notication-item">
                                        <div className="row align-items-center">
                                            <div className="col-lg-9">
                                                <div className="notication-content">
                                                    <span>
                                                        <img src="/assets/img/users/user-01.jpg" className="img-fluid" alt="img" />
                                                    </span>
                                                    <div className="notication-info">
                                                        <div>
                                                            <p className="me-0"><span className="text-dark fw-semibold me-1">Thompson Hicks</span>your current lease will expire in 30 days. Renew early to secure your stay.</p>
                                                            <p className="notify-time">05 mins ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div className="d-lg-flex align-items-center justify-content-end">
                                                    <div className="notification-btn me-3">
                                                        <a href="#" className="btn delete-btn"><span className="material-icons-outlined">delete</span>Delete</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="notication-item">
                                        <div className="row align-items-center">
                                            <div className="col-lg-9">
                                                <div className="notication-content">
                                                    <span>
                                                        <img src="/assets/img/users/user-02.jpg" className="img-fluid" alt="img" />
                                                    </span>
                                                    <div className="notication-info">
                                                        <div>
                                                            <p className="me-0"><span className="text-dark fw-semibold me-1">Jennifer Tovar</span>notifications alert you to new messages in your estates inbox.</p>
                                                            <p className="notify-time">10 mins ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div className="d-lg-flex align-items-center justify-content-end">
                                                    <div className="notification-btn me-3">
                                                        <a href="#" className="btn delete-btn"><span className="material-icons-outlined">delete</span>Delete</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-0">
                                    <h6 className="mb-3">Yesterday</h6>
                                    <div className="notication-item">
                                        <div className="row align-items-center">
                                            <div className="col-lg-9">
                                                <div className="notication-content">
                                                    <span>
                                                        <img src="/assets/img/users/user-06.jpg" className="img-fluid" alt="img" />
                                                    </span>
                                                    <div className="notication-info">
                                                        <div>
                                                            <p className="me-0"><span className="text-dark fw-semibold me-1">James Schulte</span>Your profile information has been updated successfully.</p>
                                                            <p className="notify-time">20 Dec 2024</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div className="d-lg-flex align-items-center justify-content-end">
                                                    <div className="notification-btn me-3">
                                                        <a href="#" className="btn delete-btn"><span className="material-icons-outlined">delete</span>Delete</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="notication-item">
                                        <div className="row align-items-center">
                                            <div className="col-lg-9">
                                                <div className="notication-content">
                                                    <span>
                                                        <img src="/assets/img/users/user-04.jpg" className="img-fluid" alt="img" />
                                                    </span>
                                                    <div className="notication-info">
                                                        <div>
                                                            <p className="me-0">You have a new message from <span className="text-dark fw-semibold me-1">William Aragon</span>regarding payment issue</p>
                                                            <p className="notify-time">20 Dec 2024</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div className="d-lg-flex align-items-center justify-content-end">
                                                    <div className="notification-btn me-3">
                                                        <a href="#" className="btn delete-btn"><span className="material-icons-outlined">delete</span>Delete</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="notication-item">
                                        <div className="row align-items-center">
                                            <div className="col-lg-9">
                                                <div className="notication-content">
                                                    <span>
                                                        <img src="/assets/img/users/user-05.jpg" className="img-fluid" alt="img" />
                                                    </span>
                                                    <div className="notication-info">
                                                        <div>
                                                            <p className="me-0"><span className="text-dark fw-semibold me-1">Shirley Lis</span>Payment attempt failed. Please verify your details and try again.</p>
                                                            <p className="notify-time">20 Dec 2024</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div className="d-lg-flex align-items-center justify-content-end">
                                                    <div className="notification-btn me-3">
                                                        <a href="#" className="btn delete-btn"><span className="material-icons-outlined">delete</span>Delete</a>
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

export default Notifications;



