import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocalizedLink from '../../components/LocalizedLink';
import { getUserData, canListPropertyFromHomepage } from '../../utils/auth';
import { localizeRoute } from '../../routes/routeConfig';
import { getFeaturedProperties, getImageUrl } from '../../services/propertyService';
import './index3-banner.css';

const Index3 = () => {
	const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [listingUser, setListingUser] = useState(() => getUserData());

  useEffect(() => {
    setListingUser(getUserData());
  }, [location.pathname]);

  const [buyFilters, setBuyFilters] = useState({
    type: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  const [rentFilters, setRentFilters] = useState({
    type: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleBuyChange = (field, value) => {
    setBuyFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRentChange = (field, value) => {
    setRentFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleBuySearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (buyFilters.type) params.append('type', buyFilters.type);
    if (buyFilters.location) params.append('city', buyFilters.location);
    if (buyFilters.minPrice) params.append('minPrice', buyFilters.minPrice);
    if (buyFilters.maxPrice) params.append('maxPrice', buyFilters.maxPrice);
    params.append('listingType', 'FOR_SALE');

		const localizedPath = localizeRoute('/buy-property-grid', i18n.language);
		navigate(`${localizedPath}?${params.toString()}`);
  };

  const handleRentSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (rentFilters.type) params.append('type', rentFilters.type);
    if (rentFilters.location) params.append('city', rentFilters.location);
    if (rentFilters.minPrice) params.append('minPrice', rentFilters.minPrice);
    if (rentFilters.maxPrice) params.append('maxPrice', rentFilters.maxPrice);
    params.append('listingType', 'FOR_RENT');

		const localizedPath = localizeRoute('/rent-property-grid', i18n.language);
		navigate(`${localizedPath}?${params.toString()}`);
  };

  useEffect(() => {
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

    const initializePlugins = () => {
      enableScrolling();

      if (window.AOS) {
        window.AOS.refresh();
        window.AOS.init({
          duration: 1200,
          once: true,
        });
      }

      if (window.jQuery && window.jQuery.fn.select2) {
        window.jQuery('.select2').select2({
          minimumResultsForSearch: -1,
        });
      }

      if (window.Swiper) {
        new window.Swiper('.partner-slider', {
          slidesPerView: 6,
          spaceBetween: 30,
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          breakpoints: {
            320: { slidesPerView: 2 },
            576: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            992: { slidesPerView: 5 },
            1200: { slidesPerView: 6 },
          },
        });
      }

      if (window.jQuery && window.jQuery.fn.counterUp) {
        window.jQuery('.counter').counterUp({
          delay: 10,
          time: 1000
        });
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

    const scrollCheckTimer = setTimeout(enableScrolling, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(scrollCheckTimer);
    };
  }, []);

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    getFeaturedProperties(4)
      .then(data => setFeaturedProperties(data || []))
      .catch(err => console.error('Error fetching featured properties:', err))
      .finally(() => setFeaturedLoading(false));
  }, []);

  const PROPERTY_TYPES = [
    { value: 'APARTMENT', labelKey: 'search.typeApartment' },
    { value: 'HOUSE', labelKey: 'search.typeHouse' },
    { value: 'VILLA', labelKey: 'search.typeVilla' },
    { value: 'STUDIO', labelKey: 'search.typeStudio' },
    { value: 'LAND', labelKey: 'search.typeLand' },
    { value: 'COMMERCIAL', labelKey: 'search.typeCommercial' },
    { value: 'OFFICE', labelKey: 'search.typeOffice' },
    { value: 'OTHER', labelKey: 'search.typeOther' },
  ];

  const TUNISIAN_CITIES = [
    { value: 'Tunis', labelKey: 'propertySection.location1' },
    { value: 'Sousse', labelKey: 'propertySection.location2' },
    { value: 'Sfax', labelKey: 'propertySection.location3' },
    { value: 'Nabeul', labelKey: 'propertySection.location4' },
    { value: 'Hammamet', labelKey: 'propertySection.location5' },
    { value: 'Monastir', labelKey: 'propertySection.location6' },
    { value: 'Bizerte', labelKey: 'propertySection.location7' },
    { value: 'Gabès', labelKey: 'propertySection.location8' },
    { value: 'La Marsa', labelKey: 'propertySection.location9' },
    { value: 'Carthage', labelKey: 'propertySection.location10' },
  ];

  const renderSearchForm = (isBuy) => {
    const filters = isBuy ? buyFilters : rentFilters;
    const handleChange = isBuy ? handleBuyChange : handleRentChange;
    const onSubmit = isBuy ? handleBuySearch : handleRentSearch;
    return (
      <form onSubmit={onSubmit} className="index3-search-form">
        <div className="row g-3 align-items-end">
          <div className="col-md-6 col-lg-3">
            <label className="form-label">{t('search.typeRental')}</label>
            <select
              className="form-control form-select"
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="">{t('search.typePlaceholder')}</option>
              {PROPERTY_TYPES.map(({ value, labelKey }) => (
                <option key={value} value={value}>{t(labelKey)}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6 col-lg-3">
            <label className="form-label">{t('search.location')}</label>
            <select
              className="form-control form-select"
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
            >
              <option value="">{t('search.locationPlaceholder')}</option>
              {TUNISIAN_CITIES.map(({ value, labelKey }) => (
                <option key={value} value={value}>{t(labelKey)}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label">{t('search.minPrice')}</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                placeholder="0"
                min="0"
                value={filters.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
              />
              <span className="input-group-text index3-currency">{t('search.currency')}</span>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label">{t('search.maxPrice')}</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                placeholder="—"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
              />
              <span className="input-group-text index3-currency">{t('search.currency')}</span>
            </div>
          </div>
          <div className="col-12 col-md-4 col-lg-2">
            <button type="submit" className="btn btn-primary w-100 index3-search-btn">
              <i className="material-icons-outlined me-1">search</i>
              {t('search.searchBtn')}
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
		<div className="index3-page">
			<section className="banner-section-three index3-banner aos">
				<div className="container">
					<div className="row align-items-center justify-content-between">
						<div className="col-xxl-7 col-lg-8">
							<div className="banner-content index3-banner-content" data-aos="fade-up">
								<div className="banner-badge d-inline-flex align-items-center">
									<span className="badge bg-warning me-2">{t('banner.new')}</span>
									<p className="mb-0">{t('banner.tagline')}</p>
								</div>
								<h1>{t('banner.title1')} <span>{t('banner.title2')}</span></h1>
								<p className="index3-banner-subtitle">{t('banner.subtitle')}</p>
								{canListPropertyFromHomepage(listingUser?.role) && (
									<LocalizedLink to="/form?step=1" className="btn btn-primary btn-lg">
										<i className="material-icons-outlined me-2">add_home</i>
										{t('banner.listProperty')}
									</LocalizedLink>
								)}
							</div>
						</div>
					</div>

					<div className="row">
						<div className="col-12">
							<div className="banner-search banner-search-three index3-banner-search" data-aos="fade-down">
								<div className="index3-search-header">
									<h5 className="index3-search-title">{t('search.title')}</h5>
									<ul className="nav nav-tabs index3-search-tabs" role="tablist">
										<li className="nav-item" role="presentation">
											<a className="nav-link active" data-bs-toggle="tab" href="#buy_property" role="tab" aria-controls="buy_property" aria-selected="true">
													<span className="material-icons-outlined me-2 white-icon" aria-hidden="true">
  home
													</span>{t('search.buyProperty')}
											</a>
										</li>
										<li className="nav-item" role="presentation">
											<a className="nav-link" data-bs-toggle="tab" href="#rent_property" role="tab" aria-controls="rent_property" aria-selected="false">
												<i className="material-icons-outlined me-2">king_bed</i>
												{t('search.rentProperty')}
											</a>
										</li>
									</ul>
								</div>
								<div className="index3-accessibility-note" role="note" aria-label={t('index3.accessibility.ariaLabel')}>
									<span className="index3-accessibility-badge">
										<i className="material-icons-outlined" aria-hidden="true">accessibility</i>
										{t('index3.accessibility.badge')}
									</span>
									<p className="mb-0">{t('index3.accessibility.note')}</p>
								</div>
								<div className="tab-content index3-tab-content">
									<div className="tab-pane fade show active" id="buy_property" role="tabpanel">
										{renderSearchForm(true)}
									</div>
									<div className="tab-pane fade" id="rent_property" role="tabpanel">
										{renderSearchForm(false)}
									</div>
								</div>
							</div>
						</div>
					</div>
					

				</div>
			</section>
			

			
			<section className="work-section-three">
				<div className="container">

					
					<div className="row justify-content-center gy-4">

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="100">
							<div className="work-card bg-soft-warning flex-fill">
								<div className="work-card-icon mb-3">
									<span className="bg-warning me-2">
										<img src="/assets/img/icons/work-icon-01.svg" alt="icon" />
									</span>
									<h5>{t('work.verifiedTitle')}</h5>
								</div>
								<p>{t('work.verifiedDesc')}</p>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="200">
							<div className="work-card bg-soft-secondary flex-fill">
								<div className="work-card-icon mb-3">
									<span className="bg-secondary me-2">
										<img src="/assets/img/icons/work-icon-02.svg" alt="icon" />
									</span>
									<h5>{t('work.wideReachTitle')}</h5>
								</div>
								<p>{t('work.wideReachDesc')}</p>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="300">
							<div className="work-card bg-soft-pink flex-fill">
								<div className="work-card-icon mb-3">
									<span className="bg-pink me-2">
										<img src="/assets/img/icons/work-icon-03.svg" alt="icon" />
									</span>
									<h5>{t('work.directTitle')}</h5>
								</div>
								<p>{t('work.directDesc')}</p>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex" data-aos="fade-down" data-aos-duration="1200" data-aos-delay="400">
							<div className="work-card bg-soft-teal flex-fill">
								<div className="work-card-icon mb-3">
									<span className="bg-teal me-2">
										<img src="/assets/img/icons/work-icon-04.svg" alt="icon" />
									</span>
									<h5>{t('work.timeSavingTitle')}</h5>
								</div>
								<p>{t('work.timeSavingDesc')}</p>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="property-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>{t('propertySection.title')}</h2>
						<p>{t('propertySection.subtitle')}</p>
					</div>
					

					
					<div className="row gy-4 justify-content-center">

						<div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<Link to="/index-3"><img src="/assets/img/home-3/location/location-01.jpg" alt="City view of Tunis" /></Link>
									<div className="bottom-text">
										<div className="location-name">
											<h5>{t('propertySection.location1')}</h5>
											<p>300 {t('propertySection.properties')}</p>
										</div>
										<div className="arrow-overlay">
											<Link to="/buy-property-grid" aria-label={`Browse properties in ${t('propertySection.location1')}`}><i className="material-icons-outlined" aria-hidden="true">north_east</i></Link>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<Link to="/index-3"><img src="/assets/img/home-3/location/location-02.jpg" alt="City view of Sousse" /></Link>
									<div className="bottom-text">
										<div className="location-name">
											<h5>{t('propertySection.location2')}</h5>
											<p>458 {t('propertySection.properties')}</p>
										</div>
										<div className="arrow-overlay">
											<Link to="/buy-property-grid" aria-label={`Browse properties in ${t('propertySection.location2')}`}><i className="material-icons-outlined" aria-hidden="true">north_east</i></Link>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-4" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<Link to="/index-3"><img src="/assets/img/home-3/location/location-03.jpg" alt="City view of Sfax" /></Link>
									<div className="bottom-text">
										<div className="location-name">
											<h5>{t('propertySection.location3')}</h5>
											<p>175 {t('propertySection.properties')}</p>
										</div>
										<div className="arrow-overlay">
											<Link to="/buy-property-grid" aria-label={`Browse properties in ${t('propertySection.location3')}`}><i className="material-icons-outlined" aria-hidden="true">north_east</i></Link>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-6" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<Link to="/index-3"><img src="/assets/img/home-3/location/location-04.jpg" alt="City view of Nabeul" /></Link>
									<div className="bottom-text">
										<div className="location-name">
											<h5>{t('propertySection.location4')}</h5>
											<p>155 {t('propertySection.properties')}</p>
										</div>
										<div className="arrow-overlay">
											<Link to="/buy-property-grid" aria-label={`Browse properties in ${t('propertySection.location4')}`}><i className="material-icons-outlined" aria-hidden="true">north_east</i></Link>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-6" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">
							<div className="location-item">
								<div className="location-img">
									<Link to="/index-3"><img src="/assets/img/home-3/location/location-05.jpg" alt="City view of Hammamet" /></Link>
									<div className="bottom-text">
										<div className="location-name">
											<h5>{t('propertySection.location5')}</h5>
											<p>265 {t('propertySection.properties')}</p>
										</div>
										<div className="arrow-overlay">
											<Link to="/buy-property-grid" aria-label={`Browse properties in ${t('propertySection.location5')}`}><i className="material-icons-outlined" aria-hidden="true">north_east</i></Link>
										</div>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

					<div className="text-center mt-4 pt-3">
						<Link to="/buy-property-grid" className="btn btn-dark btn-lg d-inline-flex align-items-center" aria-label={t('propertySection.viewMore')}>{t('propertySection.viewMore')}<i className="material-icons-outlined ms-1" aria-hidden="true">north_east</i></Link>
					</div>
				</div>
			</section>
			

			
			<section className="about-us-section">
				<div className="section-bg">
					<img src="/assets/img/home-3/bg/sec-bg-01.png" className="bg-1" alt="" />
				</div>
				<div className="container">

					
					<div className="row align-items-center">

						<div className="col-lg-6">
							<div className="about-left-content">

								
								<div className="section-headings" data-aos="fade-up" data-aos-duration="1200">
									<span className="text-primary d-block mb-3">{t('aboutUs.badge')}</span>
									<div className="sec-line-three justify-content-start">
										<span className="sec-line1"></span>
										<span className="sec-line2"></span>
									</div>
									<h2 className="text-white">{t('aboutUs.title')}</h2>
									<h6 className="mb-3 text-primary">{t('aboutUs.subtitle')}</h6>
									<p className="text-white mb-4">{t('aboutUs.description')}</p>
									<Link to="/about-us" className="btn btn-primary d-inline-flex">{t('aboutUs.knowMore')}</Link>
								</div>
								

								<div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mt-3">
									<div className="d-flex align-items-center">
										<span className="flex-shrink-0 me-3"><img src="/assets/img/icons/counter-icon-01.svg" alt="" /></span>
										<div className="counter-value">
											<h4 className="dash-count text-white"><span className="counter-up text-white">1514</span>+</h4>
											<p className="text-white">{t('aboutUs.trustedOwners')}</p>
										</div>
									</div>
									<div className="d-flex align-items-center">
										<span className="flex-shrink-0 me-3"><img src="/assets/img/icons/counter-icon-02.svg" alt="" /></span>
										<div className="counter-value">
											<h4 className="dash-count text-white"><span className="counter-up text-white">12000</span>+</h4>
											<p className="text-white">{t('aboutUs.rentalsCompleted')}</p>
										</div>
									</div>
									<div className="d-flex align-items-center">
										<span className="flex-shrink-0 me-3"><img src="/assets/img/icons/counter-icon-03.svg" alt="" /></span>
										<div className="counter-value">
											<h4 className="dash-count text-white"><span className="counter-up text-white">9000</span>+</h4>
											<p className="text-white">{t('aboutUs.happyClients')}</p>
										</div>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-lg-6">
							<div className="property-sec-img">
								<div className="row g-3">
									<div className="col-md-6 d-flex" data-aos="fade-up" data-aos-duration="1200">
										<div className="flex-fill">
											<div><img src="/assets/img/home-3/property/property-01.jpg" alt="" /></div>
										</div>
									</div>
									<div className="col-md-6 d-flex" data-aos="fade-up" data-aos-duration="1200">
										<div className="flex-fill">
											<div className="mb-3"><img src="/assets/img/home-3/property/property-02.jpg" alt="" /></div>
											<div><img src="/assets/img/home-3/property/property-03.jpg" alt="" /></div>
										</div>
									</div>
								</div>
								<div className="img-left-top"><img src="/assets/img/icons/rounded-img.png" alt="" /></div>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="feature-property-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>{t('index3.featureProperty.title')}</h2>
						<p>{t('index3.featureProperty.subtitle')}</p>
					</div>
					

					
					<div className="row justify-content-center gy-4">

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-04.jpg" alt="Featured houses" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-02.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Houses</Link></h5>
										<p>288 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-05.jpg" alt="Featured offices" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-04.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Offices</Link></h5>
										<p>300 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-06.jpg" alt="Featured villas" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-01.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Villas</Link></h5>
										<p>250 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-07.jpg" alt="Featured apartments" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-03.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Apartments</Link></h5>
										<p>230 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl col-lg-4 col-sm-6">
							<div className="property-item">
								<div className="property-img">
									<Link to="/rent-property-grid">
										<img src="/assets/img/home-3/property/property-08.jpg" alt="Featured duplexes" />
									</Link>
									<span className="building-icon">
										<img src="/assets/img/icons/building-05.svg" alt="" />
									</span>
								</div>
								<div className="d-flex align-items-center justify-content-between property-content">
									<div className="propery-name">
										<h5><Link to="/rent-property-grid">Duplexes</Link></h5>
										<p>320 Property</p>
									</div>
									<div className="arrow-overlay">
										<Link to="/rent-property-grid"><i className="material-icons-outlined">north_east</i></Link>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="post-propert-section">
				<div className="sec-img">
					<img src="/assets/img/home-3/bg/sec-bg-03.png" className="bg-1" alt="" />
					<img src="/assets/img/home-3/bg/sec-bg-09.png" className="bg-2" alt="" />
				</div>
				<div className="container">

					
					<div className="row">

						<div className="col-lg-6">

							
							<div className="section-headings">
								<div className="sec-line-three justify-content-start mb-3">
									<span className="sec-line1"></span>
									<span className="sec-line2"></span>
								</div>
								<span className="text-white d-block mb-3">{t('index3.postProperty.badge')}</span>
								<h2 className="text-white">{t('index3.postProperty.title')}  {t('index3.postProperty.subtitle')}</h2>
								<Link to="/add-property-buy" className="btn btn-primary d-inline-flex">{t('index3.postProperty.cta')}</Link>
							</div>
							

						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="rent-propery-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>{t('index3.propertyCards.section1')}</h2>
						<p>{t('index3.propertyCards.subtitle1')}</p>
					</div>
					

					
					<div className="row justify-content-center gy-4">
						{featuredLoading ? (
							<div className="col-12 text-center">
								<div className="spinner-border" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
							</div>
						) : featuredProperties && featuredProperties.length > 0 ? (
							featuredProperties.map((prop) => (
								<div key={prop._id} className="col-xl-3 col-lg-4 col-md-6 d-flex">
									<div className="rent-property-item flex-fill">
										<div className="property-img">
											<Link to={prop.listingType === 'FOR_RENT' ? `/rent-details/${prop._id}` : `/buy-details/${prop._id}`}>
												<img src={prop.images?.[0] ? getImageUrl(prop.images[0]) : '/assets/img/home-3/property/property-09.jpg'} alt={prop.title || 'Property'} onError={(e) => { e.target.src = '/assets/img/home-3/property/property-09.jpg'; }} />
											</Link>
											<div className="favourite">
												<button type="button" className="icon-btn" aria-label="Add property to favorites"><i className="material-icons-outlined" aria-hidden="true">favorite_border</i></button>
											</div>
											<div className="d-flex align-items-center token-top">
												<span className="token bg-danger me-1">
													<i className="material-icons-outlined text-warning">generating_tokens</i>
												</span>
												<span className="token bg-orange">
													<i className="material-icons-outlined text-warning">loyalty</i>
												</span>
											</div>
											<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
												<img src="/assets/img/users/user-01.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
											</span>
										</div>
										<div className="rental-content">
											<div className="d-flex align-items-center justify-content-between mb-3">
												<span className="badge bg-secondary">{prop.type || 'Property'}</span>
												<span className="date">Listed on : {new Date(prop.createdAt).toLocaleDateString()}</span>
											</div>
											<div className="mb-3">
												<h5><Link to={prop.listingType === 'FOR_RENT' ? `/rent-details/${prop._id}` : `/buy-details/${prop._id}`}>{prop.title || 'Property'}</Link></h5>
												<p className="d-inline-flex align-items-center"><i className="material-icons-outlined me-1">location_on</i>{prop.address || `${prop.city}, ${prop.country}`}</p>
											</div>
											<div className="d-flex align-items-center justify-content-between">
												<p className="rate-info mb-0"><span>{prop.price?.toLocaleString() || '0'} TND</span> {prop.listingType === 'FOR_RENT' ? '/ Mois' : ''}</p>
												<div className="d-flex align-items-center gap-1">
													{[...Array(5)].map((_, i) => (
														<i key={i} className={`material-icons-outlined ${i < Math.round(prop.avgRating || 0) ? 'text-warning' : 'text-secondary'}`}>star</i>
													))}
													{prop.avgRating?.toFixed(1) || '0.0'}
												</div>
											</div>
											<div className="card-info d-flex align-items-center justify-content-between">
												<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>{prop.rooms || '0'} Bed</p>
												<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>{prop.bathrooms || '0'} Bath</p>
												<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>{prop.surface || '0'} Sq Ft</p>
											</div>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="col-12 text-center">
								<p>No featured properties available.</p>
							</div>
						)}
					</div>
					

					<div className="text-center mt-4 pt-3">
						<Link to="/rent-property-grid" className="btn btn-dark d-inline-flex align-items-center">Voir Plus<i className="material-icons-outlined ms-1">north_east</i></Link>
					</div>
				</div>
			</section>
			

			
			<section className="how-it-work-section">
				<div className="section-bg">
					<img src="/assets/img/home-3/bg/sec-bg-05.png" className="bg-1" alt="" />
					<img src="/assets/img/home-3/bg/shape-01.svg" className="bg-2" alt="" />
					<img src="/assets/img/home-3/bg/shape-02.svg" className="bg-3" alt="" />
				</div>
				<div className="container">

					
					<div className="row align-items-center">

						<div className="col-lg-7">
							<div className="work-sec-img">
								<div><img src="/assets/img/home-3/bg/sec-bg-04.png" alt="" /></div>
								<div className="banner-users section-users d-flex align-items-center flex-wrap gap-3">
									<div className="avatar-list-stacked"> 
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-01.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-02.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-03.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
										<span className="avatar avatar-md rounded-circle border-0"><img src="/assets/img/users/user-04.jpg" className="img-fluid rounded-circle" alt="Img" /></span>
									</div>
									<div>
										<div className="d-flex align-items-center mb-1">
											<h6 className="mb-0 me-2 fs-14 fw-semibold text-white">Ratings 5.0</h6>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
										</div>
										<p className="mb-0 text-white">{t('index3.howItWorks.ratingText')}</p>
									</div>
								</div>
								<div className="shape-3"><img src="/assets/img/home-3/bg/shape-03.svg" alt="" /></div>
							</div>
						</div> 

						<div className="col-lg-5">
							<div>
								<div className="section-headings mb-4">
									<span className="text-primary d-block mb-3">{t('index3.howItWorks.badge')}</span>
									<div className="sec-line-three justify-content-start">
										<span className="sec-line1"></span>
										<span className="sec-line2"></span>
									</div>
									<h2 className="mb-3 text-white">{t('index3.howItWorks.title')}</h2>
								</div>
								<div>
									<div className="work-steps mb-4">
										<span className="d-block mb-2 text-orange">{t('index3.howItWorks.step1Label')}</span>
										<h6 className="mb-2 text-white">{t('index3.howItWorks.step1Title')}</h6>
										<p className="text-white">{t('index3.howItWorks.step1Desc')}</p>
									</div>
									<div className="work-steps mb-4">
										<span className="d-block mb-2 text-pink">{t('index3.howItWorks.step2Label')}</span>
										<h6 className="mb-2 text-white">{t('index3.howItWorks.step2Title')}</h6>
										<p className="text-white">{t('index3.howItWorks.step2Desc')}</p>
									</div>
									<div className="work-steps mb-0">
										<span className="d-block mb-2 text-teal">{t('index3.howItWorks.step3Label')}</span>
										<h6 className="mb-2 text-white">{t('index3.howItWorks.step3Title')}</h6>
										<p className="text-white">{t('index3.howItWorks.step3Desc')}</p>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<section className="rent-propery-section">
				<div className="container">

					
					<div className="section-heading-three">
						<div className="sec-line-three">
							<span className="sec-line1"></span>
							<span className="sec-line2"></span>
						</div>
						<h2>{t('index3.propertyCards.section2')}</h2>
						<p>{t('index3.propertyCards.subtitle2')}</p>
					</div>
					

					
					<div className="row justify-content-center gy-4">

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/buy-details">
										<img src="/assets/img/home-3/property/property-13.jpg" alt="Royal Apartment exterior" />
									</Link>
									<div className="favourite">
										<button type="button" className="icon-btn" aria-label="Add property to favorites"><i className="material-icons-outlined" aria-hidden="true">favorite_border</i></button>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-01.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-secondary">Apartment</span>
										<span className="date">Listed on : 25 May 2025</span>
									</div>
									<div className="mb-3">
										<p className="d-inline-flex align-items-center mb-1"><i className="material-icons-outlined me-1">location_on</i>25, Willow Crest Apartment</p>
										<h5><Link to="/buy-details">Royal Apartment</Link></h5>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info d-inline-flex align-items-center mb-0">Starts From <span className="ms-2">2000 TND</span></p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/buy-details">
										<img src="/assets/img/home-3/property/property-14.jpg" alt="Grand Villa House exterior" />
									</Link>
									<div className="favourite">
										<button type="button" className="icon-btn" aria-label="Add property to favorites"><i className="material-icons-outlined" aria-hidden="true">favorite_border</i></button>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-02.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-purple">Villa</span>
										<span className="date">Listed on : 18 Apr 2025</span>
									</div>
									<div className="mb-3">
										<p className="d-inline-flex align-items-center mb-1"><i className="material-icons-outlined me-1">location_on</i>10, Oak Ridge Villa</p>
										<h5><Link to="/buy-details">Grand Villa House</Link></h5>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info d-inline-flex align-items-center mb-0">Starts From <span className="ms-2">11000 TND</span></p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/buy-details">
										<img src="/assets/img/home-3/property/property-15.jpg" alt="Elite Suite Room exterior" />
									</Link>
									<div className="favourite">
										<button type="button" className="icon-btn" aria-label="Add property to favorites"><i className="material-icons-outlined" aria-hidden="true">favorite_border</i></button>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-03.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-pink">Suite</span>
										<span className="date">Listed on : 20 Mar 2025</span>
									</div>
									<div className="mb-3">
										<p className="d-inline-flex align-items-center mb-1"><i className="material-icons-outlined me-1">location_on</i>42, Maple Grove Residences</p>
										<h5><Link to="/buy-details">Elite Suite Room</Link></h5>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info d-inline-flex align-items-center mb-0">Starts From <span className="ms-2">8400 TND</span></p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

						<div className="col-xl-3 col-lg-4 col-md-6 d-flex">
							<div className="rent-property-item flex-fill">
								<div className="property-img">
									<Link to="/buy-details">
										<img src="/assets/img/home-3/property/property-16.jpg" alt="Celestial Residency exterior" />
									</Link>
									<div className="favourite">
										<button type="button" className="icon-btn" aria-label="Add property to favorites"><i className="material-icons-outlined" aria-hidden="true">favorite_border</i></button>
									</div>
									<div className="d-flex align-items-center token-top">
										<span className="token bg-danger me-1">
											<i className="material-icons-outlined text-warning">generating_tokens</i>
										</span>
										<span className="token bg-orange">
											<i className="material-icons-outlined text-warning">loyalty</i>
										</span>
									</div>
									<span className="avatar avatar-md rounded-circle border-0 avatar-bottom">
										<img src="/assets/img/users/user-04.jpg" className="img-fluid border border-white rounded-circle" alt="Img" />
									</span>
								</div>
								<div className="rental-content">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<span className="badge bg-orange">Residency</span>
										<span className="date">Listed on : 12 Mar 2025</span>
									</div>
									<div className="mb-3">
										<p className="d-inline-flex align-items-center mb-1"><i className="material-icons-outlined me-1">location_on</i>88, Pine Valley Heights</p>
										<h5><Link to="/buy-details">Celestial Residency</Link></h5>
									</div>
									<div className="d-flex align-items-center justify-content-between">
										<p className="rate-info d-inline-flex align-items-center mb-0">Starts From <span className="ms-2">9000 TND</span></p>
										<div className="d-flex align-items-center gap-1">
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											<i className="material-icons-outlined text-warning">star</i>
											5.0
										</div>
									</div>
									<div className="card-info d-flex align-items-center justify-content-between">
										<p><span className="me-2"><i className="material-icons-outlined">bed</i></span>2 Bed</p>
										<p><span className="me-2"><i className="material-icons-outlined">bathtub</i></span>2 Bath</p>
										<p><span className="me-2"><i className="material-icons-outlined">straighten</i></span>350 Sq Ft</p>
									</div>
								</div>
							</div>
						</div> 

					</div>
					

					<div className="text-center mt-4 pt-3">
						<Link to="/buy-property-grid" className="btn btn-dark d-inline-flex align-items-center">Voir Plus<i className="material-icons-outlined ms-1">north_east</i></Link>
					</div>
				</div>
			</section>
			

			
			<section className="success-stories-section">
				<div className="section-bg">
					<img src="/assets/img/home-3/bg/sec-bg-07.png" className="bg-1" alt="" />
					<img src="/assets/img/home-3/bg/sec-bg-10.png" className="bg-2" alt="" />
				</div>
				<div className="container">

					
					<div className="row align-items-center">

						<div className="col-lg-4">
							<div className="section-left-content">
								<div className="section-headings mb-4">
									<div className="sec-line-three justify-content-start mb-3">
										<span className="sec-line1"></span>
										<span className="sec-line2"></span>
									</div>
									<h2 className="mb-2">Histoires de succès de nos clients</h2>
									<p className="mb-4">Découvrez ce que nos clients satisfaits disent de leurs expériences avec Smart Property.</p>
									<Link to="/testimonials" className="btn btn-dark d-inline-flex align-items-center" aria-label="View testimonials">Voir Plus<i className="material-icons-outlined ms-1" aria-hidden="true">north_east</i></Link>
								</div>
								<div className="success-customer mb-4">
									<h6>Approuv\u00e9 par plus de 50K+ clients en Tunisie</h6>
									<div className="d-flex align-items-center rating mb-1">
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										<i className="material-icons-outlined text-warning">star</i>
										4.4/5.0
										<span className="border-start ps-2 ms-2">{t('index3.testimonials.reviewCount')}</span>
									</div>
								</div>
								<div className="arrow-bottom"><img src="/assets/img/home-3/bg/arrow.svg" alt="" /></div>
							</div>
						</div> 

						<div className="col-lg-8">
							<div>

								
								<div className="row">

									<div className="col-md-6">
										<div className="review-item mb-4">
											<span className="d-block mb-3"><img src="/assets/img/icons/quote-down-02.svg" alt="" /></span>
											<div className="d-flex align-items-center mb-2">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
											</div>
											<p>Trouver ma maison parfaite en Tunisie a été incroyablement facile avec Smart Property. L'interface est conviviale et intuitive.</p>
											<div className="review-customer">
												<span className="avatar avatar-md rounded-circle flex-shrink-0 me-2">
													<img src="/assets/img/users/user-02.jpg" className="img-fluid border border-white rounded-circle" alt="Aïda Belaid" />
												</span>
												<h6 className="me-2"><span>Aïda Belaid</span></h6>
												<span className="d-inline-flex align-items-center"><i className="fa-solid fa-circle me-2"></i>{t('index3.testimonials.customer1Location')}</span>
											</div>
										</div>
										<div className="review-item mb-4">
											<span className="d-block mb-3"><img src="/assets/img/icons/quote-down-02.svg" alt="" /></span>
											<div className="d-flex align-items-center mb-2">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
											</div>
											<p>Smart Property a rendu la location immobilière très facile. Super simple et sans stress!</p>
											<div className="review-customer">
												<span className="avatar avatar-md rounded-circle flex-shrink-0 me-2">
													<img src="/assets/img/users/user-04.jpg" className="img-fluid border border-white rounded-circle" alt={t('index3.testimonials.customer2Name')} />
												</span>
												<h6 className="me-2"><span>{t('index3.testimonials.customer2Name')}</span></h6>
												<span className="d-inline-flex align-items-center"><i className="fa-solid fa-circle me-2"></i>{t('index3.testimonials.customer2Location')}</span>
											</div>
										</div>
									</div> 

									<div className="col-md-6 mt-4">
										<div className="review-item mb-4">
											<span className="d-block mb-3"><img src="/assets/img/icons/quote-down-02.svg" alt="" /></span>
											<div className="d-flex align-items-center mb-2">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
											</div>
											<p>Réserver ma future propriété a été si simple avec Smart Property. Le site est très facile à utiliser!</p>
											<div className="review-customer">
												<span className="avatar avatar-md rounded-circle flex-shrink-0 me-2">
													<img src="/assets/img/users/user-06.jpg" className="img-fluid border border-white rounded-circle" alt={t('index3.testimonials.customer3Name')} />
												</span>
												<h6 className="me-2"><span>{t('index3.testimonials.customer3Name')}</span></h6>
												<span className="d-inline-flex align-items-center"><i className="fa-solid fa-circle me-2"></i>{t('index3.testimonials.customer3Location')}</span>
											</div>
										</div>
										<div className="review-item mb-4">
											<span className="d-block mb-3"><img src="/assets/img/icons/quote-down-02.svg" alt="" /></span>
											<div className="d-flex align-items-center mb-2">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
											</div>
											<p>Smart Property a rendu la recherche immobilière sans effort. L'interface est tellement facile à naviguer!</p>
											<div className="review-customer">
												<span className="avatar avatar-md rounded-circle flex-shrink-0 me-2">
													<img src="/assets/img/users/user-17.jpg" className="img-fluid border border-white rounded-circle" alt={t('index3.testimonials.customer4Name')} />
												</span>
												<h6 className="me-2"><span>{t('index3.testimonials.customer4Name')}</span></h6>
												<span className="d-inline-flex align-items-center"><i className="fa-solid fa-circle me-2"></i>{t('index3.testimonials.customer4Location')}</span>
											</div>
										</div>
									</div> 

								</div>
								

							</div>
						</div> 

					</div>
					

				</div>
			</section>
			

			
			<div className="partners-logos">
				<div className="container">

					
					<div className="row">

						<div className="col-md-12">
							<div className="partner-slider swiper">
								<div className="swiper-wrapper">
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-07.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-08.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-09.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-10.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-11.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-12.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-13.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-08.svg" alt="" /></div>
									<div className="swiper-slide text-center"><img src="/assets/img/icons/partner-07.svg" alt="" /></div>
								</div>
							</div>
						</div> 

					</div>
					

				</div>
			</div>
			

			<br />
			<br />
			
			<div className="contact-field-section">
				<div className="container">
					<div className="contact-field">
						<div><img src="/assets/img/home-3/bg/sec-bg-08.png" className="bg-1" alt="" /></div>

						
						<div className="row align-items-center justify-content-lg-between gy-4">

							<div className="col-lg-5">
								<div>
									<h2 className="text-white mb-2">{t('index3.contactForm.title')}</h2>
									<p className="text-white">{t('index3.contactForm.subtitle')}</p>
								</div>
							</div> 

							<div className="col-lg-5">
								<form action="index-3.html#">
									<div className="d-flex align-items-center email-forms">
										<div className="contact-box align-items-center justify-content-center flex-fill">
											<span className="input-icon d-inline-flex align-items-center"><i className="material-icons-outlined">email</i></span>
											<input type="email" className="form-control" placeholder="Enter Email Address" aria-label="Email address" />
										</div>
											<button type="submit" aria-label="Send newsletter request"><i className="material-icons-outlined" aria-hidden="true">send</i></button>
									</div>
								</form>
							</div> 

						</div>
						

					</div>
				</div>
			</div>
			

			

			

			
			<div className="modal fade" id="search-modal" tabIndex="-1" aria-hidden="true" aria-labelledby="search-modal-title">
				<div className="modal-dialog  modal-dialog-centered modal-lg">
					<div className="modal-content">
						<div className="modal-body search-wrap">
							<form className="search-form" id="search-form" action="rent-property-grid.html">
								<div className="d-flex align-items-center justify-content-between mb-4">
									<h5 id="search-modal-title">Que recherchez-vous ?</h5>
									<button type="button" className="close" data-bs-dismiss="modal" aria-label="Close search modal"><i className="material-icons-outlined" aria-hidden="true">close</i></button>
								</div>
								<div className="input-group input-group-flat">
									<input type="text" className="form-control" placeholder="Type a Keyword...." aria-label="Search keyword" />
									<span className="input-group-text">
										<i className="material-icons-outlined">search</i>
									</span>
								</div>
								<h6>Propri\u00e9t\u00e9s Populaires</h6>
								<div className="search-list">
									<p><Link to="/rent-property-grid">Appartement Condo Beau</Link></p>
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
  );
};

export default Index3;




