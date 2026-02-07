import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const BlogGrid = () => {
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
                        <h1 className="breadcrumb-title">Blog Grid</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="mdi mdi-home-outline me-1"></i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Blog Grid</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">
                <div className="container">

                    
                    <div className="row row-gap-4 justify-content-center">
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-01.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Property</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-01.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Susan Culli</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>10 Apr 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Location is Everything</Link></h5>
                                        <p className="mb-0">The value of a property largely depends on where itÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s located.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-02.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Vila</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-04.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Shelly Cox</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>24 Apr 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Real Estate is a Investment</Link></h5>
                                        <p className="mb-0">Unlike stocks, real estate usually grows in value over time.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-03.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Godown</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-02.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Eva Jones</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>27 Sep 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Market Trends Matter</Link></h5>
                                        <p className="mb-0">Staying informed about housing market trends helps you make smarter.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-04.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Factory</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-03.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Rebecca</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>10 May 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Property Type Affects Value</Link></h5>
                                        <p className="mb-0">Residential, commercial, and industrial properties vary widely available in price and features.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-05.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Guest house</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-06.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Sheila</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>28 May 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Financing Options Are Crucial</Link></h5>
                                        <p className="mb-0">Understanding mortgages, interest rates, and loan types can save you thousands over time.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-06.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Cottage</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-07.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Walter Cusson</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>02 Jul 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Real Estate Agents Add Value</Link></h5>
                                        <p className="mb-0">A knowledgeable agent can guide you through paperwork, negotiations, and legalities with ease.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-07.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Duplex</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-05.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Jason Rosen</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>28 Jun 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details"> Legal Due Diligence is a Must</Link></h5>
                                        <p className="mb-0">Before buying a property, always check the legal title, land use approvals, and potential disputes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-08.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">Property</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-02.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Richard</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">events</i>12 Jun 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Maintenance Affects ROI</Link></h5>
                                        <p className="mb-0">Regular upkeep not only preserves property value but also attracts better tenants or buyers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="blog-item-01">
                                <div className="blog-img">
                                    <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-09.jpg" alt="img" className="img-fluid" /></Link>
                                </div>
                                <div className="blog-content">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                        <span className="badge badge-sm bg-secondary fw-semibold">House</span>
                                        <div className="d-flex align-items-center author-details">
                                            <div className="d-flex align-items-center me-3">
                                                <Link to="/agent-details"><img src="/assets/img/agents/agent-04.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                <Link to="/agent-details">Sara Porter</Link>
                                            </div>
											<span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">event</i>01 Jun 2025</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-1"><Link to="/blog-details">Real Estate is Local</Link></h5>
                                        <p className="mb-0">Every market is different. What works in one city might not in another, so do local research.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    

					<div className="d-flex align-items-center justify-content-center">
						<a href="#" className="btn btn-dark d-inline-flex align-items-center load-more-btn"><i className="material-icons-outlined me-1">autorenew</i>Load More</a>
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

export default BlogGrid;



