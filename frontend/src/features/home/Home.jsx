import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProperties, getImageUrl, getProperties } from '../../services/propertyService';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    getFeaturedProperties(6)
      .then(data => {
        setFeaturedProperties(data);
      })
      .catch(err => console.error('Error fetching featured:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Fetch all properties to get location data
    getProperties({ limit: 100 })
      .then(data => {
        if (data && data.properties) {
          // Group properties by city and count them
          const cityMap = {};
          data.properties.forEach(property => {
            const city = property.city || 'Unknown';
            if (cityMap[city]) {
              cityMap[city]++;
            } else {
              cityMap[city] = 1;
            }
          });

          // Convert to array and sort by count
          const locationArray = Object.entries(cityMap)
            .map(([city, count]) => ({
              name: city,
              count: count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Get top 5 locations

          setLocations(locationArray);
        }
      })
      .catch(err => console.error('Error fetching locations:', err))
      .finally(() => setLocationsLoading(false));
  }, []);

  const topProperty = featuredProperties[0];

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
                <Link to="/buy-property-grid" className="btn btn-primary">
                  <i className="material-icons-outlined me-2">lock</i>List Your Property
                </Link>
              </div>
            </div>

            <div className="col-xxl-4 col-lg-5">
              <div className="banner-right-content">
                {featuredProperties && featuredProperties.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {featuredProperties.slice(0, 3).map((prop) => (
                      <div className="banner-card position-relative" key={prop._id}>
                        <div className="me-3 card-img">
                          <Link to={prop.listingType === 'FOR_RENT' ? `/rent-details/${prop._id}` : `/buy-details/${prop._id}`}>
                            <img
                              src={prop.images && prop.images.length > 0 ? getImageUrl(prop.images[0]) : '/assets/img/home-3/banner-01.png'}
                              className="rounded"
                              alt={prop.title}
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                          </Link>
                        </div>
                        <div>
                          <h6 className="text-white">
                            <Link to={prop.listingType === 'FOR_RENT' ? `/rent-details/${prop._id}` : `/buy-details/${prop._id}`} className="text-white">
                              {prop.title}
                            </Link>
                          </h6>
                          <span className="text-white mb-1 d-block">{prop.city}, {prop.country}</span>
                          <p className="rate-info mb-3"><span>${prop.price?.toLocaleString?.() ?? prop.price}</span> {prop.listingType === 'FOR_RENT' ? '/ Month' : ''}</p>
                          <div className="d-flex align-items-center card-info">
                            <p className="me-3 text-white">
                              <span className="me-2"><i className="material-icons-outlined">bed</i></span>{prop.rooms || 0} Bed
                            </p>
                            <p className="text-white">
                              <span className="me-2"><i className="material-icons-outlined">bathtub</i></span>{prop.bathrooms || 0} Bath
                            </p>
                          </div>
                        </div>

                        {prop.avgRating > 0 && (
                          <div className="position-absolute bottom-0 end-0 m-3 bg-white px-2 py-1 rounded shadow-sm d-flex align-items-center">
                            <i className="material-icons text-warning fs-18">star</i>
                            <span className="ms-1 fw-bold">{prop.avgRating.toFixed(1)}</span>
                            <span className="ms-1 text-muted fs-12">({prop.reviewCount || 0})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="banner-card">
                    <div className="me-3 card-img">
                      <Link to="/buy-property-grid">
                        <img src="/assets/img/home-3/banner-01.png" className="rounded" alt="" />
                      </Link>
                    </div>
                    <div>
                      <h6 className="text-white">
                        <Link to="/buy-property-grid" className="text-white">Beautiful Condo Room</Link>
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
                )}
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
                      <form action="/buy-property-grid">
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
                      <form action="/rent-property-grid">
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
                      <form action="/buy-property-grid">
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

      {/* Featured Property Section Start */}
      {featuredProperties.length > 0 && (
        <section className="property-section" style={{ padding: '80px 0', background: '#f8f9fa' }}>
          <div className="container">
            <div className="section-heading-three">
              <div className="sec-line-three">
                <span className="sec-line1"></span>
                <span className="sec-line2"></span>
              </div>
              <h2>Featured Properties</h2>
              <p>Hand-picked locations highlight our strongest presence, and highest customer satisfaction.</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row gy-4 justify-content-center">
                {featuredProperties.map((property) => (
                  <div key={property._id} className="col-lg-4 col-md-6" data-aos="fade-up">
                    <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                      <div className="position-relative">
                        <Link to={property.listingType === 'FOR_RENT' ? `/rent-details/${property._id}` : `/buy-details/${property._id}`}>
                          <img
                            src={property.images && property.images.length > 0 ? getImageUrl(property.images[0]) : '/assets/img/home-3/banner-01.png'}
                            className="card-img-top"
                            alt={property.title}
                            style={{ height: '240px', objectFit: 'cover' }}
                          />
                        </Link>
                        <div className="position-absolute top-0 start-0 m-3">
                          <span className={`badge ${property.listingType === 'FOR_RENT' ? 'bg-info' : 'bg-success'}`}>
                            {property.listingType === 'FOR_RENT' ? 'For Rent' : 'For Sale'}
                          </span>
                        </div>
                        {property.avgRating > 0 && (
                          <div className="position-absolute bottom-0 end-0 m-3 bg-white px-2 py-1 rounded shadow-sm d-flex align-items-center">
                            <i className="material-icons text-warning fs-18">star</i>
                            <span className="ms-1 fw-bold">{property.avgRating.toFixed(1)}</span>
                            <span className="ms-1 text-muted fs-12">({property.reviewCount})</span>
                          </div>
                        )}
                      </div>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-primary fw-bold fs-18">${property.price.toLocaleString()} {property.listingType === 'FOR_RENT' ? '/ mo' : ''}</span>
                          <span className="text-muted fs-12">{property.type}</span>
                        </div>
                        <h5 className="card-title mb-3">
                          <Link to={property.listingType === 'FOR_RENT' ? `/rent-details/${property._id}` : `/buy-details/${property._id}`} className="text-dark text-decoration-none">
                            {property.title}
                          </Link>
                        </h5>
                        <p className="text-muted fs-14 mb-3 d-flex align-items-center">
                          <i className="material-icons-outlined fs-16 me-1">location_on</i>
                          {property.city}, {property.country}
                        </p>
                        <div className="d-flex gap-3 border-top pt-3 mt-auto">
                          <div className="d-flex align-items-center text-muted fs-14">
                            <i className="material-icons-outlined fs-18 me-1 text-secondary">bed</i>
                            {property.rooms || 0} Bed
                          </div>
                          <div className="d-flex align-items-center text-muted fs-14">
                            <i className="material-icons-outlined fs-18 me-1 text-secondary">bathtub</i>
                            {property.bathrooms || 0} Bath
                          </div>
                          <div className="d-flex align-items-center text-muted fs-14">
                            <i className="material-icons-outlined fs-18 me-1 text-secondary">square_foot</i>
                            {property.surface || 0} m²
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-5">
              <Link to="/buy-property-grid" className="btn btn-primary d-inline-flex align-items-center py-2 px-4">
                View All Properties <i className="material-icons-outlined ms-2">east</i>
              </Link>
            </div>
          </div>
        </section>
      )}
      {/* Featured Property Section End */}

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
            <h2>Recommended Locations</h2>
            <p>Discover our top service areas, where quality meets convenience.</p>
          </div>

          {locationsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row gy-4 justify-content-center">
              {locations.map((location, index) => (
                <div key={index} className={`col-lg-4 ${index >= 3 ? 'col-lg-6' : ''}`} data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
                  <div className="location-item">
                    <div className="location-img">
                      <Link to={`/buy-property-grid?city=${location.name}`}>
                        <img src="/assets/img/home-3/location/location-01.jpg" alt={location.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                      </Link>
                      <div className="bottom-text">
                        <div className="location-name">
                          <h5>{location.name}</h5>
                          <p>{location.count} Properties</p>
                        </div>
                        <div className="arrow-overlay">
                          <Link to={`/buy-property-grid?city=${location.name}`}><i className="material-icons-outlined">north_east</i></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-4 pt-3">
            <Link to="/buy-property-grid" className="btn btn-dark btn-lg d-inline-flex align-items-center">
              View More Locations<i className="material-icons-outlined ms-1">north_east</i>
            </Link>
          </div>
        </div>
      </section>
      {/* Property Section End */}


    </div>
  );
};

export default Home;
