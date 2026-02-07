import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const BlogList = () => {
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
                        <h1 className="breadcrumb-title">Blog List</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="mdi mdi-home-outline me-1"></i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Blog List</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">
                <div className="container">

                    
                    <div className="row row-gap-4">
                        <div className="col-md-12 col-lg-8">
                            <div className="blog-item-01 mb-4">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-10.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Property</span>
                                        <div className="d-flex align-items-center flex-wrap gap-3 author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-01.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Maria Ramirez</Link>
                                            </div>
                                            <div className="d-flex align-items-center"> 
                                                <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>27 Sep 2025</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">The most popular cities for homebuyers</Link></h5>
                                        <p className="mb-0">The majority have, although there are many other lorem ipsum passages available.</p>
                                    </div>
                                </div>
                            </div>
							<div className="blog-item-01 mb-4">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-11.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Vila</span>
                                        <div className="d-flex align-items-center flex-wrap gap-3 author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-04.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Laura Mincey</Link>
                                            </div>
                                            <div className="d-flex align-items-center"> 
                                                <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>20 Oct 2025</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">How to become financially independent</Link></h5>
                                        <p className="mb-0">Quia omnis velit. Cupiditate et perspiciatis. Asperiores dolor magnam fuga voluptatum beatae.</p>
                                    </div>
                                </div>
                            </div>
							<div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-12.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Guest House</span>
                                        <div className="d-flex align-items-center flex-wrap gap-3 author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-02.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Cecilia Newsome</Link>
                                            </div>
                                            <div className="d-flex align-items-center"> 
                                                <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>15 Nov 2025</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Discover how our future is actually shaped by real estate.</Link></h5>
                                        <p className="mb-0">Although there are numerous types of lorem ipsum passages accessible, most of them contain...</p>
                                    </div>
                                </div>
                            </div>
							<div className="d-flex align-items-center justify-content-center">
                                <a href="#" className="btn btn-dark d-inline-flex align-items-center load-more-btn"><i className="material-icons-outlined me-1">autorenew</i>Load More</a>
                            </div>
                        </div>
						<div className="col-lg-4 theiaStickySidebar">
							<div className="card">
								<div className="card-header">
									<h4 className="mb-0">Filter</h4>
								</div>
								<div className="card-body">
									<input type="text" className="form-control" placeholder="Search" />
								</div>
							</div>
							<div className="card">
								<div className="card-header">
									<h4 className="mb-0">Categories</h4>
								</div>
								<div className="card-body">
									<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
										<a href="#" className="link-body">Property</a>
										<p>15</p>
									</div>
									<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
										<a href="#" className="link-body">Vila</a>
										<p>22</p>
									</div>
									<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
										<a href="#" className="link-body">House</a>
										<p>14</p>
									</div>
									<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
										<a href="#" className="link-body">Guest House</a>
										<p>14</p>
									</div>
									<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
										<a href="#" className="link-body">Factory</a>
										<p>74</p>
									</div>
									<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-0">
										<a href="#" className="mb-0 link-body">Godown</a>
										<p className="mb-0">75</p>
									</div>
								</div>
							</div>
							<div className="card mb-0">
								<div className="card-header">
									<h4 className="mb-0">Top Article</h4>
								</div>
								<div className="card-body">
									<div className="blog-item-02 mb-3">
										<div className="blog-img-img">
											<img src="/assets/img/blogs/blog-img-13.jpg" alt="" className="img-fluid" />
										</div>
										<div className="blog-content-02">
											<h5><Link to="/blog-details">Great Business Tips in 2025</Link></h5>
											<p>27 Sep 2025</p>
										</div>
									</div>
									<div className="blog-item-02 mb-3">
										<div className="blog-img-img">
											<img src="/assets/img/blogs/blog-img-14.jpg" alt="" className="img-fluid" />
										</div>
										<div className="blog-content-02">
											<h5><Link to="/blog-details">8 Amazing Tricks About Build...</Link></h5>
											<p>05 Oct 2025</p>
										</div>
									</div>
									<div className="blog-item-02 mb-3">
										<div className="blog-img-img">
											<img src="/assets/img/blogs/blog-img-15.jpg" alt="" className="img-fluid" />
										</div>
										<div className="blog-content-02">
											<h5><Link to="/blog-details">Excited News About Buildings.</Link> </h5>
											<p>27 Sep 2025</p>
										</div>
									</div>
									<div className="blog-item-02">
										<div className="blog-img-img">
											<img src="/assets/img/blogs/blog-img-16.jpg" alt="" className="img-fluid" />
										</div>
										<div className="blog-content-02">
											<h5><Link to="/blog-details">City for homebuyers.</Link></h5>
											<p>10 Dec 2025</p>
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
							<div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
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

export default BlogList;



