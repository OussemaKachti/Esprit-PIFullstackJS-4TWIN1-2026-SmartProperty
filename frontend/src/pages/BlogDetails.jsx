import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const BlogDetails = () => {
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
                        <h1 className="breadcrumb-title">Blog Details</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="mdi mdi-home-outline me-1"></i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Blog Details</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">
                <div className="container">

                    
                    <div className="row blog-details-cover">
                        <div className="col-lg-10 mx-auto">
                            <Link to="/blog-grid" className="d-flex align-items-center mb-4"><i className="material-icons-outlined me-1">arrow_back</i>Back to Blog</Link>
                            <div className="card mb-0">
                                <div className="card-body">
                                    <div className="blog-details-item-01">
                                        <div className="blog-details-img-01">
                                            <img src="/assets/img/blogs/blog-img-17.jpg" alt="" className="img-fluid" />
                                        </div>
                                        <div className="blog-details-content-01">
                                            <span className="badge badge-sm bg-secondary fw-semibold">Vila</span>
                                            <h5>Top 10 Tips for First-Time Homebuyers</h5>
                                            <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 author-details">
                                                <div className="d-flex align-items-center me-3">
                                                    <Link to="/agent-details"><img src="/assets/img/agents/agent-02.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                    <Link to="/agent-details">Cecilia New</Link>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">event</i>15 Nov 2025</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <p>If youÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢re living alone or mostly by yourself and seeking ways to enrich your daily life, community living could be the answer. Especially for elderly people, residing among peers offers the perfect balance of independence and supportÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âclose enough to friends and family to feel connected, yet private enough to maintain personal space. LetÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s explore why community living is so important for seniors:</p>
                                    </div>
                                    <div>
                                        <h5 className="mb-4">ThereÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s no place like home:</h5>
                                        
                                         <div className="row row-gap-3 mb-3">
                                            <div className="col-md-6 col-lg-3">
                                                <img src="/assets/img/blogs/blog-img-18.jpg" alt="img" className="img-fluid w-100 rounded" />
                                            </div>
                                            <div className="col-md-6 col-lg-3">
                                                <img src="/assets/img/blogs/blog-img-19.jpg" alt="img" className="img-fluid w-100 rounded" />
                                            </div>
                                            <div className="col-md-6 col-lg-3">
                                                <img src="/assets/img/blogs/blog-img-20.jpg" alt="img" className="img-fluid w-100 rounded" />
                                            </div>
                                            <div className="col-md-6 col-lg-3">
                                                <img src="/assets/img/blogs/blog-img-21.jpg" alt="img" className="img-fluid w-100 rounded" />
                                            </div>
                                         </div>
                                         

                                         <div className="p-2">
                                            <p>ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œHome is where comfort and connection come togetherÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âa sanctuary filled with the laughter of friends, the warmth of family, and the peace of knowing youÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢re cared for. For seniors, that sense of belonging is more than sentimental; itÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s essential. As responsibilities shift with age, having a supportive network at home becomes critical. Community living extends the concept of ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œhomeÃƒÂ¢Ã¢â€šÂ¬Ã‚Â beyond four walls:</p>
                                            <p>it weaves a safety net of neighbors who look out for one another, offers shared activities that spark joy, and creates spontaneous moments of companionshipÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âmorning coffee chats, group walks in the garden, or an impromptu card game in the common room. These daily interactions nourish mental and emotional health just as much as the physical assistance available on-site.</p>
                                             <p>In a community setting, help is never far away, whether itÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s a friendly face bringing in the mail, a neighbor reminding you of your afternoon appointment, or staff responding promptly in an emergency. This blend of independence and interdependence ensures that seniors can continue making memoriesÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âconfident that support, care, and camaraderie are always within reach.ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â</p>
                                         </div>

                                         <div className="card border-0 border-start border-3 border-primary bg-light mb-4">
                                            <div className="card-body">
                                                <div className="row align-items-center row-gap-2">
													<div className="col-lg-2">
														<img src="/assets/img/users/user-03.jpg" alt="img" className="img-fluid avatar avatar-xxxl rounded-circle" />
													</div>
                                                    <div className="col-lg-10">
                                                        <p className="fw-medium mb-1 text-primary">Author</p>
                                                        <h5>Robert Hollenbeck</h5>
                                                        <p className="mb-0">At Dreams Estate, we believe a true dream home goes beyond beautiful walls ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â it nurtures your mind, heart, and spirit.</p>
                                                    </div>
                                                </div>
                                            </div>
                                         </div>

                                         <div className="card shadow-none mb-0">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                    <h6 className="mb-0">Was this article helpful?</h6>
                                                    <p className="mb-0">18 out of 93 found this helpful</p>
                                                    <div className="d-flex align-items-center">
                                                        <a href="#" className="btn btn-sm btn-white d-inline-flex align-items-center me-2"><i className="material-icons-outlined me-1">thumb_up</i>Yes</a>
                                                        <a href="#" className="btn btn-sm btn-white d-inline-flex align-items-center"><i className="material-icons-outlined me-1">thumb_down</i>No</a>
                                                    </div>
                                                </div>
                                            </div>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                    <div className="blog-details-item-02">
                        <h5>Related Post</h5>

                        <div className="blog-carousel-wrapper">
                            <button className="blog-carousel-prev"><i className="fa fa-chevron-left"></i></button>
                            <button className="blog-carousel-next"><i className="fa fa-chevron-right"></i></button>
                            <div className="blog-carousel">
                                <div>
                                    <div className="blog-item-01">
                                        <div className="blog-img">
                                            <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-08.jpg" alt="img" className="img-fluid" /></Link>
                                        </div>
                                        <div className="blog-content">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                                <span className="badge badge-sm bg-secondary fw-semibold">Property</span>
                                                <div className="d-flex align-items-center flex-wrap gap-3 author-details">
                                                    <div className="d-flex align-items-center me-3">
                                                        <Link to="/agent-details"><img src="/assets/img/agents/agent-02.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                        <Link to="/agent-details">Richard</Link>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">event</i>12 Jun 2025</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="mb-1"><Link to="/blog-details">Maintenance Affects ROI</Link></h5>
                                                <p className="mb-0">Regular upkeep not only preserves property value but also attracts better tenants or buyers.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="blog-item-01">
                                        <div className="blog-img">
                                            <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-09.jpg" alt="img" className="img-fluid" /></Link>
                                        </div>
                                        <div className="blog-content">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                                <span className="badge badge-sm bg-secondary fw-semibold">House</span>
                                                <div className="d-flex align-items-center flex-wrap gap-3 author-details">
                                                    <div className="d-flex align-items-center me-3">
                                                        <Link to="/agent-details"><img src="/assets/img/agents/agent-04.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                        <Link to="/agent-details">Sara Porter</Link>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">event</i>01 Jun 2025</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="mb-1"><Link to="/blog-details">Real Estate is Local</Link></h5>
                                                <p className="mb-0">Every market is different. What works in one city might not in another, so do local research.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="blog-item-01">
                                        <div className="blog-img">
                                            <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-07.jpg" alt="img" className="img-fluid" /></Link>
                                        </div>
                                        <div className="blog-content">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                                <span className="badge badge-sm bg-secondary fw-semibold">Duplex</span>
                                                <div className="d-flex align-items-center flex-wrap gap-3 author-details">
                                                    <div className="d-flex align-items-center me-3">
                                                        <Link to="/agent-details"><img src="/assets/img/agents/agent-05.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                        <Link to="/agent-details">Jason Rose</Link>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">event</i>28 Jun 2025</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="mb-1"><Link to="/blog-details"> Legal Due Diligence is a Must</Link></h5>
                                                <p className="mb-0">Before buying, always check the legal title, land use approvals, and potential disputes.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="blog-item-01">
                                        <div className="blog-img">
                                            <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-01.jpg" alt="img" className="img-fluid" /></Link>
                                        </div>
                                        <div className="blog-content">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                                <span className="badge badge-sm bg-secondary fw-semibold">Property</span>
                                                <div className="d-flex align-items-center flex-wrap gap-3 author-details">
                                                    <div className="d-flex align-items-center me-3">
                                                        <Link to="/agent-details"><img src="/assets/img/agents/agent-01.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                        <Link to="/agent-details">Susan Cul</Link>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">event</i>10 Apr 2025</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="mb-1"><Link to="/blog-details">Location is Everything</Link></h5>
                                                <p className="mb-0">The value of a property largely depends on where itÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s located.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="blog-item-01">
                                        <div className="blog-img">
                                            <Link to="/blog-details"><img src="/assets/img/blogs/blog-img-02.jpg" alt="img" className="img-fluid" /></Link>
                                        </div>
                                        <div className="blog-content">
                                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                                                <span className="badge badge-sm bg-secondary fw-semibold">Vila</span>
                                                <div className="d-flex align-items-center flex-wrap gap-3 author-details">
                                                    <div className="d-flex align-items-center me-3">
                                                        <Link to="/agent-details"><img src="/assets/img/agents/agent-04.jpg" alt="" className="avatar avatar-sm rounded-circle me-2" /></Link>
                                                        <Link to="/agent-details">Shelly Cox</Link>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <span className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">event</i>24 Apr 2025</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="mb-1"><Link to="/blog-details">Real Estate is a Long-Term Investment</Link></h5>
                                                <p className="mb-0">Unlike stocks, real estate usually grows in value over time.</p>
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

export default BlogDetails;



