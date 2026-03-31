import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getProperties, getImageUrl, getFeedbackSummaryByPropertyIds } from '../services/propertyService';

const RentPropertyGrid = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [ratingMap, setRatingMap] = useState({});

    const formatDate = (value) => {
        if (!value) return null;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString();
    };

  // Fetch properties based on URL parameters
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Parse URL search parameters
        const searchParams = new URLSearchParams(location.search);
        
                // Build filters object - ALWAYS use FOR_RENT for this page
                const filters = {
                    listingType: 'FOR_RENT',
                };

        // Add optional filters from URL (ignore listingType from URL)
        if (searchParams.get('type')) filters.type = searchParams.get('type');
        if (searchParams.get('city')) filters.city = searchParams.get('city');
        if (searchParams.get('minPrice')) filters.minPrice = searchParams.get('minPrice');
        if (searchParams.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice');
        if (searchParams.get('rooms')) filters.rooms = searchParams.get('rooms');
        if (searchParams.get('bathrooms')) filters.bathrooms = searchParams.get('bathrooms');
        if (searchParams.get('minSurface')) filters.minSurface = searchParams.get('minSurface');

        console.log('🏠 RentPropertyGrid - Fetching with filters:', filters);
                const data = await getProperties(filters);
                console.log('✅ RentPropertyGrid - Received properties:', data.properties?.length, 'properties');


                                // Use transaction status for rental logic
                                const filteredProperties = (data.properties || []).filter((p) => {
                                    const tx = p.latestRentTransaction;
                                    if (!tx) return p.status === 'AVAILABLE'; // fallback
                                    // Show if transaction is PENDING, CONFIRMED, or COMPLETED (if you want to show rental history)
                                    return (
                                        tx.status === 'PENDING' ||
                                        tx.status === 'CONFIRMED' ||
                                        tx.status === 'COMPLETED'
                                    );
                                });

                // Log first property's image data for debugging
                if (filteredProperties.length > 0) {
                    console.log('📸 First property image data:', filteredProperties[0].images);
                }

                const nextProperties = filteredProperties;
                setProperties(nextProperties);
                setTotalResults(data.total || nextProperties.length);
                const summary = await getFeedbackSummaryByPropertyIds(nextProperties.map((p) => p._id));
                setRatingMap(summary);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [location.search]);

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
                        <h1 className="breadcrumb-title">Rent Grid</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Rent Grid</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content">
                <div className="container">

                    <div className="card border-0 search-item mb-4">
                        <div className="card-body">

                            
                            <div className="row align-items-center">
                                <div className="col-lg-3">
                                    <p className="mb-4 mb-lg-0 mb-md-3 text-lg-start text-md-start  text-center">
                                        Showing result <span className="result-value"> {properties.length}</span> of
                                        <span className="result-value"> {totalResults}</span>
                                    </p>
                                </div> 

                                <div className="col-lg-9">
                                    <div className="d-flex align-items-center gap-3 flex-wrap justify-content-lg-end flex-lg-row flex-md-row flex-column">
                                        <div className="result-list d-flex d-block flex-lg-row flex-md-row flex-column align-items-center gap-2">
                                            <h5>Sort By</h5>
                                            <div className="result-select">
                                                <select className="select">
                                                    <option value="0">Default</option>
                                                    <option value="1" >A-Z</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="result-list d-flex flex-lg-row flex-md-row flex-column align-items-center gap-2">
                                            <h5>Price Range</h5>
                                            <div className="result-select">
                                                <select className="select">
                                                    <option>Low to High</option>
                                                    <option>High to Low</option>
                                                </select>
                                            </div>
                                        </div>
                                        <ul className="grid-list-view d-flex align-items-center justify-content-center">
                                            <li><Link to="/rent-property-list"  className="list-icon "><i className="material-icons">list</i></Link></li>
                                            <li><Link to="/rent-property-grid" className="list-icon active"><i className="material-icons">grid_view</i></Link></li>
                                            <li><Link to="/rent-grid-map" className="list-icon"><i className="material-icons-outlined">location_on</i></Link></li>
                                        </ul>
                                    </div>
                                </div> 
                            </div>
                            

                        </div>
                    </div> 

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading properties...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="material-icons-outlined me-2">error</i>
                            {error}
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && !error && properties.length === 0 && (
                        <div className="text-center py-5">
                            <i className="material-icons-outlined" style={{ fontSize: '48px', color: '#ccc' }}>search_off</i>
                            <h5 className="mt-3">No properties found</h5>
                            <p className="text-muted">Try adjusting your search filters</p>
                        </div>
                    )}

                    {/* Properties Grid */}
                    {!loading && !error && properties.length > 0 && (
                        <div className="row mb-4">
                            {properties.map((property) => (
                                <div key={property._id} className="col-xl-4 col-lg-6 col-md-6 d-flex">
                                    <div className="property-card mb-lg-0 flex-fill">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to={`/rent-details/${property._id}`}>
                                                    <img 
                                                        className="img-fluid" 
                                                        src={getImageUrl(property.images?.[0]) || '/assets/img/buy/buy-grid-img-01.jpg'} 
                                                        alt={property.title || 'Property'}
                                                        style={{ height: '250px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.src = '/assets/img/buy/buy-grid-img-01.jpg'; }}
                                                    />
                                                </Link>
                                                {/* Transaction status banners */}
                                                {property.latestRentTransaction && property.latestRentTransaction.status === 'CONFIRMED' && property.latestRentTransaction.endDate && (
                                                    <div className="position-absolute top-0 start-0 m-3">
                                                        <span className="badge bg-warning text-dark fw-semibold">
                                                            Rented till {formatDate(property.latestRentTransaction.endDate)}
                                                        </span>
                                                    </div>
                                                )}
                                                {property.latestRentTransaction && property.latestRentTransaction.status === 'PENDING' && (
                                                    <div className="position-absolute top-0 start-0 m-3">
                                                        <span className="badge bg-info text-dark fw-semibold">
                                                            Reserved / Pending
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                                    <h6 className="text-white mb-0">
                                                        ${property.price?.toLocaleString() || 'N/A'} 
                                                        <span className="fs-14 fw-normal"> / {property.rentalPeriod || 'Month'} </span>
                                                    </h6>
                                                    <a href="javascript:void(0)" className="favourite">
                                                        <i className="material-icons-outlined">favorite_border</i>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="buy-grid-content">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        {[...Array(5)].map((_, i) => {
                                                            const avg = Number(ratingMap?.[property._id]?.averageRating || 0);
                                                            const filled = i < Math.round(avg);
                                                            return (
                                                                <i key={i} className={`material-icons${filled ? '' : '-outlined'} text-warning`}>star</i>
                                                            );
                                                        })}
                                                        <span className="ms-1 fs-14">
                                                            {ratingMap?.[property._id]?.averageRating || 'New'}
                                                            {ratingMap?.[property._id]?.totalReviews
                                                                ? ` (${ratingMap[property._id].totalReviews})`
                                                                : ''}
                                                        </span>
                                                    </div>
                                                    <span className="badge bg-secondary">{property.type || 'Property'}</span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div>
                                                        <h6 className="title mb-1">
                                                            <Link to={`/rent-details/${property._id}`}>
                                                                {property.title || property.description?.substring(0, 50) || 'Property for Rent'}
                                                            </Link>
                                                        </h6>
                                                        <p className="d-flex align-items-center fs-14 mb-0">
                                                            <i className="material-icons-outlined me-1 ms-0">location_on</i>
                                                            {property.address || `${property.city || ''}, ${property.region || ''}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                                    <li className="d-flex align-items-center gap-1">
                                                        <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                        {property.rooms || 0} Bedroom
                                                    </li>
                                                    <li className="d-flex align-items-center gap-1">
                                                        <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                        {property.bathrooms || 0} Bath
                                                    </li>
                                                    <li className="d-flex align-items-center gap-1">
                                                        <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                        {property.surface || 'N/A'} Sq Ft
                                                    </li>
                                                </ul>
                                                <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="avatar avatar-lg user-avatar">
                                                            <img src="/assets/img/users/user-18.jpg" alt="" className="rounded-circle" />
                                                        </div>
                                                        <a href="#" className="mb-0 fs-16 fw-medium text-dark">
                                                            Owner
                                                            <span className="d-block fs-14 text-body pt-1">{property.city || 'Tunisia'}</span>
                                                        </a>
                                                    </div>
                                                    <Link to={`/rent-details/${property._id}`} className="btn btn-dark">View Details</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Load More Button - Only show if there are results */}
                    {!loading && !error && properties.length > 0 && (
                        <div className="text-center">
                            <a href="javascript:void(0)" className="btn btn-dark d-inline-flex align-items-center">
                                <i className="material-icons-outlined me-1">autorenew</i>Load More
                            </a>
                        </div>
                    )}

                    
                    <div className="row mb-4" style={{ display: 'none' }}>

                    

                        
                        <div className="col-xl-4 col-lg-6 col-md-6 d-flex">
                            <div className="property-card mb-lg-0 flex-fill">
                                <div className="property-listing-item p-0 mb-0 shadow-none">
                                    <div className="buy-grid-img mb-0 rounded-0">
                                        <Link to="/rent-details">
                                            <img className="img-fluid" src="/assets/img/rent/rent-grid-img-09.jpg" alt="" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                            <h6 className="text-white mb-0">$1350 <span className="fs-14 fw-normal"> / Night </span></h6>
                                            <a href="javascript:void(0)" className="favourite">
                                                <i className="material-icons-outlined">favorite_border</i>
                                            </a>
                                        </div>
                                    </div> 
                                    <div className="buy-grid-content">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <i className="material-icons-outlined text-warning">star</i>
                                                <span className="ms-1 fs-14">Excellent</span>
                                            </div>
                                            <span className="badge bg-secondary"> Villa</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div>
                                                <h6 className="title mb-1">
                                                    <Link to="/rent-details">Sunny Side Residences</Link> 
                                                </h6>
                                                <p className="d-flex align-items-center fs-14 mb-0"><i className="material-icons-outlined me-1 ms-0">location_on</i>221, Maple Grove Residences, Austin, US</p>
                                            </div>
                                        </div>
                                        <ul className="d-flex buy-grid-details d-flex mb-3 bg-light rounded p-3 justify-content-between align-items-center flex-wrap gap-1">
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bed</i>
                                                4 Bedroom
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                2 Bath
                                            </li>
                                            <li className="d-flex align-items-center gap-1">
                                                <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                680 Sq Ft
                                            </li>
                                        </ul>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top border-light-100 pt-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar avatar-lg user-avatar">
                                                    <img src="/assets/img/users/user-18.jpg" alt="" className="rounded-circle" />
                                                </div>
                                                <a href="#" className="mb-0 fs-16 fw-medium text-dark">Aiden Sinclair<span className="d-block fs-14 text-body pt-1">United States</span> </a>
                                            </div>
                                            <Link to="/rent-details" className="btn btn-dark">Book Now</Link>
                                        </div>
                                    </div>
                                </div> 
                            </div> 
                        </div> 

                    </div>
                    

                    {/* <div className="text-center" style={{ display: 'none' }}>
                        <a href="javascript:void(0)" className="btn btn-dark d-inline-flex align-items-center"><i className="material-icons-outlined me-1">autorenew</i>Load More </a>
                    </div> */}

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

export default RentPropertyGrid;



