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
						<h1 className="breadcrumb-title">Smart Property FAQ - Tunisia</h1>
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
													<li><Link to="/faq" className="nav-link">Buying in Tunisia</Link></li>
													<li><Link to="/faq" className="nav-link">Selling in Tunisia</Link></li>
													<li><Link to="/faq" className="nav-link">Renting in Tunisia</Link></li>
													<li><Link to="/faq" className="nav-link">Legal (Tunisia)</Link></li>
													<li><Link to="/faq" className="nav-link">Financial (TND)</Link></li>
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
																What is Smart Property?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse1" className="accordion-collapse collapse show" aria-labelledby="CustomIconheading1" data-bs-parent="#CustomIconaccordionExample">
															<div className="accordion-body">Smart Property is a Tunisian real-estate platform focused on buying, selling, and renting properties only in Tunisia.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample2">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading2">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse2" aria-expanded="false" aria-controls="CustomIconcollapse2">
																What property types are available on Smart Property?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse2" className="accordion-collapse collapse" aria-labelledby="CustomIconheading2" data-bs-parent="#CustomIconaccordionExample2">
															<div className="accordion-body">You can find apartments, houses, villas, studios, and selected commercial opportunities located in Tunisia.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample3">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading3">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse3" aria-expanded="false" aria-controls="CustomIconcollapse3">
																How does Smart Property support buyers and renters?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse3" className="accordion-collapse collapse" aria-labelledby="CustomIconheading3" data-bs-parent="#CustomIconaccordionExample3">
															<div className="accordion-body">Our platform helps you search verified listings in Tunisia, compare options, contact owners or agencies, and follow your process step by step.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-4" id="buying">
												<h4 className="mb-3">Buying in Tunisia</h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample4">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading4">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse4" aria-expanded="false" aria-controls="CustomIconcollapse4">
																How do I start buying a property in Tunisia?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse4" className="accordion-collapse collapse" aria-labelledby="CustomIconheading4" data-bs-parent="#CustomIconaccordionExample4">
															<div className="accordion-body">Start by defining your budget in TND, selecting the city/zone, then contacting the listing owner or agency to arrange visits and document checks.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample5">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading5">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse5" aria-expanded="false" aria-controls="CustomIconcollapse5">
																What upfront costs should I plan for?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse5" className="accordion-collapse collapse" aria-labelledby="CustomIconheading5" data-bs-parent="#CustomIconaccordionExample5">
															<div className="accordion-body">Plan for a reservation amount (if requested), notary fees, registration fees, and potential bank financing costs based on your profile.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample6">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading6">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse6" aria-expanded="false" aria-controls="CustomIconcollapse6">
																Should I inspect the property before purchase?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse6" className="accordion-collapse collapse" aria-labelledby="CustomIconheading6" data-bs-parent="#CustomIconaccordionExample6">
															<div className="accordion-body">Yes. Always verify construction condition, utilities, neighborhood access, and legal documentation before signing final contracts.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-4" id="selling">
												<h4 className="mb-3">Selling in Tunisia</h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample7">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading7">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse7" aria-expanded="false" aria-controls="CustomIconcollapse7">
																What is the best time to sell a property in Tunisia?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse7" className="accordion-collapse collapse" aria-labelledby="CustomIconheading7" data-bs-parent="#CustomIconaccordionExample7">
															<div className="accordion-body">Demand often increases around key relocation periods and summer months, but a well-priced property can sell all year in active Tunisian cities.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample8">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading8">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse8" aria-expanded="false" aria-controls="CustomIconcollapse8">
																Should I renovate before listing on Smart Property?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse8" className="accordion-collapse collapse" aria-labelledby="CustomIconheading8" data-bs-parent="#CustomIconaccordionExample8">
															<div className="accordion-body">Light improvements like paint, cleaning, and fixing visible defects can improve value perception and speed up buyer interest.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample9">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading9">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse9" aria-expanded="false" aria-controls="CustomIconcollapse9">
																How should I set my selling price?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse9" className="accordion-collapse collapse" aria-labelledby="CustomIconheading9" data-bs-parent="#CustomIconaccordionExample9">
															<div className="accordion-body">Use comparable listings in the same Tunisian area, property condition, total surface, and recent market activity to define a realistic TND price.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-4" id="renting">
												<h4 className="mb-3">Renting in Tunisia</h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample10">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading10">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse10" aria-expanded="false" aria-controls="CustomIconcollapse10">
																What documents are usually needed to rent in Tunisia?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse10" className="accordion-collapse collapse" aria-labelledby="CustomIconheading10" data-bs-parent="#CustomIconaccordionExample10">
															<div className="accordion-body">Usually: national ID or passport, proof of income, and any guarantor documents required by the owner or agency.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample11">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading11">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse11" aria-expanded="false" aria-controls="CustomIconcollapse11">
																What is usually included in monthly rent?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse11" className="accordion-collapse collapse" aria-labelledby="CustomIconheading11" data-bs-parent="#CustomIconaccordionExample11">
															<div className="accordion-body">Monthly rent generally covers occupancy only. Utilities, syndic fees, and maintenance terms should be clearly confirmed in the lease.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample12">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading12">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse12" aria-expanded="false" aria-controls="CustomIconcollapse12">
																How long is a standard lease in Tunisia?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse12" className="accordion-collapse collapse" aria-labelledby="CustomIconheading12" data-bs-parent="#CustomIconaccordionExample12">
															<div className="accordion-body">Many residential leases are set for 12 months, with renewal conditions defined in the contract.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-4" id="legal">
												<h4 className="mb-3">Legal (Tunisia)</h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample13">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading13">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse13" aria-expanded="false" aria-controls="CustomIconcollapse13">
																What ownership document should I verify?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse13" className="accordion-collapse collapse" aria-labelledby="CustomIconheading13" data-bs-parent="#CustomIconaccordionExample13">
															<div className="accordion-body">Always verify the official ownership document (titre foncier or equivalent legal proof) before payment or signature.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample14">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading14">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse14" aria-expanded="false" aria-controls="CustomIconcollapse14">
																Do I need legal supervision during the transaction?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse14" className="accordion-collapse collapse" aria-labelledby="CustomIconheading14" data-bs-parent="#CustomIconaccordionExample14">
															<div className="accordion-body">Yes. It is strongly recommended to proceed with legal supervision (notary/lawyer) to secure documents, payments, and transfer steps.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample15">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading15">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse15" aria-expanded="false" aria-controls="CustomIconcollapse15">
																What taxes or fees may apply?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse15" className="accordion-collapse collapse" aria-labelledby="CustomIconheading15" data-bs-parent="#CustomIconaccordionExample15">
															<div className="accordion-body">Applicable fees can include registration duties, notary costs, and other legal charges depending on the property and transaction type.</div>
														</div>
													</div>
												</div>
											</div>
											<hr className="my-4" />

											<div className="mb-0" id="financial">
												<h4 className="mb-3">Financial (TND)</h4>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample16">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading16">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse16" aria-expanded="false" aria-controls="CustomIconcollapse16">
																How does home financing work in Tunisia?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse16" className="accordion-collapse collapse" aria-labelledby="CustomIconheading16" data-bs-parent="#CustomIconaccordionExample16">
															<div className="accordion-body">A housing loan from a Tunisian bank helps finance your property purchase in TND and is repaid through monthly installments with bank-defined terms.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample17">
													<div className="accordion-item">
														<h6 className="accordion-header" id="CustomIconheading17">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse17" aria-expanded="false" aria-controls="CustomIconcollapse17">
																What are closing fees in Tunisia?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse17" className="accordion-collapse collapse" aria-labelledby="CustomIconheading17" data-bs-parent="#CustomIconaccordionExample17">
															<div className="accordion-body">Closing fees may include notary fees, registration charges, and administrative costs due at final transaction signature.</div>
														</div>
													</div>
												</div>
												<div className="accordion accordion-bordered accordion-custom-icon accordion-arrow-none" id="CustomIconaccordionExample18">
													<div className="accordion-item mb-0">
														<h6 className="accordion-header" id="CustomIconheading18">
															<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#CustomIconcollapse18" aria-expanded="false" aria-controls="CustomIconcollapse18">
																Can first-time buyers get guidance on Smart Property?
																<i className="ti ti-plus accordion-icon accordion-icon-on"></i>
																<i className="ti ti-minus accordion-icon accordion-icon-off"></i>
															</button>
														</h6>
														<div id="CustomIconcollapse18" className="accordion-collapse collapse" aria-labelledby="CustomIconheading18" data-bs-parent="#CustomIconaccordionExample18">
															<div className="accordion-body">Yes. Smart Property helps first-time buyers compare listings, understand required steps, and connect with professionals for legal and financing guidance.</div>
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



