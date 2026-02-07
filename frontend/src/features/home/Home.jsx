import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="main-wrapper">
      <div className="main-header-two">
        {/* Header Start */}

        {/* Header End */}
      </div>

      {/* Banner Section Start */}
      <section className="banner-section-three aos">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-xxl-6 col-lg-7">
              <div className="banner-content" data-aos="fade-up">
                <div className="banner-badge d-inline-flex align-items-center">
                  <span className="badge bg-warning me-2">New</span>
                  <p className="mb-0">No 1 Best Selling Realestate Website</p>
                </div>
                <h1>World's Largest Property Listing site for <span>Rental, Buy & Sell...</span></h1>
                <p>Properties for buy / rent in in your location. We have more than 3000+ listings </p>
                <a href="/buy-property-grid.html" className="btn btn-primary">
                  <i className="material-icons-outlined me-2">lock</i>List Your Property
                </a>
              </div>
            </div>

            <div className="col-xxl-4 col-lg-5">
              <div className="banner-right-content">
                <div className="banner-card">
                  <div className="me-3 card-img">
                    <a href="/buy-details.html">
                      <img src="/assets/img/home-3/banner-01.png" className="rounded" alt="" />
                    </a>
                  </div>
                  <div>
                    <h6 className="text-white">
                      <a href="/buy-details.html" className="text-white">Beautiful Condo Room</a>
                    </h6>
                    <span className="text-white mb-1 d-block">Willow Crest Apartment</span>
                    <p className="rate-info mb-3"><span>$400 </span> / Month</p>
                    <div className="d-flex align-items-center card-info">
                      <p className="me-3">
                        <span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bedroom
                      </p>
                      <p>
                        <span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath
                      </p>
                    </div>
                  </div>
                </div>
                <div className="banner-users d-flex align-items-center flex-wrap gap-2 mb-3">
                  <div className="avatar-list-stacked"> 
                    <span className="avatar avatar-md rounded-circle border-0">
                      <img src="/assets/img/users/user-01.jpg" className="img-fluid rounded-circle" alt="Img" />
                    </span>
                    <span className="avatar avatar-md rounded-circle border-0">
                      <img src="/assets/img/users/user-02.jpg" className="img-fluid rounded-circle" alt="Img" />
                    </span>
                    <span className="avatar avatar-md rounded-circle border-0">
                      <img src="/assets/img/users/user-03.jpg" className="img-fluid rounded-circle" alt="Img" />
                    </span>
                    <span className="avatar avatar-md rounded-circle border-0">
                      <img src="/assets/img/users/user-04.jpg" className="img-fluid rounded-circle" alt="Img" />
                    </span>
                  </div>
                  <div>
                    <div className="d-flex align-items-center mb-1">
                      <h6 className="mb-0 me-2 text-white fw-semibold fs-14">Ratings 5.0</h6>
                      <i className="material-icons-outlined text-warning">star</i>
                      <i className="material-icons-outlined text-warning">star</i>
                      <i className="material-icons-outlined text-warning">star</i>
                      <i className="material-icons-outlined text-warning">star</i>
                      <i className="material-icons-outlined text-warning">star</i>
                    </div>
                    <p className="mb-0 text-white fs-13">Trusted By Client around the World</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="row">
            <div className="col-lg-12">
              <div className="banner-search banner-search-three" data-aos="fade-down">
                <div className="banner-tab">
                  <div className="row">
                    <div className="col-lg-4">
                      <div>
                        <h5 className="mb-0">Search For your Property</h5>
                      </div>
                    </div>

                    <div className="col-lg-8">
                      <div>
                        <ul className="nav nav-tabs justify-content-lg-end" role="tablist">
                          <li className="nav-item" role="presentation">
                            <a className="nav-link active" data-bs-toggle="tab" href="#buy_property" role="tab" aria-controls="buy_property" aria-selected="true"> 
                              <i className="material-icons-outlined me-2">shopping_basket</i>Buy Property
                            </a>
                          </li>
                          <li className="nav-item" role="presentation">
                            <a className="nav-link" data-bs-toggle="tab" href="#rent_property" role="tab" aria-controls="rent_property" aria-selected="false">
                              <i className="material-icons-outlined me-2">king_bed</i>Rent Property
                            </a>
                          </li>
                          <li className="nav-item" role="presentation">
                            <a className="nav-link" data-bs-toggle="tab" href="#commercial_property" role="tab" aria-controls="commercial_property" aria-selected="false">
                              <i className="material-icons-outlined me-2">home</i>Commercial
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="buy_property" role="tabpanel">
                    <div>
                      <form action="/html/buy-property-grid-sidebar.html">
                        <div className="row g-3">
                          <div className="col-lg-4">
                            <div>
                              <label className="form-label">Type of Property</label>
                              <select className="select">
                                <option>Select</option>
                                <option>Buy Property</option>
                                <option>Rent Property</option>
                              </select>
                            </div>
                          </div>

                          <div className="col-lg-4">
                            <div>
                              <label className="form-label">Location</label>
                              <input type="email" className="form-control" placeholder="Search location" />
                            </div>
                          </div>

                          <div className="col-lg-4">
                            <div className="d-flex align-items-end">
                              <div className="flex-fill me-3">
                                <label className="form-label">Min Price</label>
                                <input type="text" className="form-control" placeholder="$" />
                              </div>
                              <div className="flex-fill me-3">
                                <label className="form-label">Max Price</label>
                                <input type="text" className="form-control" placeholder="$" />
                              </div>
                              <div>
                                <button type="submit" className="btn btn-primary">
                                  <span><i className='material-icons-outlined'>search</i></span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="tab-pane fade" id="rent_property" role="tabpanel">
                    <div>
                      <form action="/html/buy-property-grid-sidebar.html">
                        <div className="row g-3">
                          <div className="col-lg-4">
                            <div>
                              <label className="form-label">Type of Property</label>
                              <select className="select">
                                <option>Select</option>
                                <option>Buy Property</option>
                                <option>Rent Property</option>
                              </select>
                            </div>
                          </div>

                          <div className="col-lg-4">
                            <div>
                              <label className="form-label">Location</label>
                              <input type="email" className="form-control" placeholder="Search location" />
                            </div>
                          </div>

                          <div className="col-lg-4">
                            <div className="d-flex align-items-end">
                              <div className="banner-property-grid flex-fill me-3">
                                <label className="form-label">Min Price</label>
                                <input type="text" className="form-control" placeholder="$" />
                              </div>
                              <div className="flex-fill me-3">
                                <label className="form-label">Max Price</label>
                                <input type="text" className="form-control" placeholder="$" />
                              </div>
                              <div>
                                <button type="submit" className="btn btn-primary">
                                  <span><i className='material-icons-outlined'>search</i></span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="tab-pane fade" id="commercial_property" role="tabpanel">
                    <div>
                      <form action="/html/buy-property-grid-sidebar.html">
                        <div className="row g-3">
                          <div className="col-lg-4">
                            <div>
                              <label className="form-label">Type of Property</label>
                              <select className="select">
                                <option>Select</option>
                                <option>Buy Property</option>
                                <option>Rent Property</option>
                              </select>
                            </div>
                          </div>

                          <div className="col-lg-4">
                            <div>
                              <label className="form-label">Location</label>
                              <input type="email" className="form-control" placeholder="Search location" />
                            </div>
                          </div>

                          <div className="col-lg-4">
                            <div className="d-flex align-items-end">
                              <div className="banner-property-grid flex-fill me-3">
                                <label className="form-label">Min Price</label>
                                <input type="text" className="form-control" placeholder="$" />
                              </div>
                              <div className="flex-fill me-3">
                                <label className="form-label">Max Price</label>
                                <input type="text" className="form-control" placeholder="$" />
                              </div>
                              <div>
                                <button type="submit" className="btn btn-primary">
                                  <span><i className='material-icons-outlined'>search</i></span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Banner Section End */}

      {/* Work Section Start */}
      <section className="work-section-three">
        <div className="container">
          <div className="row justify-content-center gy-4">
            <div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
              <div className="work-card bg-soft-warning flex-fill">
                <div className="work-card-icon mb-3">
                  <span className="bg-warning me-2">
                    <img src="/assets/img/icons/work-icon-01.svg" alt="icon" />
                  </span>
                  <h5>Verified Listings</h5>
                </div>
                <p>All properties are thoroughly checked to ensure authenticity and avoid time-wasting.</p>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="200">
              <div className="work-card bg-soft-secondary flex-fill">
                <div className="work-card-icon mb-3">
                  <span className="bg-secondary me-2">
                    <img src="/assets/img/icons/work-icon-02.svg" alt="icon" />
                  </span>
                  <h5>Wide Reach</h5>
                </div>
                <p>Access thousands of listings across top cities, towns, and emerging locations.</p>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="300">
              <div className="work-card bg-soft-pink flex-fill">
                <div className="work-card-icon mb-3">
                  <span className="bg-pink me-2">
                    <img src="/assets/img/icons/work-icon-03.svg" alt="icon" />
                  </span>
                  <h5>Direct Communication</h5>
                </div>
                <p>Connect instantly with sellers, agents, or property managers—no middlemen.</p>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="400">
              <div className="work-card bg-soft-teal flex-fill">
                <div className="work-card-icon mb-3">
                  <span className="bg-teal me-2">
                    <img src="/assets/img/icons/work-icon-04.svg" alt="icon" />
                  </span>
                  <h5>Time-Saving </h5>
                </div>
                <p>No need to hop between sites—everything you need to discover and decide is right here.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Work Section End */}

      {/* Property Section Start */}
      <section className="property-section">
        <div className="container">
          <div className="section-heading-three">
            <div className="sec-line-three">
              <span className="sec-line1"></span>
              <span className="sec-line2"></span>
            </div>
            <h2>Recommended Properties</h2>
            <p>Discover our top service areas, where quality meets convenience.</p>
          </div>

          <div className="row gy-4 justify-content-center">
            <div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
              <div className="location-item">
                <div className="location-img">
                  <a href="#"><img src="/assets/img/home-3/location/location-01.jpg" alt="" /></a>
                  <div className="bottom-text">
                    <div className="location-name">
                      <h5>Ukraine</h5>
                      <p>300 Properties</p>
                    </div>
                    <div className="arrow-overlay">
                      <a href="javascript:void(0);"><i className="material-icons-outlined">north_east</i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
              <div className="location-item">
                <div className="location-img">
                  <a href="#"><img src="/assets/img/home-3/location/location-02.jpg" alt="" /></a>
                  <div className="bottom-text">
                    <div className="location-name">
                      <h5>Russia</h5>
                      <p>458 Properties</p>
                    </div>
                    <div className="arrow-overlay">
                      <a href="javascript:void(0);"><i className="material-icons-outlined">north_east</i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
              <div className="location-item">
                <div className="location-img">
                  <a href="#"><img src="/assets/img/home-3/location/location-03.jpg" alt="" /></a>
                  <div className="bottom-text">
                    <div className="location-name">
                      <h5>Thailand</h5>
                      <p>175 Properties</p>
                    </div>
                    <div className="arrow-overlay">
                      <a href="javascript:void(0);"><i className="material-icons-outlined">north_east</i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
              <div className="location-item">
                <div className="location-img">
                  <a href="#"><img src="/assets/img/home-3/location/location-04.jpg" alt="" /></a>
                  <div className="bottom-text">
                    <div className="location-name">
                      <h5>Azerbaijan</h5>
                      <p>155 Properties</p>
                    </div>
                    <div className="arrow-overlay">
                      <a href="javascript:void(0);"><i className="material-icons-outlined">north_east</i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
              <div className="location-item">
                <div className="location-img">
                  <a href="#"><img src="/assets/img/home-3/location/location-05.jpg" alt="" /></a>
                  <div className="bottom-text">
                    <div className="location-name">
                      <h5>Germany</h5>
                      <p>265 Properties</p>
                    </div>
                    <div className="arrow-overlay">
                      <a href="javascript:void(0);"><i className="material-icons-outlined">north_east</i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-4 pt-3">
            <a href="javascript:void(0);" className="btn btn-dark btn-lg d-inline-flex align-items-center">
              View More Locations<i className="material-icons-outlined ms-1">north_east</i>
            </a>
          </div>
        </div>
      </section>
      {/* Property Section End */}


    </div>
  );
};

export default Home;


