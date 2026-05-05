import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProperties, getImageUrl, getFeedbackSummaryByPropertyIds } from '../services/propertyService';
import PropertyListPagination from '../components/PropertyListPagination';
import LocalizedLink from '../components/LocalizedLink';
import '../styles/rentalMatch.css';

const GRID_PAGE_SIZE = 12;

const formatPriceTND = (value) => {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return 'N/A';
    return `${numberValue.toLocaleString('en-US').replace(/,/g, ' ')} TND`;
};

const filterRentProperties = (list) =>
  (list || []).filter((p) => {
    const tx = p.latestRentTransaction;
    if (!tx) return p.status === 'AVAILABLE';
    return (
            tx.status === 'CANCELLED' ||
      tx.status === 'PENDING' ||
      tx.status === 'CONFIRMED' ||
      tx.status === 'COMPLETED'
    );
  });

const RentPropertyGrid = () => {
    const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingMap, setRatingMap] = useState({});
    const sortByValue = searchParams.get('sortBy') || 'default';
    const priceOrderValue = searchParams.get('priceOrder') || 'default';

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString();
  };

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const goToPage = useCallback(
    (page) => {
      const p = Math.max(1, Math.min(page, totalPages));
      const next = new URLSearchParams(searchParams);
      if (p <= 1) next.delete('page');
      else next.set('page', String(p));
      setSearchParams(next, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams, totalPages]
  );

    const updateFilterParam = useCallback(
        (name, value) => {
            const next = new URLSearchParams(searchParams);
            if (!value || value === 'default') next.delete(name);
            else next.set(name, value);
            next.delete('page');
            setSearchParams(next, { replace: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        [searchParams, setSearchParams]
    );

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          listingType: 'FOR_RENT',
          page: currentPage,
          limit: GRID_PAGE_SIZE,
        };

        if (searchParams.get('type')) filters.type = searchParams.get('type');
        if (searchParams.get('city')) filters.city = searchParams.get('city');
        if (searchParams.get('minPrice')) filters.minPrice = searchParams.get('minPrice');
        if (searchParams.get('maxPrice')) filters.maxPrice = searchParams.get('maxPrice');
        if (searchParams.get('rooms')) filters.rooms = searchParams.get('rooms');
        if (searchParams.get('bathrooms')) filters.bathrooms = searchParams.get('bathrooms');
        if (searchParams.get('minSurface')) filters.minSurface = searchParams.get('minSurface');

                const sortBy = searchParams.get('sortBy') || 'default';
                const priceOrder = searchParams.get('priceOrder') || 'default';
                if (priceOrder === 'low-high') {
                    filters.sortBy = 'price';
                    filters.sortOrder = 'asc';
                } else if (priceOrder === 'high-low') {
                    filters.sortBy = 'price';
                    filters.sortOrder = 'desc';
                } else if (sortBy === 'a-z') {
                    filters.sortBy = 'title';
                    filters.sortOrder = 'asc';
                }

        const data = await getProperties(filters);
        const tp = Math.max(1, Number(data.totalPages) || 1);
        if (currentPage > tp) {
          const next = new URLSearchParams(searchParams);
          if (tp <= 1) next.delete('page');
          else next.set('page', String(tp));
          setSearchParams(next, { replace: true });
          setLoading(false);
          return;
        }

        const raw = data.properties || [];
        const nextProperties = filterRentProperties(raw);
        setProperties(nextProperties);
        setTotalResults(data.total || 0);
        setTotalPages(tp);
        const summary = await getFeedbackSummaryByPropertyIds(raw.map((p) => p._id));
        setRatingMap(summary);
      } catch (err) {
        console.error('Error fetching properties:', err);
                setError(t('propertyPages.fetchError'));
        setProperties([]);
        setTotalResults(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    }, [currentPage, searchParams, setSearchParams, t]);

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

  const rangeStart =
    totalResults === 0 || properties.length === 0 ? 0 : (currentPage - 1) * GRID_PAGE_SIZE + 1;
  const rangeEnd =
    totalResults === 0 || properties.length === 0 ? 0 : (currentPage - 1) * GRID_PAGE_SIZE + properties.length;

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
                        <h1 className="breadcrumb-title">{t('propertyPages.rentGridTitle')}</h1>
                        <nav aria-label="breadcrumb" className="page-breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><LocalizedLink to="/"><span><i className="material-icons-outlined me-1">home</i></span>{t('common.home')}</LocalizedLink></li>
                                <li className="breadcrumb-item active" aria-current="page">{t('propertyPages.rentGridTitle')}</li>
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
                                        {loading ? (
                                            <span className="text-muted">{t('propertyPages.loadingShort')}</span>
                                        ) : totalResults === 0 ? (
                                            <span className="text-muted">{t('propertyPages.noListings')}</span>
                                        ) : properties.length === 0 ? (
                                            <span className="text-muted">
                                                {t('propertyPages.zeroOnPageTotal', { total: totalResults })}
                                            </span>
                                        ) : (
                                            <>
                                                {t('propertyPages.showing')}{' '}
                                                <span className="result-value">
                                                    {rangeStart}
                                                    {rangeEnd !== rangeStart ? `–${rangeEnd}` : ''}
                                                </span>{' '}{t('propertyPages.of')} <span className="result-value">{totalResults}</span>
                                            </>
                                        )}
                                    </p>
                                </div> 

                                <div className="col-lg-9">
                                    <div className="d-flex align-items-center gap-3 flex-wrap justify-content-lg-end flex-lg-row flex-md-row flex-column">
                                        <Link
                                            to={`/rental-match${searchParams.get('city') ? `?city=${encodeURIComponent(searchParams.get('city'))}` : ''}`}
                                            className="btn btn-dark d-inline-flex align-items-center"
                                            style={{ borderRadius: 999, padding: '10px 16px' }}
                                        >
                                            <i className="material-icons-outlined me-2">auto_awesome</i>
                                            {t('propertyPages.rentalMatchCta', { defaultValue: 'Rental Match' })}
                                        </Link>
                                        <div className="result-list d-flex d-block flex-lg-row flex-md-row flex-column align-items-center gap-2">
                                            <h5>{t('propertyPages.sortBy')}</h5>
                                            <div className="result-select">
                                                <select
                                                    className="select"
                                                    value={sortByValue}
                                                    onChange={(e) => updateFilterParam('sortBy', e.target.value)}
                                                >
                                                    <option value="default">{t('propertyPages.defaultSort')}</option>
                                                    <option value="a-z" >A-Z</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="result-list d-flex flex-lg-row flex-md-row flex-column align-items-center gap-2">
                                            <h5>{t('propertyPages.priceRange')}</h5>
                                            <div className="result-select">
                                                <select
                                                    className="select"
                                                    value={priceOrderValue}
                                                    onChange={(e) => updateFilterParam('priceOrder', e.target.value)}
                                                >
                                                    <option value="default">{t('propertyPages.defaultSort')}</option>
                                                    <option value="low-high">{t('propertyPages.lowToHigh')}</option>
                                                    <option value="high-low">{t('propertyPages.highToLow')}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <ul className="grid-list-view d-flex align-items-center justify-content-center">
                                            <li><LocalizedLink to="/rent-property-list"  className="list-icon "><i className="material-icons">list</i></LocalizedLink></li>
                                            <li><LocalizedLink to="/rent-property-grid" className="list-icon active"><i className="material-icons">grid_view</i></LocalizedLink></li>
                                            <li><LocalizedLink to="/rent-grid-map" className="list-icon"><i className="material-icons-outlined">location_on</i></LocalizedLink></li>
                                        </ul>
                                    </div>
                                </div> 
                            </div>
                            

                        </div>
                    </div> 

                    {/* AI Match Banner */}
                    <div className="ai-match-banner mb-4">
                        <div className="ai-match-banner-content">
                            <h3><i className="material-icons-outlined me-2">auto_awesome</i> {t('propertyPages.tryRentalMatch', { defaultValue: 'Try our Rental Match Engine' })}</h3>
                            <p>{t('propertyPages.tryRentalMatchDesc', { defaultValue: 'Tell us your needs and verify your credit score. We will instantly find and rank the best rental properties for you.' })}</p>
                        </div>
                        <div className="ai-match-banner-action">
                            <Link to={`/rental-match${searchParams.get('city') ? `?city=${encodeURIComponent(searchParams.get('city'))}` : ''}`} className="ai-match-btn">
                                {t('propertyPages.startMatching', { defaultValue: 'Start Matching' })}
                            </Link>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">{t('common.loading')}</span>
                            </div>
                            <p className="mt-3">{t('propertyPages.loadingProperties')}</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="material-icons-outlined me-2">error</i>
                            {error}
                        </div>
                    )}

                    {!loading && !error && properties.length === 0 && totalResults === 0 && (
                        <div className="text-center py-5">
                            <i className="material-icons-outlined" style={{ fontSize: '48px', color: '#ccc' }}>search_off</i>
                            <h5 className="mt-3">{t('propertyPages.noPropertiesFound')}</h5>
                            <p className="text-muted">{t('propertyPages.tryAdjustingFilters')}</p>
                        </div>
                    )}

                    {!loading && !error && properties.length === 0 && totalResults > 0 && (
                        <div className="text-center py-4">
                            <p className="text-muted mb-0">{t('propertyPages.noListingsOnPage')}</p>
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
                                                <LocalizedLink to={`/rent-details/${property._id}`}>
                                                    <img 
                                                        className="img-fluid" 
                                                        src={getImageUrl(property.images?.[0]) || '/assets/img/buy/buy-grid-img-01.jpg'} 
                                                        alt={property.title || t('propertyPages.propertyFallback')}
                                                        style={{ height: '250px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.src = '/assets/img/buy/buy-grid-img-01.jpg'; }}
                                                    />
                                                </LocalizedLink>
                                                <div className="d-flex align-items-center justify-content-between position-absolute top-0 start-0 end-0 p-3 z-1">
                                                    <div className="d-flex align-items-center gap-2">
                                                        {property.latestRentTransaction?.status === 'CONFIRMED' && property.latestRentTransaction?.endDate && (
                                                            <div className="badge badge-sm bg-warning text-dark d-flex align-items-center">
                                                                {t('propertyPages.rentedTill', { date: formatDate(property.latestRentTransaction.endDate) })}
                                                            </div>
                                                        )}
                                                        {property.latestRentTransaction?.status === 'PENDING' && (
                                                            <div className="badge badge-sm bg-info text-dark d-flex align-items-center">
                                                                {t('propertyPages.reservedPending')}
                                                            </div>
                                                        )}
                                                        {!property.latestRentTransaction && property.status === 'AVAILABLE' && (
                                                            <div className="badge badge-sm bg-danger d-flex align-items-center">
                                                                <i className="material-icons-outlined">offline_bolt</i>{t('propertyPages.newLabel')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <a href="javascript:void(0)" className="favourite">
                                                        <i className="material-icons-outlined">favorite_border</i>
                                                    </a>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between position-absolute bottom-0 end-0 start-0 p-3 z-1">
                                                    <h6 className="text-white mb-0">
                                                        {formatPriceTND(property.price)} 
                                                        <span className="text-white mb-0"> / {property.rentalPeriod || t('propertyPages.month')} </span>
                                                    </h6>
                                                    <div className="user-avatar avatar avatar-md border rounded-circle">
                                                        <img src="/assets/img/users/user-18.jpg" alt={t('propertyPages.userAlt')} className="rounded-circle" />
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
                                                            {ratingMap?.[property._id]?.averageRating || t('propertyPages.newLabel')}
                                                            {ratingMap?.[property._id]?.totalReviews
                                                                ? ` (${ratingMap[property._id].totalReviews})`
                                                                : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div>
                                                        <h6 className="title mb-1">
                                                            <LocalizedLink to={`/rent-details/${property._id}`}>
                                                                {property.title || property.description?.substring(0, 50) || t('propertyPages.propertyForRent')}
                                                            </LocalizedLink>
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
                                                        {property.rooms || 0} {t('propertyPages.bedroom')}
                                                    </li>
                                                    <li className="d-flex align-items-center gap-1">
                                                        <i className="material-icons-outlined bg-white text-secondary">bathtub</i>
                                                        {property.bathrooms || 0} {t('propertyPages.bath')}
                                                    </li>
                                                    <li className="d-flex align-items-center gap-1">
                                                        <i className="material-icons-outlined bg-white text-secondary">straighten</i>
                                                        {property.surface || t('propertyPages.notAvailable')} {t('propertyPages.sqFt')}
                                                    </li>
                                                </ul>
                                                <div className="d-flex align-items-center justify-content-between flex-wrap flex-wrap gap-1">
                                                    <p className="fs-14 fw-medium text-dark mb-0">
                                                        {t('propertyPages.categoryLabel')} : <span className="fw-medium text-body">{property.type || t('propertyPages.propertyFallback')}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!loading && !error && totalPages > 1 && (
                        <PropertyListPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                            disabled={loading}
                        />
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

		

        

		

		
		<div className="modal fade" id="search-modal" tabIndex="-1" aria-hidden="true">
			<div className="modal-dialog  modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-body search-wrap">
						<form className="search-form" id="search-form" action="rent-property-grid.html">
							<div className="d-flex align-items-center justify-content-between mb-4">
                                <h5>{t('propertyPages.whatLookingFor')}</h5>
								<a href="#" className="close" data-bs-dismiss="modal"><i className="material-icons-outlined">close</i></a>
							</div>
							<div className="input-group input-group-flat">
                                <input type="text" className="form-control" placeholder={t('propertyPages.typeKeywordPlaceholder')} />
								<span className="input-group-text">
									<i className="material-icons-outlined">search</i>
								</span>
							</div>
                            <h6>{t('propertyPages.popularProperties')}</h6>
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



