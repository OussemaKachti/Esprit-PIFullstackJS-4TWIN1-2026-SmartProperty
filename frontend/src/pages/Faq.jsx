import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Faq = () => {
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
                        <h1 className="breadcrumb-title">FAQ</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">FAQ</li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
            

			
            <div className="content">

                <div className="container">

                    
                    <div className="row" id="cart-wrap">
                        <div className="col-lg-12 mx-auto">

                            <div className="cart-item-wrap">
                                
                                <div className="row row-gap-3">
									<div className="col-lg-3">
										<div className="card faq-sidebar mb-lg-0">
											<div className="card-body">
												<h5 className="mb-3">Table of Contents</h5>
												<ul className="faq-sidebar">
													<li><Link to="/faq" className="nav-link">General</Link></li>
													<li><Link to="/faq" className="nav-link">Buying</Link></li>
													<li><Link to="/faq" className="nav-link">Sellings</Link></li>
													<li><Link to="/faq" className="nav-link">Renting</Link></li>
													<li><Link to="/faq" className="nav-link">Legal</Link></li>
													<li><Link to="/faq" className="nav-link">Financial</Link></li>
												</ul>
											</div>
										</div>
									</div>
									<div className="col-lg-9">
										<div data-bs-spy="scroll" data-bs-target="#list-example" data-bs-offset="0">
											<div className="mb-4" id="general">
												<h4 className="mb-3">General</h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading1">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse1" aria-expanded="true" aria-controls="CustomIconcollapse1">
																What is real estate?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse1" className="accordion-collapse collapse show" aria-labelledby="CustomIconheading1" data-bs-parent="#CustomIconaccordionExample">
															<div className="accordion-body">Real estate refers to land and any permanent structures on it, such as homes or buildings.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample2">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading2">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse2" aria-expanded="false" aria-controls="CustomIconcollapse2">
																What types of properties are included in real estate?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse2" className="accordion-collapse collapse" aria-labelledby="CustomIconheading2" data-bs-parent="#CustomIconaccordionExample2">
															<div className="accordion-body">Real estate includes residential, commercial, industrial, land, and special-purpose properties.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample3">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading3">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse3" aria-expanded="false" aria-controls="CustomIconcollapse3">
																What is the role of a real estate agent?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse3" className="accordion-collapse collapse" aria-labelledby="CustomIconheading3" data-bs-parent="#CustomIconaccordionExample3">
															<div className="accordion-body">A real estate agent assists clients in buying, selling, or renting properties by guiding them through the process.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-4" id="buying">
												<h4 className="mb-3">Buying </h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample4">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading4">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse4" aria-expanded="false" aria-controls="CustomIconcollapse4">
																How do I start the home-buying process?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse4" className="accordion-collapse collapse" aria-labelledby="CustomIconheading4" data-bs-parent="#CustomIconaccordionExample4">
															<div className="accordion-body">Start home-buying process by checking your budget, getting pre approved for a mortgage & consulting a real estate agent.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample5">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading5">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse5" aria-expanded="false" aria-controls="CustomIconcollapse5">
																How much down payment do I need?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse5" className="accordion-collapse collapse" aria-labelledby="CustomIconheading5" data-bs-parent="#CustomIconaccordionExample5">
															<div className="accordion-body">The down payment typically ranges from 3% to 20% of the home's price, depending on the loan type and requirements.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample6">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading6">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse6" aria-expanded="false" aria-controls="CustomIconcollapse6">
																What is a home inspection?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse6" className="accordion-collapse collapse" aria-labelledby="CustomIconheading6" data-bs-parent="#CustomIconaccordionExample6">
															<div className="accordion-body">A home inspection is a professional evaluation of a property's condition to identify any issues before finalizing the purchase.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-4" id="selling">
												<h4 className="mb-3">Selling </h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample7">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading7">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse7" aria-expanded="false" aria-controls="CustomIconcollapse7">
																WhatÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s the best time to sell a home?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse7" className="accordion-collapse collapse" aria-labelledby="CustomIconheading7" data-bs-parent="#CustomIconaccordionExample7">
															<div className="accordion-body">The best time to sell a home is usually in spring or early summer when buyer demand is strongest.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample8">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading8">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse8" aria-expanded="false" aria-controls="CustomIconcollapse8">
																Should I renovate before selling?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse8" className="accordion-collapse collapse" aria-labelledby="CustomIconheading8" data-bs-parent="#CustomIconaccordionExample8">
															<div className="accordion-body">Renovating before selling can increase your home's value, but focus on cost-effective updates that appeal to buyers.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample9">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading9">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse9" aria-expanded="false" aria-controls="CustomIconcollapse9">
																How is the listing price determined?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse9" className="accordion-collapse collapse" aria-labelledby="CustomIconheading9" data-bs-parent="#CustomIconaccordionExample9">
															<div className="accordion-body">The listing price is set by comparing the home to similar properties and current market conditions.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-4" id="renting">
												<h4 className="mb-3">Renting </h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample10">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading10">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse10" aria-expanded="false" aria-controls="CustomIconcollapse10">
																What documents do I need to rent a property?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse10" className="accordion-collapse collapse" aria-labelledby="CustomIconheading10" data-bs-parent="#CustomIconaccordionExample10">
															<div className="accordion-body">You typically need identification, proof of income, rental application, and references to rent a property.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample11">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading11">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse11" aria-expanded="false" aria-controls="CustomIconcollapse11">
																WhatÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s included in the rent?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse11" className="accordion-collapse collapse" aria-labelledby="CustomIconheading11" data-bs-parent="#CustomIconaccordionExample11">
															<div className="accordion-body">Rent typically covers the property cost and may include utilities, maintenance, or amenities.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample12">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading12">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse12" aria-expanded="false" aria-controls="CustomIconcollapse12">
																How long is a typical lease agreement?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse12" className="accordion-collapse collapse" aria-labelledby="CustomIconheading12" data-bs-parent="#CustomIconaccordionExample12">
															<div className="accordion-body">A typical lease agreement usually lasts 12 months, but can vary from month-to-month to several years.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-4" id="legal">
												<h4 className="mb-3">Legal </h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample13">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading13">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse13" aria-expanded="false" aria-controls="CustomIconcollapse13">
																What is a title deed?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse13" className="accordion-collapse collapse" aria-labelledby="CustomIconheading13" data-bs-parent="#CustomIconaccordionExample13">
															<div className="accordion-body">A title deed is an official document proving ownership of a property.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample14">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading14">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse14" aria-expanded="false" aria-controls="CustomIconcollapse14">
																What is escrow?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse14" className="accordion-collapse collapse" aria-labelledby="CustomIconheading14" data-bs-parent="#CustomIconaccordionExample14">
															<div className="accordion-body">Escrow is when a third party holds funds or documents until a transaction is complete.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample15">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading15">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse15" aria-expanded="false" aria-controls="CustomIconcollapse15">
																What are property taxes?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse15" className="accordion-collapse collapse" aria-labelledby="CustomIconheading15" data-bs-parent="#CustomIconaccordionExample15">
															<div className="accordion-body">Property taxes are fees paid to local governments based on the value of a property.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-0" id="financial">
												<h4 className="mb-3">Financial </h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample16">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading16">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse16" aria-expanded="false" aria-controls="CustomIconcollapse16">
																What is a mortgage?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse16" className="accordion-collapse collapse" aria-labelledby="CustomIconheading16" data-bs-parent="#CustomIconaccordionExample16">
															<div className="accordion-body">A mortgage is a loan used to buy a property, paid back over time with interest.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample17">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading17">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse17" aria-expanded="false" aria-controls="CustomIconcollapse17">
																What are closing costs?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse17" className="accordion-collapse collapse" aria-labelledby="CustomIconheading17" data-bs-parent="#CustomIconaccordionExample17">
															<div className="accordion-body">Closing costs are fees paid at the end of a property purchase for services and taxes.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample18">
													<div className="accordion-item mb-0">
														<h6 className="accordion-header" id="CustomIconheading18">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse18" aria-expanded="false" aria-controls="CustomIconcollapse18">
																Can I get assistance as a first-time homebuyer?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse18" className="accordion-collapse collapse" aria-labelledby="CustomIconheading18" data-bs-parent="#CustomIconaccordionExample18">
															<div className="accordion-body">Yes, many programs offer assistance and benefits specifically for first-time homebuyers.</div>
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

export default Faq;



