import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const RentDetails = () => {
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



			
            <div className="content">
                <div className="container">

                    
                    <div className="row">
                        <div className="col-xl-8">

                            <div className="mb-4 d-inline-flex align-center justify-content-between w-100 flex-wrap gap-1">
                                <div className="d-inline-flex align-center gap-2">
                                    <span className="badge bg-danger d-flex align-items-center"> <i className="material-icons-outlined fs-14 me-1">generating_tokens</i> Trending </span>
                                    <span className="badge bg-orange d-flex align-items-center"> <i className="material-icons-outlined  fs-14 me-1">loyalty</i> Featured </span>
                                </div>
                                <p className="mb-0 text-dark">
                                    Total No of Visits : 45
                                </p>
                            </div> 

							
							<div className="slider-card service-slider-card mb-4">
								<div className="slide-part mb-4">
									<div className="slider service-slider">
										<div className="service-img-wrap">
											<img src="/assets/img/buy/buy-slide-img-1.jpg" className="img-fluid" alt="Slider Img" />
										</div>
										<div className="service-img-wrap">
											<img src="/assets/img/buy/buy-slide-img-2.jpg" className="img-fluid" alt="Slider Img" />
										</div>
										<div className="service-img-wrap">
											<img src="/assets/img/buy/buy-slide-img-3.jpg" className="img-fluid" alt="Slider Img" />
										</div>
										<div className="service-img-wrap">
											<img src="/assets/img/buy/buy-slide-img-4.jpg" className="img-fluid" alt="Slider Img" />
										</div>
										<div className="service-img-wrap">
											<img src="/assets/img/buy/buy-slide-img-5.jpg" className="img-fluid" alt="Slider Img" />
										</div>
										<div className="service-img-wrap">
											<img src="/assets/img/buy/buy-slide-img-6.jpg" className="img-fluid" alt="Slider Img" />
										</div>
										<div className="service-img-wrap">
											<img src="/assets/img/buy/buy-slide-img-2.jpg" className="img-fluid" alt="Slider Img" />
										</div>
									</div>
								</div>
								<div className="slider slider-nav-thumbnails text-center">
									<div className="slide-img"><img src="/assets/img/buy/buy-details-img-1.jpg" className="img-fluid" alt="Slider Img" /></div>
									<div className="slide-img"><img src="/assets/img/buy/buy-details-img-2.jpg" className="img-fluid" alt="Slider Img" /></div>
									<div className="slide-img"><img src="/assets/img/buy/buy-details-img-3.jpg" className="img-fluid" alt="Slider Img" /></div>
									<div className="slide-img"><img src="/assets/img/buy/buy-details-img-4.jpg" className="img-fluid" alt="Slider Img" /></div>
									<div className="slide-img"><img src="/assets/img/buy/buy-details-img-5.jpg" className="img-fluid" alt="Slider Img" /></div>
									<div className="slide-img"><img src="/assets/img/buy/buy-details-img-6.jpg" className="img-fluid" alt="Slider Img" /></div>
									<div className="slide-img"><img src="/assets/img/buy/buy-details-img-2.jpg" className="img-fluid" alt="Slider Img" /></div>
								</div>
							</div>
							

							
							<div className="accordion accordions-items-seperate">

								
								<div className="accordion-item">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-1" aria-expanded="true">
											Description 
										</button>
									</div>
									<div id="accordion-1" className="accordion-collapse collapse show">
										<div className="accordion-body">
											<p>This property is mostly wooded and sits high on a hilltop overlooking the Mohawk River Valley.Located right in the heart of Upstate NYs Amish farm Country, this land is certified organic makingit extremely rare! Good road frontage on a paved county road with utilities make it an amazingsetting for your dream country getaway! If you like views, you must see this property!This propertyis mostly wooded and sits high on a hilltop overlooking the Mohawk River Valley.</p>
											<div className="more-menu">
												<p> Located right inthe heart of Upstate NYs Amish farm Country, this land is certified organic making it extremelyrare! Good road frontage on a paved county road with utilities make it an amazing setting for yourdream country getaway! If you like views, you must see this property!</p>
											</div>
											<div className="view-all d-inline-flex align-items-center">
												<a href="#" className="viewall-button fs-14">Read More </a>
												<i className="material-icons-outlined">keyboard_arrow_down</i>
											</div>
										</div>
									</div>
								</div>

								
								<div className="accordion-item">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-2" aria-expanded="true">
											Property Features 
										</button>
									</div>
									<div id="accordion-2" className="accordion-collapse collapse show">
										<div className="accordion-body">
											
											<div className="row row-gap-4">
												<div className="col-lg-3 col-md-6">
													<div className="buy-property-items">
														<p> <i className="material-icons-outlined">bed</i>  Bedrooms: 3</p>
														<p> <i className="material-icons-outlined">door_sliding</i> Floor: 5th of 12 </p>
														<p> <i className="material-icons-outlined">microwave</i>  Microwave : 2  </p>
													</div>
												</div> 
												<div className="col-lg-3 col-md-6">
													<div className="buy-property-items">
														<p> <i className="material-icons-outlined">bathtub</i>  Bedrooms: 2</p>
														<p> <i className="material-icons-outlined">bento</i>  Wardrobe :1 </p>
														<p className="mb-lg-0"> <i className="material-icons-outlined">ac_unit</i> AC : 4 </p>
													</div>
												</div> 
												<div className="col-lg-3 col-md-6">
													<div className="buy-property-items">
														<p> <i className="material-icons-outlined">directions_car_filled</i>  Parking: 1</p>
														<p> <i className="material-icons-outlined">tv</i> TV : 4 </p>
														<p className="mb-lg-0"> <i className="material-icons-outlined">kitchen</i>Fridge : 1  </p>
													</div>
												</div> 
												<div className="col-lg-3 col-md-6">
													<div className="buy-property-items">
														<p> <i className="material-icons-outlined">corporate_fare</i> Balcony: Yes</p>
														<p> <i className="material-icons-outlined">water</i>  Water Purifier : 2</p>
														<p className="mb-lg-0 mb-0"> <i className="material-icons-outlined">checkroom</i>  Curtains : yes </p>
													</div>
												</div> 
											</div>
											
										</div>
									</div>
								</div>

								
								<div className="accordion-item">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-3" aria-expanded="true">
											About Property 
										</button>
									</div>
									<div id="accordion-3" className="accordion-collapse collapse show">
										<div className="accordion-body">
											<p className="mb-2">This property is mostly wooded and sits high on a hilltop overlooking the Mohawk River Valley.</p>
											<p className="mb-2"> <i className="fa-solid fa-circle-check text-success me-2 fs-18"></i> 100 meters from school. 3km away from bypass.  </p>
											<p className="mb-2"> <i className="fa-solid fa-circle-check text-success me-2 fs-18"></i> First floor - 2 large bedrooms with attached bathrooms.  </p>
											<p className="mb-2"> <i className="fa-solid fa-circle-check text-success me-2 fs-18"></i> Spacious and well-Equipped kitchen.  </p>
											<p className="mb-2"> <i className="fa-solid fa-circle-check text-success me-2 fs-18"></i> Inviting living room with balcony.  </p>
											<p className="mb-2"> <i className="fa-solid fa-circle-check text-success me-2 fs-18"></i> Terrace with breathtaking views.  </p>
											<p className="mb-0"> <i className="fa-solid fa-circle-check text-success me-2 fs-18"></i> Independent electric and water connections.  </p>
										</div>
									</div>
								</div>

								
								<div className="accordion-item">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-4" aria-expanded="true">
											Amenities
										</button>
									</div>
									<div id="accordion-4" className="accordion-collapse collapse show">
										<div className="accordion-body">

											
											<div className="row row-gap-4">
												<div className="col-lg-3 col-md-6">
													<div className="buy-property-items">
														<p> <i className="material-icons-outlined">fitness_center</i>  Gym</p>
														<p className="mb-lg-0"> <i className="material-icons-outlined">supervised_user_circle</i>Visitor Parking</p>
													</div>
												</div> 
												<div className="col-lg-3 col-md-6">
													<div className="buy-property-items">
														<p> <i className="material-icons-outlined">pool</i> Swimming Pool</p>
														<p className="mb-lg-0"> <i className="material-icons-outlined">wb_sunny</i>Natural Light</p>
													</div>
												</div> 
												<div className="col-lg-3 col-md-6">
													<div className="buy-property-items">
														<p> <i className="material-icons-outlined">snippet_folder</i>Power Backup</p>
														<p className="mb-lg-0"> <i className="material-icons-outlined">meeting_room</i>Airy Rooms</p>
													</div>
												</div> 
												<div className="col-lg-3 col-md-6">
													<div className="buy-property-items">
														<p> <i className="material-icons-outlined">local_bar</i> Clubhouse</p>
														<p className="mb-lg-0"> <i className="material-icons-outlined">interests</i>Spacious Interior</p>
													</div>
												</div> 
											</div>
											
										
										</div>
									</div>
								</div>

								
								<div className="accordion-item">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-5" aria-expanded="true">
											Floor Plan
										</button>
									</div>
									<div id="accordion-5" className="accordion-collapse collapse show">
										<div className="accordion-body">

											<div className="card border-0 shadow-none bg-light rounded mb-3">
												<div className="card-body d-flex align-center justify-content-between gap-2 flex-wrap">
													<h6 className="fs-16 fw-semibold mb-0">Balcony Plan</h6>
													<div className="d-flex align-items-center floor-items">
														<a href="#" className="fs-16 text-dark"> <i className="material-icons-outlined">file_download</i> </a>
														<a href="#" className="fs-16 text-dark"> <i className="material-icons-outlined">remove_red_eye</i> </a>
													</div>
												</div>
											</div>
											<div className="card border-0 shadow-none bg-light rounded mb-3">
												<div className="card-body d-flex align-center justify-content-between gap-2 flex-wrap">
													<h6 className="fs-16 fw-semibold mb-0">Front Hall</h6>
													<div className="d-flex align-items-center floor-items">
														<a href="#" className="fs-16 text-dark"> <i className="material-icons-outlined">file_download</i> </a>
														<a href="#" className="fs-16 text-dark"> <i className="material-icons-outlined">remove_red_eye</i> </a>
													</div>
												</div>
											</div>
											<div className="card border-0 shadow-none bg-light rounded mb-0">
												<div className="card-body d-flex align-center justify-content-between gap-2 flex-wrap">
													<h6 className="fs-16 fw-semibold mb-0">Kitchen</h6>
													<div className="d-flex align-items-center floor-items">
														<a href="#" className="fs-16 text-dark"> <i className="material-icons-outlined">file_download</i> </a>
														<a href="#" className="fs-16 text-dark"> <i className="material-icons-outlined">remove_red_eye</i> </a>
													</div>
												</div>
											</div>

										
										</div>
									</div>
								</div>

								
								<div className="accordion-item">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-6" aria-expanded="true">
											Gallery
										</button>
									</div>
									<div id="accordion-6" className="accordion-collapse collapse show">
										<div className="accordion-body gallery-body">
											<div className="gallery-slider">
												<div className="gallery-card">
													<a href="/assets/img/buy/buy-details-img-1.jpg" data-fancybox="gallery" className="gallery-item rounded"> <img src="/assets/img/buy/buy-details-img-1.jpg" alt="" className="rounded img-fluid" /> </a>
												</div>

												<div className="gallery-card">
													<a href="/assets/img/buy/buy-details-img-2.jpg" data-fancybox="gallery" className="gallery-item rounded"> <img src="/assets/img/buy/buy-details-img-2.jpg" alt="" className="rounded img-fluid" /> </a>
												</div>

												<div className="gallery-card">
													<a href="/assets/img/buy/buy-details-img-3.jpg" data-fancybox="gallery" className="gallery-item rounded"> <img src="/assets/img/buy/buy-details-img-3.jpg" alt="" className="rounded img-fluid" /> </a>
												</div>

												<div className="gallery-card">
													<a href="/assets/img/buy/buy-details-img-4.jpg" data-fancybox="gallery" className="gallery-item rounded"> <img src="/assets/img/buy/buy-details-img-4.jpg" alt="" className="rounded img-fluid" /> </a>
												</div>

												<div className="gallery-card">
													<a href="/assets/img/buy/buy-details-img-5.jpg" data-fancybox="gallery" className="gallery-item rounded"> <img src="/assets/img/buy/buy-details-img-5.jpg" alt="" className="rounded img-fluid" /> </a>
												</div>

												<div className="gallery-card">
													<a href="/assets/img/buy/buy-details-img-6.jpg" data-fancybox="gallery" className="gallery-item rounded"> <img src="/assets/img/buy/buy-details-img-6.jpg" alt="" className="rounded img-fluid" /> </a>
												</div>

												<div className="gallery-card">
													<a href="/assets/img/buy/buy-details-img-2.jpg" data-fancybox="gallery" className="gallery-item rounded"> <img src="/assets/img/buy/buy-details-img-2.jpg" alt="" className="rounded img-fluid" /> </a>
												</div>
											</div>
										</div>
									</div>
								</div>

								
								<div className="accordion-item">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-7" aria-expanded="true">
											Video
										</button>
									</div>
									<div id="accordion-7" className="accordion-collapse collapse show">
										<div className="accordion-body">
											<div className="video-items position-relative">
												<img src="/assets/img/buy/video-img.jpg" alt="" className="img-fluid video-bg" />
												<a className="video-icon" data-fancybox="" href="https://www.youtube.com/embed/AWovHEZcpQU">
													<i className="material-icons-outlined">play_circle_filled</i>
												</a>
											</div>
										</div>
									</div>
								</div>

								
								<div className="accordion-item">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-8" aria-expanded="true">
											Frequently Asked Questions
										</button>
									</div>
									<div id="accordion-8" className="accordion-collapse collapse show">
										<div className="accordion-body">
											<div className="faq-items">

												<div className="faq-card mb">
													<h4 className="faq-title">
														<Link className="collapsed" data-bs-toggle="collapse" to="/rent-details" aria-expanded="false">Does offer free cancellation for a full refund?</Link>
													</h4>
													<div id="faqone" className="card-collapse collapse">
														<div className="faq-content">
															<p>Does have fully refundable room rates available to book on our site. If youÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ve booked a fully refundable room rate, this can be cancelled up to a few days before check-in depending on the property's cancellation policy. Just make sure to check this property's cancellation policy for the exact terms and conditions.</p>
														</div>
													</div>
												</div>
												<div className="faq-card">
													<h4 className="faq-title">
														<Link className="collapsed" data-bs-toggle="collapse" to="/rent-details" aria-expanded="false">Is there a pool?</Link>
													</h4>
													<div id="faqtwo" className="card-collapse collapse">
														<div className="faq-content">
															<p>Yes, there is a pool available for guests, providing a perfect place to relax, unwind, and enjoy some leisure time during their stay.</p>
														</div>
													</div>
												</div>
												<div className="faq-card">
													<h4 className="faq-title">
														<Link className="collapsed" data-bs-toggle="collapse" to="/rent-details" aria-expanded="false">Are pets allowed?</Link>
													</h4>
													<div id="faqthree" className="card-collapse collapse">
														<div className="faq-content">
															<p>Yes, pets are allowed, and we welcome your furry friends to stay with you, ensuring a comfortable experience for both you and your pets.</p>
														</div>
													</div>
												</div>
												<div className="faq-card">
													<h4 className="faq-title">
														<Link className="collapsed" data-bs-toggle="collapse" to="/rent-details" aria-expanded="false">Is airport shuttle service offered?</Link>
													</h4>
													<div id="faqfour" className="card-collapse collapse">
														<div className="faq-content">
															<p>Yes, airport shuttle service is offered to provide convenient and reliable transportation for our guests between the airport and their destination, ensuring a smooth and stress-free travel experience.</p>
														</div>
													</div>
												</div>
												<div className="faq-card mb-0">
													<h4 className="faq-title">
														<Link className="collapsed" data-bs-toggle="collapse" to="/rent-details" aria-expanded="false">What are the check-in and check-out times? </Link>
													</h4>
													<div id="faqfive" className="card-collapse collapse">
														<div className="faq-content">
															<p>Check-in is typically from 12:00 PM, and check-out is usually by 11:00 AM to ensure a smooth transition for all guests.</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								
								<div className="accordion-item mb-xl-0">
									<div className="accordion-header">
										<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-9" aria-expanded="true">
											Reviews
										</button>
									</div>
									<div id="accordion-9" className="accordion-collapse collapse show">
										<div className="accordion-body">
											<div className="sub-head d-flex align-items-center justify-content-between mb-4">
												<h6 className="fs-16 fw-semibold"> Reviews (45) </h6>
												<a href="#" className="btn btn-dark d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#add_review"> <i className="material-icons-outlined me-1 fs-13">edit_note</i>  Write a Review </a>
											</div>

											
											<div className="row mb-3  gap-xl-0 gap-lg-0 gap-3">
												<div className="col-lg-6 d-flex">
													<div className="p-4 bg-light rounded text-center d-flex align-items-center justify-content-center flex-column flex-fill">
														<h6 className="fs-16 fw-medium mb-3"> Customer Reviews & Ratings </h6>
														<div className="mb-3">
															<h2 className="mb-1"> 4.9 <span className="fs-16 text-body fw-normal"> / 5.0</span> </h2>
															<div className="d-flex align-items-center justify-content-center gap-1">
																<i className="material-icons-outlined fs-14 text-warning">star</i>
																<i className="material-icons-outlined fs-14 text-warning">star</i>
																<i className="material-icons-outlined fs-14 text-warning">star</i>
																<i className="material-icons-outlined fs-14 text-warning">star</i>
																<i className="material-icons-outlined fs-14 text-warning">star</i>
															</div>
														</div>
														<p className="mb-0 fs-14"> Based On 2,459 Reviews </p>
													</div>
												</div> 

												<div className="col-lg-6 d-flex">
													<div className="card shadow-none review-progress flex-fill mb-0">
														<div className="card-body ">
															
															<div className="progress-lvl mb-2">
																<p>5 Star Ratings</p>
																<div className="progress">
																	<div className="progress-bar bg-warning five-star" role="progressbar" aria-label="Success example" style={{ width: '85%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
																</div>
																<p>247</p>
															</div>

															
															<div className="progress-lvl mb-2">
																<p>4 Star Ratings</p>
																<div className="progress">
																	<div className="progress-bar bg-warning" role="progressbar" aria-label="Success example" style={{ width: '75%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
																</div>
																<p>145</p>
															</div>

																
															<div className="progress-lvl mb-2">
																<p>3 Star Ratings</p>
																<div className="progress">
																	<div className="progress-bar bg-warning" role="progressbar" aria-label="Success example" style={{ width: '65%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
																</div>
																<p>600</p>
															</div>

																
															<div className="progress-lvl mb-2">
																<p>2 Star Ratings</p>
																<div className="progress">
																	<div className="progress-bar bg-warning" role="progressbar" aria-label="Success example" style={{ width: '55%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
																</div>
																<p>560</p>
															</div>

																
															<div className="progress-lvl mb-0">
																<p className="mb-0">1 Star Ratings</p>
																<div className="progress">
																	<div className="progress-bar bg-warning" role="progressbar" aria-label="Success example" style={{ width: '25%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
																</div>
																<p className="mb-0">400</p>
															</div>
														</div>
													</div> 
												</div> 
											</div>
											

											
											<div className="card shadow-none review-items">
												<div className="card-body">
													<div className="mb-2 d-flex align-center gap-2 flex-wrap">
														<div className="avatar avatar-lg">
															<img src="/assets/img/users/user-06.jpg" alt="" className="img-fluid rounded-circle" />
														</div>
														<div className="">
															<h6 className="fs-16 fw-medium mb-1">Joseph Massey</h6>
															<div className="d-flex align-items-center gap-2 flex-wrap">
																<p className="fs-14 mb-0 text-body"> 2 days ago </p>
																<i className="fa-solid fa-circle text-body"></i>
																<div className="d-flex align-items-center justify-content-center">
																	<i className="material-icons-outlined text-warning">star</i>
																	<i className="material-icons-outlined text-warning">star</i>
																	<i className="material-icons-outlined text-warning">star</i>
																	<i className="material-icons-outlined text-warning">star</i>
																	<i className="material-icons-outlined text-warning">star_half</i>
																</div>
																<p className="fs-14 mb-0 text-body">Unforgettable Stay!</p>
															</div>
														</div>
													</div>
													<p className="mb-2 text-body"> This hotel exceeded my expectations! The pool, spa, and dining options were top-notch, and the room had every amenity I could ask for. It felt like a true getaway. </p>
													<div className="d-flex align-items-center gap-3">	
														<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-body me-1 fs-14">thumb_up</i> 21</p>
														<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-body me-1 fs-14">thumb_down</i> 50</p>
														<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-danger me-1 fs-14">favorite</i> 45</p>
													</div>
												</div>
											</div>

											
											<div className="card shadow-none review-items">
												<div className="card-body">
													<div className="d-flex align-center flex-wrap justify-content-between gap-1 mb-2">
														<div className="d-flex align-center gap-2 flex-wrap">
															<div className="avatar avatar-lg">
																<img src="/assets/img/users/user-08.jpg" alt="" className="img-fluid rounded-circle" />
															</div>
															<div className="flex-wrap">
																<h6 className="fs-16 fw-medium mb-1">Jeffrey Jones</h6>
																<div className="d-flex align-items-center gap-2 flex-wrap">
																	<p className="fs-14 mb-0 text-body"> 2 days ago </p>
																	<i className="fa-solid fa-circle text-body"></i>
																	<div className="d-flex align-items-center justify-content-center">
																		<i className="material-icons-outlined text-warning">star</i>
																		<i className="material-icons-outlined text-warning">star</i>
																		<i className="material-icons-outlined text-warning">star</i>
																		<i className="material-icons-outlined text-warning">star</i>
																		<i className="material-icons-outlined text-warning">star_half</i>
																	</div>
																	<p className="fs-14 mb-0 text-body">Excellent service!</p>
																</div>
															</div>
														</div>
														<a href="#" className="btn d-inline-flex align-items-center fs-13 fw-semibold reply-btn"><i className="material-icons-outlined text-dark me-1">repeat</i>Reply</a>
													</div>
													<p className="mb-2 text-body"> This hotel exceeded my expectations! The pool, spa, and dining options were top-notch, and the room had every amenity I could ask for. It felt like a true getaway. </p>
													<div className="d-flex align-items-center gap-3">	
														<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-body me-1 fs-14">thumb_up</i> 41</p>
														<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-body me-1 fs-14">thumb_down</i> 70</p>
														<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-danger me-1 fs-14">favorite</i> 95</p>
													</div>
												</div>
											</div>

											
											<div className="card shadow-none review-items mb-4">
												<div className="card-body">
													<div className="mb-4">
														<div className="d-flex align-center flex-wrap justify-content-between gap-1 mb-2">
															<div className="d-flex align-center gap-2 flex-wrap">
																<div className="avatar avatar-lg">
																	<img src="/assets/img/users/user-07.jpg" alt="" className="img-fluid rounded-circle" />
																</div>
																<div className="">
																	<h6 className="fs-16 fw-medium mb-1">Jessie Alves</h6>
																	<div className="d-flex align-items-center gap-2 flex-wrap">
																		<p className="fs-14 mb-0 text-body"> 2 days ago </p>
																		<i className="fa-solid fa-circle text-body"></i>
																		<div className="d-flex align-items-center justify-content-center">
																			<i className="material-icons-outlined text-warning">star</i>
																			<i className="material-icons-outlined text-warning">star</i>
																			<i className="material-icons-outlined text-warning">star</i>
																			<i className="material-icons-outlined text-warning">star</i>
																			<i className="material-icons-outlined text-warning">star</i>
																		</div>
																		<p className="fs-14 mb-0 text-body">Convenient Location!</p>
																	</div>
																</div>
															</div>
															<a href="#" className="btn d-inline-flex align-items-center fs-13 fw-semibold reply-btn"><i className="material-icons-outlined text-dark me-1">repeat</i>Reply</a>
														</div>
														<p className="mb-2 text-body"> The location was perfect for exploring the city, and the views from our room were breathtaking. It made our trip so much more enjoyable to stay somewhere central and scenic. </p>
														<div className="d-flex align-items-center gap-3">	
															<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-body me-1 fs-14">thumb_up</i> 11</p>
															<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-body me-1 fs-14">thumb_down</i> 60</p>
															<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-danger me-1 fs-14">favorite</i> 35</p>
														</div>
													</div>

													
													<div className="card shadow-none review-items bg-light border-0 mb-0 ms-lg-5 ms-md-5 ms-3">
														<div className="card-body">
															<div className="d-flex align-center flex-wrap justify-content-between gap-1 mb-2">
																<div className="d-flex align-center gap-2 flex-wrap">
																	<div className="avatar avatar-lg">
																		<img src="/assets/img/users/user-01.jpg" alt="" className="img-fluid rounded-circle" />
																	</div>
																	<div className="">
																		<h6 className="fs-16 fw-medium mb-1">Adrian Hendriques</h6>
																		<div className="d-flex align-items-center gap-2 flex-wrap">
																			<p className="fs-14 mb-0 text-body"> 2 days ago </p>
																			<i className="fa-solid fa-circle text-body"></i>
																			<div className="d-flex align-items-center justify-content-center">
																				<i className="material-icons-outlined text-warning">star</i>
																				<i className="material-icons-outlined text-warning">star</i>
																				<i className="material-icons-outlined text-warning">star</i>
																				<i className="material-icons-outlined text-warning">star</i>
																				<i className="material-icons-outlined text-warning">star</i>
																			</div>
																			<p className="fs-14 mb-0 text-body">Excellent service!</p>
																		</div>
																	</div>
																</div>
																<a href="#" className="btn d-inline-flex align-items-center fs-13 fw-semibold reply-btn"><i className="material-icons-outlined text-dark me-1">repeat</i>Reply</a>
															</div>
															<p className="mb-2 text-body"> Thank you so much for your kind words! We're thrilled to hear that our location and views made your trip even more enjoyable.  We hope to welcome you back soon for another scenic stay! </p>
															<div className="d-flex align-items-center gap-3">	
																<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-body me-1 fs-14">thumb_up</i> 10</p>
																<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-body me-1 fs-14">thumb_down</i> 21</p>
																<p className="mb-0 d-flex align-items-center fs-14"> <i className="material-icons-outlined text-danger me-1 fs-14">favorite</i> 46</p>
															</div>
														</div>
													</div>
												</div>
											</div>

											<div className="text-center">
												<a href="#" className="btn btn-dark d-inline-flex align-center gap-1 review-btn">See All Reviews</a>
											</div>

										</div>
									</div>
								</div>
							</div>
							
                        </div> 

                        <div className="col-xl-4 theiaStickySidebar buy-details-item">
							
							<div className="card">
								<div className="card-header">
									<h5 className="mb-0">Provider Details</h5>
								</div>
								<div className="card-body">
									<div className="card bg-light border-0 rounded shadow-none custom-btn">
										<div className="card-body">
											<div  className="d-flex align-items-center gap-2">
												<div className="avatar avatar-lg">
													<img src="/assets/img/users/user-06.jpg" alt="" className="rounded-circle" />
												</div>
												<div>
													<h6 className="mb-1 fs-16 fw-semibold"><a className="d-block w-100" href="#">Adrian Hendriques</a> </h6>
													<p className="mb-0 fs-14 text-body"> Company Agent </p>
												</div>
											</div>
										</div>
									</div> 

                                    <div className="border p-2 rounded mb-4">
                                        <Link to="/rent-details" className="d-block mb-3 pb-3 border-bottom text-body d-flex align-items-center"><i className="material-icons-outlined text-body me-2 fs-16 p-1 bg-light rounded text-dark">phone</i>  Call Us : +1 12545 45548 </Link>
                                        <Link to="/rent-details" className="d-block text-body d-flex align-items-center"><i className="material-icons-outlined text-body me-2 fs-16 p-1 bg-light rounded text-dark">email</i>Email : <span className="__cf_email__" data-cfemail="92fbfcf4fdd2f7eaf3ffe2fef7bcf1fdff">[email&#160;protected]</span> </Link>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between gap-2 custom-btn flex-wrap mb-0">
										<Link to="/rent-details" className="btn btn-primary btn-lg d-flex align-center justify-content-center"> Whatsapp </Link>
										<Link to="/rent-details" className="btn btn-dark btn-lg d-flex align-center text-center justify-content-center"> Chat Now </Link>
									</div>
								</div> 
							</div> 

                            
                            <div className="card">
								<div className="card-header">
									<h5 className="mb-0">Enquire Us</h5>
								</div>
								<div className="card-body">
									<div className="mb-3">
										<label className="form-label fw-semibold"> Name </label>
										<input type="text" className="form-control" placeholder="Your Name" />
									</div>
									<div className="mb-3">
										<label className="form-label fw-semibold"> Email </label>
										<input type="text" className="form-control" placeholder="Your Email" />
									</div>
									<div className="mb-3">
										<label className="form-label fw-semibold"> Phone </label>
										<input type="text" className="form-control" placeholder="Your Phone Number" />
									</div>
									<div className="mb-4">
										<label className="form-label fw-semibold"> Description </label>
										<textarea className="form-control" rows="3"></textarea>
									</div>
									<div>
										<Link to="/rent-details" className="btn btn-dark w-100 py-2 fs-14">Submit</Link>
									</div>
								</div> 
							</div> 

							
							<div className="card">
								<div className="card-header">
									<h5 className="mb-0">Why Book With Us</h5>
								</div>
								<div className="card-body">
									<div className="mb-0">
										<p className="d-flex align-items-center gap-2 mb-3 text-body"><i className="material-icons-outlined text-secondary">badge</i> Expertise and Experience</p>
										<p className="d-flex align-items-center gap-2 mb-3 text-body"><i className="material-icons-outlined text-secondary">design_services</i> Tailored Services</p>
										<p className="d-flex align-items-center gap-2 mb-3 text-body"><i className="material-icons-outlined text-secondary">play_lesson</i> Comprehensive Planning</p>
										<p className="d-flex align-items-center gap-2 mb-3 text-body"><i className="material-icons-outlined text-secondary">person</i> Client Satisfaction</p>
										<p className="d-flex align-items-center gap-2 mb-0 text-body"><i className="material-icons-outlined text-secondary">support_agent</i> 24/7 Support</p>
									</div>
								</div> 
							</div> 

							
							<div className="card mb-0">
								<div className="custom-map position-relative">
									<Link to="/buy-grid-map" className="btn btn-dark fw-medium"> View Location </Link>
									<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9582106.12236644!2d-15.012343587457918!3d54.10244278649341!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x25a3b1142c791a9%3A0xc4f8a0433288257a!2sUnited%20Kingdom!5e0!3m2!1sen!2sin!4v1747587865989!5m2!1sen!2sin" width="600" height="450" style={{ border: '0;' }} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
								</div>
								<div className="card-body">
									<h6 className="mb-3"> Nearby Landmarks & Visits </h6> 
									<p className="mb-2 text-body"><i className="fa-regular fa-circle-check fs-16 me-2 text-body"></i>  Near By Statue of Liberty </p>
									<p className="mb-2 text-body"><i className="fa-regular fa-circle-check fs-16 me-2 text-body"></i> The Metropolitan Museum of Art </p>
									<p className="mb-0 text-body"><i className="fa-regular fa-circle-check fs-16 me-2 text-body"></i> Yellowstone National Park </p>
								</div> 
							</div> 

                        </div> 
                    </div> 
                    


					
					<div className="row row-gap-4 custom-properties-items">

						
                        <div className="col-xl-3 col-lg-6 col-md-6 d-flex">
                            <div className="property-card mb-0 flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-10.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 px-3 py-2 z-1">
                                            <div className="d-flex align-items-center gap-2">
												<div className="badge badge-sm bg-danger d-flex align-items-center custom-badge">
                                                    <i className="material-icons-outlined">generating_tokens</i>
                                                </div>
                                                <div className="badge badge-sm bg-orange d-flex align-items-center custom-badge">
                                                    <i className="material-icons-outlined">loyalty</i>
                                                </div>
                                            </div>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-start position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-02.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
											<span className="badge bg-secondary"> Condo</span>
											<span className="ms-1 fs-14">Listed on : 25 May 2025</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/rent-details">Beautiful Condo Room</Link> 
                                                </h6>
                                                <div className="d-flex align-items-center fs-14 mb-0 flex-wrap gap-1"><i className="material-icons-outlined me-1 ms-0">location_on</i>25, Crest Apartment, USA </div>
                                            </div>
                                        </div>
										<div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
											<h6 className="text-primary mb-0 ms-1">$400 <span className="fw-normal fs-14"> / Month</span> </h6>
											<div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">5.0</span>
                                            </div>
										</div>
										<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1 border-top border-light-100 pt-3 mt-3">
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">bed</i>
												2 Bedroom
											</li>
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">bathtub</i>
												2 Bath
											</li>
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">straighten</i>
												350 Sq Ft
											</li>
										</ul>
                                    </div>
                                </div> 
                            </div> 
                        </div> 

						
                        <div className="col-xl-3 col-lg-6 col-md-6 d-flex">
                            <div className="property-card mb-0 flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-11.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 px-3 py-2 z-1">
                                            <div className="d-flex align-items-center gap-2">
												<div className="badge badge-sm bg-danger d-flex align-items-center custom-badge">
                                                    <i className="material-icons-outlined">generating_tokens</i>
                                                </div>
                                                <div className="badge badge-sm bg-orange d-flex align-items-center custom-badge">
                                                    <i className="material-icons-outlined">loyalty</i>
                                                </div>
                                            </div>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-start position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-04.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
											<span className="badge bg-primary"> Suite</span>
											<span className="ms-1 fs-14">Listed on : 18 Apr 2025</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/rent-details">Serenity Condo Suite</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>17, Grov Tower, New York, USA</p>
                                            </div>
                                        </div>
										<div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
											<h6 className="text-primary mb-0 ms-1">$500 <span className="fw-normal fs-14"> / Month</span> </h6>
											<div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">5.0</span>
                                            </div>
										</div>
										<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1 border-top border-light-100 pt-3 mt-3">
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">bed</i>
												2 Bedroom
											</li>
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">bathtub</i>
												1 Bath
											</li>
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">straighten</i>
												400 Sq Ft
											</li>
										</ul>
                                    </div>
                                </div> 
                            </div> 
                        </div> 

						
                        <div className="col-xl-3 col-lg-6 col-md-6 d-flex">
                            <div className="property-card mb-0 flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-12.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 px-3 py-2 z-1">
                                            <div className="d-flex align-items-center gap-2">
												<div className="badge badge-sm bg-danger d-flex align-items-center custom-badge">
                                                    <i className="material-icons-outlined">generating_tokens</i>
                                                </div>
                                                <div className="badge badge-sm bg-orange d-flex align-items-center custom-badge">
                                                    <i className="material-icons-outlined">loyalty</i>
                                                </div>
                                            </div>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-start position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-05.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
											<span className="badge bg-secondary"> Luxue</span>
											<span className="ms-1 fs-14">Listed on : 12 Apr 2025</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/rent-details">Downtown Luxe Room</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>88, Springs Lane, Austin, USA</p>
                                            </div>
                                        </div>
										<div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
											<h6 className="text-primary mb-0 ms-1">$450 <span className="fw-normal fs-14"> / Month</span> </h6>
											<div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">5.0</span>
                                            </div>
										</div>
										<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1 border-top border-light-100 pt-3 mt-3">
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">bed</i>
												2 Bedroom
											</li>
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">bathtub</i>
												1 Bath
											</li>
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">straighten</i>
												460 Sq Ft
											</li>
										</ul>
                                    </div>
                                </div> 
                            </div> 
                        </div> 

						
                        <div className="col-xl-3 col-lg-6 col-md-6 d-flex">
                            <div className="property-card mb-0 flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/buy/buy-grid-img-13.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 px-3 py-2 z-1">
                                            <div className="d-flex align-items-center gap-2">
												<div className="badge badge-sm bg-danger d-flex align-items-center custom-badge">
                                                    <i className="material-icons-outlined">generating_tokens</i>
                                                </div>
                                                <div className="badge badge-sm bg-orange d-flex align-items-center custom-badge">
                                                    <i className="material-icons-outlined">loyalty</i>
                                                </div>
                                            </div>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-start position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <div className="user-avatar avatar avatar-md border rounded-circle">
                                                <img src="/assets/img/users/user-07.jpg" alt="User" className="rounded-circle" />
                                            </div>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
											<span className="badge bg-secondary"> Condo</span>
											<span className="ms-1 fs-14">Listed on : 25 May 2025</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/rent-details">Modern Haven Suite</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>42, Hill Residence, Austin, USA</p>
                                            </div>
                                        </div>
										<div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
											<h6 className="text-primary mb-0 ms-1">$600 <span className="fw-normal fs-14"> / Month</span> </h6>
											<div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">5.0</span>
                                            </div>
										</div>
										<ul className="d-flex buy-grid-details justify-content-between align-items-center flex-wrap gap-1 border-top border-light-100 pt-3 mt-3">
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">bed</i>
												4 Bedroom
											</li>
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">bathtub</i>
												2 Bath
											</li>
											<li className="d-flex align-items-center gap-1">
												<i className="material-icons-outlined bg-light text-dark">straighten</i>
												520 Sq Ft
											</li>
										</ul>
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
			
			

		
		<div id="add_review" className="modal fade">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<form action="rent-details.html">
						<div className="modal-header">
							<h4 className="text-dark modal-title fw-bold">Write a Review</h4>
							<button type="button" className="btn-close btn-close-modal custom-btn-close" data-bs-dismiss="modal" aria-label="Close"><i className="material-icons-outlined">close</i></button>
						</div>
						<div className="modal-body">
							<div className="mb-3">
								<label className="form-label">Ratings</label>
								<div className="selection-wrap">
                                	<div className="d-inline-block">
                                    	<div className="rating-selction">
                                        	<input type="radio" name="rating" value="5" id="rating5" />
                                            <label htmlFor="rating5"><i className="fa-solid fa-star"></i></label>
                                            <input type="radio" name="rating" value="4" id="rating4" />
                                            <label htmlFor="rating4"><i className="fa-solid fa-star"></i></label>
                                            <input type="radio" name="rating" value="3" id="rating3" />
                                            <label htmlFor="rating3"><i className="fa-solid fa-star"></i></label>
                                            <input type="radio" name="rating" value="2" id="rating2" />
                                            <label htmlFor="rating2"><i className="fa-solid fa-star"></i></label>
                                            <input type="radio" name="rating" value="1" id="rating1" />
                                            <label htmlFor="rating1"><i className="fa-solid fa-star"></i></label>
                                        </div>
                                    </div>
                                </div>
							</div>
							<div className="mb-3">
								<label className="form-label">Ratings</label>
								<input type="text" className="form-control" />
							</div>
							<div className="mb-3">
								<label className="form-label">Email</label>
								<input type="email" className="form-control" />
							</div>
							<div className="mb-0">
								<label className="form-label">Write your review</label>
								<textarea className="form-control" rows="3"></textarea>
							</div>
						</div>
						<div className="modal-footer">
							<div className="d-flex align-items-center justify-content-end">
								<button type="submit" className="btn btn-lg btn-primary">Submit Review</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
		

    </div>
    </div>
  );
};

export default RentDetails;



