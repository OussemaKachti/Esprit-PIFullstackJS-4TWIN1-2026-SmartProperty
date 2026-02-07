import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Gallery = () => {
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
                        <h1 className="breadcrumb-title">Gallery</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Gallery</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row row-gap-4">
                        <div className="col-lg-4">
							<a href="/assets/img/gallery/gallery-img-01.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-01.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-8">
							<a href="/assets/img/gallery/gallery-img-02.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-02.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-3">
							<a href="/assets/img/gallery/gallery-img-03.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-03.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-6">
							<a href="/assets/img/gallery/gallery-img-04.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-04.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-3">
							<a href="/assets/img/gallery/gallery-img-05.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-05.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-8">
							<a href="/assets/img/gallery/gallery-img-06.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-06.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-4">
							<a href="/assets/img/gallery/gallery-img-07.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-07.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-3">
							<a href="/assets/img/gallery/gallery-img-08.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-08.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-6">
							<a href="/assets/img/gallery/gallery-img-09.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-09.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-3">
							<a href="/assets/img/gallery/gallery-img-10.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-10.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-4">
							<a href="/assets/img/gallery/gallery-img-11.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-11.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-8">
							<a href="/assets/img/gallery/gallery-img-12.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-12.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-3">
							<a href="/assets/img/gallery/gallery-img-13.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-13.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-6">
							<a href="/assets/img/gallery/gallery-img-14.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-14.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
						</div>
                        <div className="col-lg-3">
							<a href="/assets/img/gallery/gallery-img-15.jpg" className="image-popup">
								<img src="/assets/img/gallery/gallery-15.jpg" alt="img" className="img-fluid rounded-3" />
							</a>
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

export default Gallery;



