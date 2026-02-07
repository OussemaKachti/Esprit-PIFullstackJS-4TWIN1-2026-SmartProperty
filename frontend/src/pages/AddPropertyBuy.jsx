import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const AddPropertyBuy = () => {
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


	
	

	
	<div className="page-wrapper">

		<div className="breadcrumb-bar">
			<img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
			<img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
			<img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
			<div className="row align-items-center text-center position-relative z-1">
				<div className="col-md-12 col-12 breadcrumb-arrow">
					<h1 className="breadcrumb-title">Add New Property</h1>
					<nav aria-label="breadcrumb" className="page-breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
							<li className="breadcrumb-item active" aria-current="page">Add New Property</li>
						</ol>
					</nav>							
				</div>
			</div>
		</div>
		

		
		<div className="content">
			<div className="container">

				<div className="row">
					<div className="col-xxl-10 col-lg-11 mx-auto">

						<div className="card add-tab-sticky border-0">
							<div className="card-body">
								<ul className="add-tab-list">
									<li>
										<Link to="/add-property-buy" className="active">Property Information</Link>
									</li>
									<li>
										<Link to="/add-property-buy">Property Details</Link>
									</li>
									<li>
										<Link to="/add-property-buy">Amenities</Link>
									</li>
									<li>
										<Link to="/add-property-buy">Documents</Link>
									</li>
									<li>
										<Link to="/add-property-buy">Gallery</Link>
									</li>
									<li>
										<Link to="/add-property-buy">Videos</Link>
									</li>
									<li>
										<Link to="/add-property-buy">Description</Link>
									</li>
									<li>
										<Link to="/add-property-buy">Floor Plans</Link>
									</li>
									<li>
										<Link to="/add-property-buy">Location</Link>
									</li>
								</ul>
							</div>
						</div>
						<form action="add-property-buy.html">
							<div data-bs-spy="scroll" data-bs-target="#list-example" data-bs-offset="0">

								<div id="add-list-1">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Property Information</h6>
												<p className="mb-0">Explore essential details like size, type, pricing, and standout features perfect for comfortable living or smart investment.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body pb-1">

													
													<div className="row">

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Property Name</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Property Type</label>
																<select className="select">
																	<option>Select</option>
																	<option>Buy</option>
																	<option>Sale</option>
																</select>
															</div>
														</div> 

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Property Category</label>
																<select className="select">
																	<option>Select</option>
																	<option>Apartment</option>
																	<option>Villa</option>
																	<option>Condo</option>
																	<option>Residency</option>
																</select>
															</div>
														</div> 

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Currency Type</label>
																<select className="select">
																	<option>Select</option>
																	<option>Cash</option>
																	<option>Bank Transfer</option>
																</select>
															</div>
														</div> 

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Sale Price</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Offer Price</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

													</div>
													

												</div> 
											</div> 
										</div> 
										
									</div>
									
								</div>

								<div id="add-list-2">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Property Details</h6>
												<p className="mb-0">Get key specs including layout, dimensions, and materials that define this propertyÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s quality, structure, and overall design.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body pb-1">

													
													<div className="row">

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Property Id</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Price Per Sqft</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Structure Type</label>
																<select className="select">
																	<option>Select</option>
																	<option>Square</option>
																	<option>Rectangle</option>
																</select>
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">No of Bedrooms</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">No of Bathrooms</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Sqft</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Parking</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Balcony</label>
																<select className="select">
																	<option>Select</option>
																	<option>Yes</option>
																	<option>No</option>
																</select>
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Floor</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Wardrobe</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">TV</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Water Purifier</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Microwave</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">AC</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Fridge</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Wardrobe</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Garage Size</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<label className="form-label">Available From</label>
															<div className="input-group input-group-flat mb-3">
																<input type="text" className="datetimepicker form-control" placeholder="dd/mm/yyyy" />
																<span className="input-group-text border-0">
																	<i className="material-icons-outlined text-dark">calendar_today</i>
																</span>
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Curtains</label>
																<select className="select">
																	<option>Select</option>
																	<option>Yes</option>
																	<option>No</option>
																</select>
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<label className="form-label">Year Constructed</label>
															<div className="input-group input-group-flat mb-3">
																<input type="text" className="datetimepicker form-control" placeholder="dd/mm/yyyy" />
																<span className="input-group-text border-0">
																	<i className="material-icons-outlined text-dark">calendar_today</i>
																</span>
															</div>
														</div> 

													</div>
													

												</div> 
											</div> 
										</div> 

									</div>
									
								</div>

								<div id="add-list-3">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Amenities</h6>
												<p className="mb-0">Enjoy premium features like pool, gym, parking, security, and moreÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âall designed for modern, comfortable everyday living.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body pb-1">

													
													<div className="row">

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_1" checked />
																<label className="form-check-label ms-2" htmlFor="check_1">
																	Air Conditioning
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_2" />
																<label className="form-check-label ms-2" htmlFor="check_2">
																	TV Cable
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_3" checked />
																<label className="form-check-label ms-2" htmlFor="check_3">
																	Refrigerator
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_4" checked />
																<label className="form-check-label ms-2" htmlFor="check_4">
																	Lawn
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_5" />
																<label className="form-check-label ms-2" htmlFor="check_5">
																	Dryer
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_6" />
																<label className="form-check-label ms-2" htmlFor="check_6">
																	WiFi
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_7" />
																<label className="form-check-label ms-2" htmlFor="check_7">
																	Swimming Pool
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_8" checked />
																<label className="form-check-label ms-2" htmlFor="check_8">
																	Outdoor Shower
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_9" />
																<label className="form-check-label ms-2" htmlFor="check_9">
																	Laundry
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_10" />
																<label className="form-check-label ms-2" htmlFor="check_10">
																	Barbeque
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_11" />
																<label className="form-check-label ms-2" htmlFor="check_11">
																	Washer
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_12" />
																<label className="form-check-label ms-2" htmlFor="check_12">
																	Washer
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_13" />
																<label className="form-check-label ms-2" htmlFor="check_13">
																	Microwave
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_14" checked />
																<label className="form-check-label ms-2" htmlFor="check_14">
																	Gym
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_15" />
																<label className="form-check-label ms-2" htmlFor="check_15">
																	Window Coverings
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_16" checked />
																<label className="form-check-label ms-2" htmlFor="check_16">
																	Wide Open Spaces
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_17" />
																<label className="form-check-label ms-2" htmlFor="check_17">
																	Parks
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_18" checked />
																<label className="form-check-label ms-2" htmlFor="check_18">
																	Rooftop Gardens
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_19" />
																<label className="form-check-label ms-2" htmlFor="check_19">
																	Billiards Table
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_20" checked />
																<label className="form-check-label ms-2" htmlFor="check_20">
																	Clubhouse
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_21" />
																<label className="form-check-label ms-2" htmlFor="check_21">
																	Spa
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_22" />
																<label className="form-check-label ms-2" htmlFor="check_22">
																	Walet Trash
																</label>
															</div>
														</div> 

														<div className="col-md-4 col-sm-6">
															<div className="form-check d-flex align-items-center ps-0 mb-3">
																<input className="form-check-input ms-0 mt-0" name="amenities" type="checkbox" id="check_23" checked />
																<label className="form-check-label ms-2" htmlFor="check_23">
																	Sporting Facilities
																</label>
															</div>
														</div> 

													</div>
													

												</div> 
											</div> 
										</div> 

									</div>
									
								</div>

								<div id="add-list-4">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Property Documents</h6>
												<p className="mb-0">View and Upload all essential legal documents, including title, approvals, and receipts, organized for transparency and convenience.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body">
													<div className="mb-3">
														<label className="form-label">Upload Documents</label>
														<div className="file-uploader">
															<input type="file" className="form-control" />
															<Link to="/add-property-buy" className="input-file">
																<span className="browse-btn">Browse Files</span>
																<span className="browse-text">No Files Selected</span>
															</Link>
														</div>
													</div>
													<ul className="ducument-info mb-3">
														<li>The maximum  size is 8 MB. Format: PDF. </li>
														<li>Maximum number of files upload will be 5 files.</li>
													</ul>
													<p className="text-primary d-inline-flex align-items-center mb-0"><i className="material-icons-outlined me-1">done_all</i>Document Uploaded Successfully</p>
												</div> 
											</div> 
										</div> 

									</div>
									
								</div>

								<div id="add-list-5">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Property Gallery</h6>
												<p className="mb-0">Browse high-resolution images of interiors and exteriors to get a true feel of the design and atmosphere.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body">
													<div className="d-flex align-items-center">
														<div className="selected-imgs">
															<span className="img-file"><img src="/assets/img/buy/buy-grid-img-05.jpg" alt="" /></span>
															<Link to="/add-property-buy" className="delete-circle"><i className="material-icons-outlined">delete</i></Link>
														</div>
														<div className="selected-imgs">
															<span className="img-file"><img src="/assets/img/buy/buy-grid-img-06.jpg" alt="" /></span>
															<Link to="/add-property-buy" className="delete-circle"><i className="material-icons-outlined">delete</i></Link>
														</div>
														<div className="selected-imgs">
															<span className="img-file"><img src="/assets/img/buy/buy-grid-img-09.jpg" alt="" /></span>
															<Link to="/add-property-buy" className="delete-circle"><i className="material-icons-outlined">delete</i></Link>
														</div>
													</div>
													<div className="mb-3">
														<label className="form-label">Photo</label>
														<div className="file-uploader">
															<input type="file" className="form-control" />
															<Link to="/add-property-buy" className="input-file">
																<span className="browse-btn">Browse Files</span>
																<span className="browse-text">3 Photos Selected</span>
															</Link>
														</div>
													</div>
													<ul className="ducument-info mb-3">
														<li>The maximum photo size is 8 MB. Formats: jpeg, jpg,. Put the main picture first</li>
														<li>Maximum number of files upload will be 10 files.</li>
													</ul>
													<p className="text-primary d-inline-flex align-items-center mb-0"><i className="material-icons-outlined me-1">done_all</i>Photos Uploaded Successfully</p>
												</div> 
											</div> 
										</div> 

									</div>
									
								</div>
								
								<div id="add-list-6">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Property Video</h6>
												<p className="mb-0">Watch immersive property videos offering a real-time view of space, flow, lighting, and ambiance from every angle.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body pb-1">

													
													<div className="row">

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Embed Video</label>
																<select className="select">
																	<option>Select</option>
																	<option>Youtube</option>
																	<option>Vimeo</option>
																</select>
															</div>
														</div> 

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Video Link</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

													</div>
													

												</div> 
											</div> 
										</div> 

									</div>
									
								</div>

								<div id="add-list-7">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Description</h6>
												<p className="mb-0">A beautifully designed home combining style and function, ideal for modern lifestyles and peaceful, long-term living.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body pb-1">

													
													<div className="row">

														<div className="col-sm-12">
															<div className="mb-3">
																<label className="form-label">Description of Property</label>
																<textarea className="form-control" rows="3"></textarea>
															</div>
														</div> 

													</div>
													

												</div> 
											</div> 
										</div> 

									</div>
									
								</div>

								<div id="add-list-8">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Floor Plans</h6>
												<p className="mb-0">See detailed floor layouts showing room sizes, flow, and structure to help visualize furniture or future changes.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body">
													<div className="border-bottom add-floor-list">
														
														<div className="row">

															<div className="col-sm-6">
																<div className="mb-3">
																	<label className="form-label">Property Name</label>
																	<input type="text" className="form-control" />
																</div>
															</div> 

															<div className="col-sm-6">
																<div className="mb-3">
																	<label className="form-label">Property Type</label>
																	<select className="select">
																		<option>Select</option>
																		<option>Buy</option>
																		<option>Sale</option>
																	</select>
																</div>
															</div> 

															<div className="col-sm-6">
																<div className="mb-3">
																	<label className="form-label">Property Category</label>
																	<select className="select">
																		<option>Select</option>
																		<option>Apartment</option>
																		<option>Villa</option>
																		<option>Condo</option>
																		<option>Residency</option>
																	</select>
																</div>
															</div> 

															<div className="col-sm-6">
																<div className="mb-3">
																	<label className="form-label">Currency Type</label>
																	<select className="select">
																		<option>Select</option>
																		<option>Cash</option>
																		<option>Bank Transfer</option>
																	</select>
																</div>
															</div> 

															<div className="col-sm-6">
																<div className="mb-3">
																	<label className="form-label">Sale Price</label>
																	<input type="text" className="form-control" />
																</div>
															</div> 

															<div className="col-sm-6">
																<div className="mb-3">
																	<label className="form-label">Offer Price</label>
																	<input type="text" className="form-control" />
																</div>
															</div> 

															<div className="col-sm-12">
																<div className="mb-3">
																	<label className="form-label">Description of Property</label>
																	<textarea className="form-control" rows="3">Description</textarea>
																</div>
															</div> 
															
															<div className="col-sm-12">
																<div className="mb-3">
																	<label className="form-label">Photo</label>
																	<div className="file-uploader">
																		<input type="file" className="form-control" />
																		<Link to="/add-property-buy" className="input-file">
																			<span className="browse-btn">Browse Files</span>
																			<span className="browse-text">3 Photos Selected</span>
																		</Link>
																	</div>
																</div>
															</div> 

														</div>
														
													</div>
													<div className="text-end mt-3">
														<a href="#" className="d-inline-flex align-items-center add-floor-plan-btn text-danger"><i className="material-icons-outlined me-2">add</i>Add More</a>
													</div>
												</div> 
											</div> 
										</div> 
										
									</div>
									
								</div>

								<div id="add-list-9">
									
									<div className="row">

										<div className="col-lg-4">
											<div className="mb-4">
												<h6 className="mb-1">Property Location</h6>
												<p className="mb-0">Centrally located near schools, shops, and transportÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âoffering everyday convenience and strong long-term property value.</p>
											</div>
										</div> 

										<div className="col-lg-8">
											<div className="card border-0">
												<div className="card-body">
													
													<div className="row">

														<div className="col-sm-12">
															<div className="mb-3">
																<label className="form-label">Address</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">Country</label>
																<select className="select">
																	<option>Select</option>
																	<option>United States</option>
																	<option>Canada</option>
																	<option>United Kingdom</option>
																</select>
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">State</label>
																<select className="select">
																	<option>Select</option>
																	<option>California</option>
																	<option>New York</option>
																	<option>Texas</option>
																</select>
															</div>
														</div> 

														<div className="col-lg-4 col-sm-6">
															<div className="mb-3">
																<label className="form-label">City</label>
																<select className="select">
																	<option>Select</option>
																	<option>Los Angeles</option>
																	<option>Houston</option>
																	<option>Munich</option>
																</select>
															</div>
														</div> 

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Landmark</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-sm-6">
															<div className="mb-3">
																<label className="form-label">Zipcode</label>
																<input type="text" className="form-control" />
															</div>
														</div> 

														<div className="col-sm-12">
															<div className="google-map">
																<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2967.8862835683544!2d-73.98256668525309!3d41.93829486962529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89dd0ee3286615b7%3A0x42bfa96cc2ce4381!2s132%20Kingston%20St%2C%20Kingston%2C%20NY%2012401%2C%20USA!5e0!3m2!1sen!2sin!4v1670922579281!5m2!1sen!2sin"  allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
															</div>
														</div> 
														
													</div>
													
												</div> 
											</div> 
										</div> 

									</div>
									
								</div>
							</div>

							<div className="d-flex align-items-center justify-content-end add-property-btn">
								<button type="button" className="btn btn-danger btn-lg me-2">Reset</button>
								<button className="btn btn-dark btn-lg" type="submit">Add Property</button>
							</div>
						</form>

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

export default AddPropertyBuy;



