import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const OurTeam = () => {
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
                        <h1 className="breadcrumb-title">Team</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Team</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row row-gap-4">
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-01.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Seth Franklin</a>
										<p className="mb-4">CEO</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-02.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Carol Currie</a>
										<p className="mb-4">Marketing Head</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-04.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Daniel Moreno</a>
										<p className="mb-4">Marketing Head</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-03.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Linda Martin</a>
										<p className="mb-4">Developer</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-05.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Bonnie Scott</a>
										<p className="mb-4">CEO</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-07.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Jacquelin Maldonado</a>
										<p className="mb-4">Marketing Head</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-13.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Peggy Smith</a>
										<p className="mb-4">Marketing Head</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-15.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Mary Oliver</a>
										<p className="mb-4">Developer</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-14.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Nicholas Massey</a>
										<p className="mb-4">CEO</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-17.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Katherine Marker</a>
										<p className="mb-4">Marketing Head</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-18.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Kevin kent</a>
										<p className="mb-4">Marketing Head</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
										</div>
									</div>
								</div>
							</div>
						</div>
                        <div className="col-md-6 col-lg-3">
							<div className="card mb-0">
								<div className="card-body">
									<div className="text-center">
										<a href="#"><img src="/assets/img/users/user-12.jpg" alt="img" className="avatar avatar-xl rounded-circle mb-4" /></a>
										<a href="#" className="fw-semibold d-block">Richard Pearson</a>
										<p className="mb-4">Developer</p>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-x-twitter"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-facebook"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-instagram"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0 me-2"><i className="fa-brands fa-linkedin"></i></a>
											<a href="#" className="btn btn-light rounded-2 p-2 d-inline-flex align-items-center justify-content-end border-0"><i className="fa-brands fa-pinterest"></i></a>
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

export default OurTeam;



