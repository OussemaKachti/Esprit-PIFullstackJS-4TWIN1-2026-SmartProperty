import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getProperties, getImageUrl, getFeedbackSummaryByPropertyIds } from '../services/propertyService';

const formatPriceTND = (value) => {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return 'N/A';
    return `${numberValue.toLocaleString('en-US').replace(/,/g, ' ')} TND`;
};

const BuyPropertyGrid = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [ratingMap, setRatingMap] = useState({});

  // Fetch properties based on URL parameters
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Parse URL search parameters
        const searchParams = new URLSearchParams(location.search);
        
        // Build filters object - ALWAYS use FOR_SALE for this page
        const filters = {
                    listingType: 'FOR_SALE',
                    status: 'AVAILABLE'
        };

        // Add optional filters from URL (ignore listingType from URL)
        if (searchParams.get('type')) filters.type = searchParams.get('type');
        if (searchParams.get('city')) filters.city = searchParams.get('city');
        if (searchParams.get('minPrice')) filters.minPrice = searchParams.get('minPrice');
        if (searchParams.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice');
        if (searchParams.get('rooms')) filters.rooms = searchParams.get('rooms');
        if (searchParams.get('bathrooms')) filters.bathrooms = searchParams.get('bathrooms');
        if (searchParams.get('minSurface')) filters.minSurface = searchParams.get('minSurface');

        console.log('🏡 BuyPropertyGrid - Fetching with filters:', filters);
        const data = await getProperties(filters);
        console.log('✅ BuyPropertyGrid - Received properties:', data.properties?.length, 'properties');
        
        // Log first property's image data for debugging
        if (data.properties?.length > 0) {
          console.log('📸 First property image data:', data.properties[0].images);
        }
        
        const nextProperties = data.properties || [];
        setProperties(nextProperties);
        setTotalResults(data.total || 0);
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
                        <h1 className="breadcrumb-title">Buy Grid</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Buy Grid</li>
                            </ol>
                        </nav>							
                    </div>
                </div>
            </div>
            

			
            <div className="content overflow-hidden">
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
                                            <li><Link to="/buy-property-list"  className="list-icon "><i className="material-icons">list</i></Link></li>
                                            <li><Link to="/buy-property-grid" className="list-icon active"><i className="material-icons">grid_view</i></Link></li>
                                            <li><Link to="/buy-grid-map" className="list-icon"><i className="material-icons-outlined">location_on</i></Link></li>
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
                                    <div className="property-card flex-fill">
                                        <div className="property-listing-item p-0 mb-0 shadow-none">
                                            <div className="buy-grid-img mb-0 rounded-0">
                                                <Link to={`/buy-details/${property._id}`}>
                                                    <img 
                                                        className="img-fluid" 
                                                        src={getImageUrl(property.images?.[0]) || '/assets/img/buy/buy-grid-img-01.jpg'} 
                                                        alt={property.title || 'Property'}
                                                        style={{ height: '250px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.src = '/assets/img/buy/buy-grid-img-01.jpg'; }}
                                                    />
                                                </Link>
                                                <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3 z-1">
                                                    <div className="d-flex align-items-center gap-2">
                                                        {property.status === 'AVAILABLE' && (
                                                            <div className="badge badge-sm bg-danger d-flex align-items-center">
                                                                <i className="material-icons-outlined">offline_bolt</i>New
                                                            </div>
                                                        )}
                                                    </div>
                                                    <a href="javascript:void(0)" className="favourite">
                                                        <i className="material-icons-outlined">favorite_border</i>
                                                    </a>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                                    <h6 className="text-white mb-0">{formatPriceTND(property.price)}</h6>
                                                    <div className="user-avatar avatar avatar-md border rounded-circle">
                                                        <img src="/assets/img/users/user-01.jpg" alt="User" className="rounded-circle" />
                                                    </div>
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
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div>
                                                        <h6 className="title mb-1">
                                                            <Link to={`/buy-details/${property._id}`}>
                                                                {property.title || property.description?.substring(0, 50) || 'Property for Sale'}
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap flex-wrap gap-1">
                                                    <p className="fs-14 fw-medium text-dark mb-0">
                                                        Category : <span className="fw-medium text-body">{property.type || 'Property'}</span>
                                                    </p>
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

export default BuyPropertyGrid;



