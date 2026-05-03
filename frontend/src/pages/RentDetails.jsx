import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';
import { apiRequest } from '../api/client';
import { getUserData } from '../utils/auth';
import { getImageUrl, getPropertyById, getFeedbackSummaryByPropertyIds } from '../services/propertyService';
import { normalizePanoramas } from '../utils/panoramaUtils';
import PanoViewer from '../components/PanoViewer';
import ReviewSection from '../components/ReviewSection';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RentDetailsMapFlyTo({ lat, lng }) {
	const map = useMap();
	const mapRef = useRef(map);
	useEffect(() => {
		mapRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
	}, [lat, lng]);
	return null;
}

const FALLBACK_HERO_SLIDES = [
	'/assets/img/buy/buy-slide-img-1.jpg',
	'/assets/img/buy/buy-slide-img-2.jpg',
	'/assets/img/buy/buy-slide-img-3.jpg',
	'/assets/img/buy/buy-slide-img-4.jpg',
	'/assets/img/buy/buy-slide-img-5.jpg',
	'/assets/img/buy/buy-slide-img-6.jpg',
];

const DEFAULT_MAP_CENTER = [36.8065, 10.1815];


/** Same rules as backend: block if pending, or non-cancelled lease whose end date is today or later. */
function pickBlockingLease(leases) {
	if (!Array.isArray(leases)) return null;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return leases.find((l) => {
		if (l.status === 'CANCELLED') return false;
		if (l.status === 'PENDING') return true;
		const end = new Date(l.endDate);
		end.setHours(0, 0, 0, 0);
		return end >= today;
	});
}

const RentDetails = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const { id: routeId } = useParams();
	const [currentUser] = useState(() => getUserData());
	const [isSending, setIsSending] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [blockingLease, setBlockingLease] = useState(null);
	const [paymentStatus, setPaymentStatus] = useState({ loading: false, hasTenantWallet: false, hasOwnerWallet: false });
	const [paymentModalState, setPaymentModalState] = useState({ show: false, status: 'confirm', errorMessage: '' });
	const [bookingForm, setBookingForm] = useState({
		startDate: '',
		endDate: '',
		rentAmount: '',
		note: t('propertyDetails.bookingRequestDefaultNote'),
	});

	const propertyId = useMemo(() => {
		const params = new URLSearchParams(location.search);
		return routeId || params.get('propertyId') || params.get('id') || '';
	}, [routeId, location.search]);

	const isBookingBlocked = Boolean(blockingLease && blockingLease.status !== 'CANCELLED');

	const [property, setProperty] = useState(null);
	const [loading, setLoading] = useState(false);
	const [loadError, setLoadError] = useState(null);
	const [ratingSummary, setRatingSummary] = useState({ averageRating: '0.0', totalReviews: 0 });
	const [mapPosition, setMapPosition] = useState(null);
	const [heroImageIndex, setHeroImageIndex] = useState(0);
	const [isTourModalOpen, setIsTourModalOpen] = useState(false);
	const lastGeocodedAddress = useRef('');

	const listingLabel = useMemo(() => {
		if (!property?.listingType) return t('propertyDetails.forRent');
		return property.listingType === 'FOR_SALE' ? t('propertyDetails.forSale') : t('propertyDetails.forRent');
	}, [property?.listingType, t]);

	const addressLabel = useMemo(() => {
		if (!property) return '';
		if (property.address) return property.address;
		const parts = [property.city, property.region, property.country].filter(Boolean);
		return parts.join(', ');
	}, [property]);

	const formattedUpdatedAt = useMemo(() => {
		if (!property?.updatedAt && !property?.createdAt) return '';
		const d = new Date(property.updatedAt || property.createdAt);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
	}, [property?.updatedAt, property?.createdAt]);

	const formattedPrice = useMemo(() => {
		const price = property?.price;
		if (price === undefined || price === null || Number.isNaN(Number(price))) return t('propertyPages.notAvailable');
		return `${Number(price).toLocaleString('en-US').replace(/,/g, ' ')} TND`;
	}, [property?.price, t]);

	const tourPanoramas = useMemo(() => normalizePanoramas(property?.panoramas), [property?.panoramas]);
	const hasPanoramas = tourPanoramas.length > 0;

	const propertyImages = useMemo(() => {
		if (!property?.images?.length) return [];
		return property.images.map((img) => getImageUrl(img)).filter(Boolean);
	}, [property?.images]);

	const heroSlides = useMemo(
		() => (propertyImages.length > 0 ? propertyImages : FALLBACK_HERO_SLIDES),
		[propertyImages]
	);

	useEffect(() => {
		setHeroImageIndex(0);
	}, [propertyId, property?._id, propertyImages.length]);

	useEffect(() => {
		if (heroImageIndex >= heroSlides.length) setHeroImageIndex(0);
	}, [heroSlides.length, heroImageIndex]);

	const ownerProfile = useMemo(() => {
		const o = property?.createdBy;
		if (!o || typeof o !== 'object') {
			return {
				displayName: t('propertyDetails.listingOwner'),
				email: null,
				phone: null,
				whatsappDigits: '',
				memberSince: null,
				initials: '?',
			};
		}
		const name = [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
		const displayName = name || o.login || o.email || t('propertyDetails.listingOwner');
		const initials = (name || o.login || o.email || '?')
			.split(/\s+/)
			.map((p) => p[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
		let memberSince = null;
		if (o.createdAt) {
			const d = new Date(o.createdAt);
			if (!Number.isNaN(d.getTime())) {
				memberSince = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
			}
		}
		const wa = String(o.phone || '').replace(/\D/g, '');
		return {
			displayName,
			email: o.email || null,
			phone: o.phone || null,
			whatsappDigits: wa,
			memberSince,
			initials,
		};
	}, [property?.createdBy, t]);

	const goHeroPrev = useCallback(() => {
		setHeroImageIndex((i) => (heroSlides.length ? (i - 1 + heroSlides.length) % heroSlides.length : 0));
	}, [heroSlides.length]);

	const goHeroNext = useCallback(() => {
		setHeroImageIndex((i) => (heroSlides.length ? (i + 1) % heroSlides.length : 0));
	}, [heroSlides.length]);

	const safeHeroIndex = Math.min(heroImageIndex, Math.max(0, heroSlides.length - 1));
	const canNavigateHero = heroSlides.length > 1;
	const typeDisplayLabel = useMemo(
		() => (property?.type ? String(property.type).replace(/_/g, ' ') : ''),
		[property?.type]
	);

	const displayAddressForMap = useMemo(() => {
		if (!property) return '';
		const addr = property.address?.trim();
		if (addr) return addr;
		return [property.city, property.region, property.country || t('propertyPages.countryFallback')].filter(Boolean).join(', ');
	}, [property, t]);
	const ownerEmailSubject = encodeURIComponent(`Regarding listing: ${property?.reference || property?.title || ''}`);

	const mapLat = mapPosition ? mapPosition[0] : DEFAULT_MAP_CENTER[0];
	const mapLng = mapPosition ? mapPosition[1] : DEFAULT_MAP_CENTER[1];
	const mapKey = mapPosition ? `${mapPosition[0]}-${mapPosition[1]}` : 'default';

	useEffect(() => {
		setMapPosition(null);
	}, [propertyId]);

	useEffect(() => {
		if (!property) {
			setMapPosition(null);
			lastGeocodedAddress.current = '';
			return;
		}

		// 1. Prioritize pre-existing coordinates if available and valid
		const coords = property.location?.coordinates;
		if (Array.isArray(coords) && coords.length === 2) {
			const [lon, lat] = coords.map(parseFloat);
			if (Number.isFinite(lon) && Number.isFinite(lat) && lon !== 0 && lat !== 0) {
				setMapPosition([lat, lon]);
				return;
			}
		}

		// 2. Fallback to geocoding if coordinates are missing
		const addressParts = [
			property.address,
			property.city,
			property.region,
			property.country || t('propertyPages.countryFallback'),
		].filter(Boolean);

		const query = addressParts.join(', ');

		// Avoid re-fetching if the address hasn't changed since the last fetch
		if (addressParts.length === 0 || query === lastGeocodedAddress.current) {
			if (addressParts.length === 0 && !mapPosition) {
				setMapPosition([...DEFAULT_MAP_CENTER]);
			}
			return;
		}

		const geocodeTimer = setTimeout(async () => {
			try {
				lastGeocodedAddress.current = query;
				let res = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=tn`,
					{ headers: { 'User-Agent': 'SmartProperty/1.1 (smart-property-app)' } }
				);
				let data = await res.json();

				if (!data || data.length === 0) {
					const simple = [property.address, property.city].filter(Boolean).join(', ');
					res = await fetch(
						`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simple)}&limit=1&addressdetails=1&countrycodes=tn`,
						{ headers: { 'User-Agent': 'SmartProperty/1.1 (smart-property-app)' } }
					);
					data = await res.json();
				}

				if (data && data.length > 0) {
					const lat = parseFloat(data[0].lat);
					const lon = parseFloat(data[0].lon);
					if (Number.isFinite(lat) && Number.isFinite(lon)) {
						setMapPosition([lat, lon]);
						return;
					}
				}
				setMapPosition([...DEFAULT_MAP_CENTER]);
			} catch (err) {
				console.error("Geocoding failed:", err);
				setMapPosition([...DEFAULT_MAP_CENTER]);
			}
		}, 1000); // Increased debounce for rate limit safety

		return () => clearTimeout(geocodeTimer);
	}, [property, t]);


	useEffect(() => {
		if (!propertyId) {
			setProperty(null);
			setLoadError(null);
			setLoading(false);
			return;
		}
		let cancelled = false;
		(async () => {
			setLoading(true);
			setLoadError(null);
			try {
				const data = await getPropertyById(propertyId);
				if (!cancelled) {
					setProperty(data);
					const summary = await getFeedbackSummaryByPropertyIds([propertyId]);
					setRatingSummary(summary?.[propertyId] || { averageRating: '0.0', totalReviews: 0 });
				}
			} catch {
				if (!cancelled) {
					setProperty(null);
					setLoadError(t('propertyDetails.failedToLoadProperty'));
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [propertyId, t]);


	useEffect(() => {
		if (!propertyId || !currentUser) return;
		const checkStatus = async () => {
			setPaymentStatus(prev => ({ ...prev, loading: true }));
			try {
				const res = await apiRequest(`/api/easy-wallet/status/${propertyId}?paymentType=LEASE`);
				if (res.success) {
					setPaymentStatus({
						loading: false,
						hasTenantWallet: res.data.hasTenantWallet,
						hasOwnerWallet: res.data.hasOwnerWallet,
						recipientName: res.data.recipientName,
						amount: res.data.amount
					});
					if (res.data.activeRecord) {
						setBlockingLease(res.data.activeRecord);
					}
				}
			} catch (err) {
				console.error("Failed to fetch payment status:", err);
				setPaymentStatus(prev => ({ ...prev, loading: false }));
			}
		};
		checkStatus();
	}, [propertyId, currentUser]);

	const handleInstaPay = () => {
		setPaymentModalState({ show: true, status: 'confirm', errorMessage: '' });
	};

	const proceedPayment = async () => {
		const amountToPay = paymentStatus.amount || property?.price;
		if (!amountToPay) return;

		setPaymentModalState(prev => ({ ...prev, status: 'processing', errorMessage: '' }));

		// Calculate automatic 1-month duration
		const now = new Date();
		const startDate = now.toISOString().slice(0, 10);
		const end = new Date(now);
		end.setMonth(end.getMonth() + 1);
		const endDate = end.toISOString().slice(0, 10);

		try {
			const res = await apiRequest('/api/easy-wallet/pay', {
				method: 'POST',
				body: JSON.stringify({
					propertyId: propertyId,
					amount: amountToPay,
					paymentType: 'LEASE',
					startDate,
					endDate
				})
			});

			if (res.success) {
				toast.success(t('propertyDetails.paymentSuccessful'));
				setPaymentModalState(prev => ({ ...prev, status: 'success' }));
				setBlockingLease({ status: 'CONFIRMED', startDate, endDate });
			} else {
				setPaymentModalState(prev => ({ ...prev, status: 'error', errorMessage: res.message || t('propertyDetails.paymentFailed') }));
			}
		} catch (err) {
			setPaymentModalState(prev => ({ ...prev, status: 'error', errorMessage: err.message || t('propertyDetails.paymentFailed') }));
		}
	};

	const closeTourModal = useCallback(() => setIsTourModalOpen(false), []);

	useEffect(() => {
		if (!isTourModalOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const onKey = (e) => {
			if (e.key === 'Escape') closeTourModal();
		};
		document.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = prev;
			document.removeEventListener('keydown', onKey);
		};
	}, [isTourModalOpen, closeTourModal]);


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
				window.jQuery('#mobile_btn').off('click').on('click', function () {
					window.jQuery('.main-menu-wrapper').addClass('open');
				});
				window.jQuery('#menu_close').off('click').on('click', function () {
					window.jQuery('.main-menu-wrapper').removeClass('open');
				});
				window.jQuery('.has-submenu > a').off('click').on('click', function (e) {
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
					{property && !loading && (
						<div className="buy-details-header-item">
							<div className="breadcrumb-bar custom-breadcrumb-bar">
								<div className="container">
									<div className="row align-items-center text-center position-relative z-1">
										<div className="col-xl-8">
											<div className="d-flex align-center gap-2 mb-2">
												<span className="badge bg-primary">{typeDisplayLabel || t('propertyDetails.propertyFallback')}</span>
												<span className="badge bg-secondary">{listingLabel}</span>
											</div>
											<h1 className="breadcrumb-title text-start">{property.title}</h1>
											{property.reference && (
												<p className="text-start text-white-50 small mb-2">Ref: {property.reference}</p>
											)}
											<div className="d-flex align-items-center gap-2 flex-wrap gap-1 mb-xl-0 mb-4">
												<div className="d-flex align-items-center justify-content-center">
													<i className="material-icons-outlined text-warning">star</i>
													<i className="material-icons-outlined text-warning">star</i>
													<i className="material-icons-outlined text-warning">star</i>
													<i className="material-icons-outlined text-warning">star</i>
													<i className="material-icons-outlined text-warning">star</i>
													<span className="text-white ms-1">
														{' '}
														{ratingSummary.averageRating || '0.0'} ({ratingSummary.totalReviews || 0})
													</span>
												</div>
												<i className="fa-solid fa-circle text-body"></i>
												<div className="fs-14 mb-0 text-white d-flex align-items-center flex-wrap gap-1 custom-address-item">
													<i className="material-icons-outlined text-white me-1">location_on</i>
													{addressLabel || t('propertyDetails.noDescription')}
												</div>
												<i className="fa-solid fa-circle text-body"></i>
												<p className="fs-14 mb-0 text-white">{t('propertyDetails.lastUpdated')}: {formattedUpdatedAt || t('propertyDetails.noDescription')}</p>
											</div>
										</div>
										<div className="col-xl-4 d-flex d-xl-block align-items-center flex-wrap gap-3">
											<h4 className="mb-0 text-primary text-xl-end text-start">
												{formattedPrice}
												<span className="fs-6 fw-normal d-block d-xl-inline ms-xl-2"> / {t('propertyPages.month')}</span>
											</h4>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
					<div className="content">
						<div className="container">
							{!propertyId && (
								<div className="alert alert-warning mb-4" role="alert">
									{t('propertyDetails.openRentalFromMarketplace')}
								</div>
							)}
							{propertyId && loading && (
								<div className="text-center py-5">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">{t('common.loading')}</span>
									</div>
									<p className="mt-3">{t('propertyDetails.loadingRentalListing')}</p>
								</div>
							)}
							{propertyId && !loading && loadError && (
								<div className="alert alert-danger mb-4" role="alert">
									{loadError}
								</div>
							)}
							{propertyId && !loading && property && (
								<>
									<div className="row">
										<div className="col-xl-8">
											<div className="mb-4 d-inline-flex align-center justify-content-between w-100 flex-wrap gap-1">
												<div className="d-inline-flex align-center gap-2">
													<span className="badge bg-danger d-flex align-items-center">
														<i className="material-icons-outlined fs-14 me-1">generating_tokens</i> {t('propertyDetails.trending')}
													</span>
													<span className="badge bg-orange d-flex align-items-center">
														<i className="material-icons-outlined fs-14 me-1">loyalty</i> {t('propertyDetails.featured')}
													</span>
													{hasPanoramas && (
														<button
															type="button"
															className="btn btn-sm d-flex align-items-center text-white border-0 shadow-sm px-3"
															onClick={() => setIsTourModalOpen(true)}
															style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
														>
															<i className="material-icons-outlined fs-14 me-1">panorama</i>
															{t('propertyDetails.view360Tour')}
														</button>
													)}
												</div>
												<p className="mb-0 text-dark">{t('propertyDetails.rentalListing')}</p>
											</div>

											<div className="slider-card service-slider-card mb-4 overflow-hidden bg-white border rounded-4 shadow-sm">
												<div className="position-relative">
													<img
														src={heroSlides[safeHeroIndex] || heroSlides[0]}
														className="w-100 d-block bg-light"
														alt={property.title}
														style={{
															objectFit: 'contain',
															height: 'clamp(220px, 52vw, 384px)',
														}}
													/>
													{canNavigateHero && (
														<>
															<button
																type="button"
																className="position-absolute top-50 start-0 translate-middle-y ms-2 d-flex align-items-center justify-content-center border-0 rounded-circle text-white"
																style={{ width: 40, height: 40, zIndex: 6, background: 'rgba(0,0,0,0.5)' }}
																onClick={goHeroPrev}
																aria-label={t('propertyDetails.previousPhoto')}
															>
																<i className="material-icons-outlined">chevron_left</i>
															</button>
															<button
																type="button"
																className="position-absolute top-50 end-0 translate-middle-y me-2 d-flex align-items-center justify-content-center border-0 rounded-circle text-white"
																style={{ width: 40, height: 40, zIndex: 6, background: 'rgba(0,0,0,0.5)' }}
																onClick={goHeroNext}
																aria-label={t('propertyDetails.nextPhoto')}
															>
																<i className="material-icons-outlined">chevron_right</i>
															</button>
															<div
																className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill text-white small fw-semibold"
																style={{ zIndex: 6, background: 'rgba(0,0,0,0.5)', fontSize: '11px' }}
															>
																{safeHeroIndex + 1}/{heroSlides.length}
															</div>
														</>
													)}
													<div
														className="position-absolute start-0 end-0 bottom-0 d-flex align-items-end justify-content-between px-3 py-3 text-white"
														style={{
															zIndex: 5,
															background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
														}}
													>
														<div>
															<div className="fw-semibold fs-5">{formattedPrice}</div>
															<p className="mb-0 small text-white-50">
																{property.city}
																{property.country ? `, ${property.country}` : `, ${t('propertyPages.countryFallback')}`}
															</p>
														</div>
														{typeDisplayLabel && (
															<span
																className="px-3 py-1 small fw-semibold text-white rounded-pill text-uppercase"
																style={{ background: 'rgba(79, 70, 229, 0.92)' }}
															>
																{typeDisplayLabel}
															</span>
														)}
													</div>
													{hasPanoramas && (
														<button
															type="button"
															className="btn btn-sm text-white border-0 shadow position-absolute d-flex align-items-center gap-1"
															style={{
																bottom: '72px',
																left: '12px',
																zIndex: 7,
																background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
																padding: '8px 14px',
																borderRadius: '999px',
																fontWeight: 600,
															}}
															onClick={() => setIsTourModalOpen(true)}
															aria-label={t('propertyDetails.open360Aria')}
														>
															<i className="material-icons-outlined" style={{ fontSize: '18px' }}>panorama</i>
															{t('propertyDetails.short360Tour')}
														</button>
													)}
												</div>
												{heroSlides.length > 1 && (
													<div className="row g-1 p-3 border-top" style={{ marginLeft: 0, marginRight: 0 }}>
														{heroSlides.slice(0, 8).map((url, index) => (
															<div className="col-3" key={`thumb-${index}-${url}`}>
																<button
																	type="button"
																	className={`w-100 p-0 border rounded-3 overflow-hidden bg-light ${index === safeHeroIndex ? 'border-primary border-2 shadow-sm' : 'border'
																		}`}
																	style={{ maxHeight: 88 }}
																	onClick={() => setHeroImageIndex(index)}
																	aria-label={t('propertyDetails.showPhotoAria', { index: index + 1 })}
																>
																	<img src={url} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
																</button>
															</div>
														))}
													</div>
												)}
											</div>

											<div className="accordion accordions-items-seperate">


												<div className="accordion-item">
													<div className="accordion-header">
														<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-1" aria-expanded="true">
															{t('propertyDetails.descriptionTitle')}
														</button>
													</div>
													<div id="accordion-1" className="accordion-collapse collapse show">
														<div className="accordion-body">
															<p>{property?.description || t('propertyDetails.noDescription')}</p>
														</div>
													</div>
												</div>


												{property?.detectedFeatures && Object.keys(property.detectedFeatures).length > 0 && (
													<div className="accordion-item border-primary" style={{ borderWidth: '2px', backgroundColor: '#f8f9fa' }}>
														<div className="accordion-header">
															<button className="accordion-button text-primary fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-ai" aria-expanded="true">
																<i className="material-icons-outlined me-2">auto_awesome</i> {t('propertyDetails.aiDetectedFeatures')}
															</button>
														</div>
														<div id="accordion-ai" className="accordion-collapse collapse show">
															<div className="accordion-body">
																<div className="row g-3">
																	<div className="col-12">
																		<p className="mb-2 d-flex align-items-start gap-2">
																			<i className="material-icons-outlined text-success mt-1">category</i>
																			<span>
																				<strong>{t('propertyDetails.detectedObjects')}: </strong>
																				<span className="text-capitalize">{property.detectedFeatures.objects?.length ? property.detectedFeatures.objects.join(', ') : t('propertyDetails.none')}</span>
																			</span>
																		</p>
																	</div>
																	{property.detectedFeatures.roomVotes && Object.keys(property.detectedFeatures.roomVotes).length > 0 && (
																		<div className="col-12">
																			<p className="mb-2 fw-semibold d-flex align-items-center gap-2">
																				<i className="material-icons-outlined text-success">sensor_window</i>
																				{t('propertyDetails.detectedRooms')}:
																			</p>
																			<div className="d-flex flex-wrap gap-2">
																				{Object.entries(property.detectedFeatures.roomVotes)
																					.sort((a, b) => b[1] - a[1])
																					.map(([room, votes]) => (
																						<span key={room} className={`badge rounded-pill px-3 py-2 ${room === property.detectedFeatures.inferredRoom ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '13px' }}>
																							<i className="material-icons-outlined me-1" style={{ fontSize: '14px', verticalAlign: 'middle' }}>meeting_room</i>
																							{room.replace(/_/g, ' ')}
																							<span className="ms-1 opacity-75 small">({votes})</span>
																						</span>
																					))}
																			</div>
																		</div>
																	)}
																</div>
															</div>
														</div>
													</div>
												)}

												<div className="accordion-item">
													<div className="accordion-header">
														<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-2" aria-expanded="true">
															{t('propertyDetails.propertyFeaturesTitle')}
														</button>
													</div>
													<div id="accordion-2" className="accordion-collapse collapse show">
														<div className="accordion-body">
															<div className="row row-gap-4">
																<div className="col-lg-3 col-md-6">
																	<div className="buy-property-items">
																		<p>
																			<i className="material-icons-outlined">bed</i> Bedrooms: {property?.rooms ?? t('propertyDetails.noDescription')}
																		</p>
																		<p>
																			<i className="material-icons-outlined">straighten</i> Area: {property?.surface ?? t('propertyDetails.noDescription')} m2
																		</p>
																		<p>
																			<i className="material-icons-outlined">sell</i> Status: {property?.status || t('propertyDetails.noDescription')}
																		</p>
																	</div>
																</div>
																<div className="col-lg-3 col-md-6">
																	<div className="buy-property-items">
																		<p>
																			<i className="material-icons-outlined">bathtub</i> Bathrooms: {property?.bathrooms ?? t('propertyDetails.noDescription')}
																		</p>
																		<p>
																			<i className="material-icons-outlined">home_work</i> Listing: {listingLabel}
																		</p>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>


												<div className="accordion-item">
													<div className="accordion-header">
														<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-3" aria-expanded="true">
															{t('propertyDetails.aboutPropertyTitle')}
														</button>
													</div>
													<div id="accordion-3" className="accordion-collapse collapse show">
														<div className="accordion-body">
															<p className="mb-2 text-body">
																This rental offers a practical mix of comfort, accessibility, and neighborhood amenities - consistent with the
																description and photos in this listing.
															</p>
															<p className="mb-2 text-body">
																Located in <strong>{property?.city || t('propertyDetails.noDescription')}</strong>
																{property?.country ? `, ${property.country}` : ', Tunisia'}, it is listed for rent on Smart Property.
															</p>
															<p className="mb-2 text-body">
																<i className="fa-solid fa-circle-check text-success me-2" />
																{property?.surface != null
																	? `Interior surface around ${property.surface} m2 (as listed).`
																	: 'See property features for size and room counts.'}
															</p>
															<p className="mb-2 text-body">
																<i className="fa-solid fa-circle-check text-success me-2" />
																Type: <strong>{typeDisplayLabel || t('propertyDetails.noDescription')}</strong>
																{property?.rooms != null ? ` · ${property.rooms} rooms` : ''}
																{property?.bathrooms != null ? ` · ${property.bathrooms} bathrooms` : ''}
															</p>
															<p className="mb-0 text-body">
																<i className="fa-solid fa-circle-check text-success me-2" />
																Use the booking form to request dates and budget; the owner will be notified instantly.
															</p>
														</div>
													</div>
												</div>


												{/* <div className="accordion-item">
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
								</div> */}


												{/* <div className="accordion-item">
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
								</div> */}

												{hasPanoramas && (
													<div className="accordion-item">
														<div className="accordion-header">
															<button
																className="accordion-button"
																type="button"
																data-bs-toggle="collapse"
																data-bs-target="#accordion-rent-360"
																aria-expanded="true"
															>
																{t('propertyDetails.virtualTourTitle')}
															</button>
														</div>
														<div id="accordion-rent-360" className="accordion-collapse collapse show">
															<div className="accordion-body p-0 overflow-hidden bg-black">
																<PanoViewer panoramas={tourPanoramas} variant="immersive" />
															</div>
														</div>
													</div>
												)}

												<div className="accordion-item">
													<div className="accordion-header">
														<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-6" aria-expanded="true">
															{t('propertyDetails.galleryTitle')}
														</button>
													</div>
													<div id="accordion-6" className="accordion-collapse collapse show">
														<div className="accordion-body gallery-body">
															<div className="gallery-slider">
																{propertyImages.length > 0 ? (
																	propertyImages.map((src, idx) => (
																		<div key={`g-${idx}-${src}`} className="gallery-card">
																			<a
																				href={src}
																				data-fancybox="rent-property-gallery"
																				data-caption={property?.title || ''}
																				className="gallery-item rounded"
																			>
																				<img src={src} alt="" className="rounded img-fluid" />
																			</a>
																		</div>
																	))
																) : (
																	<p className="text-body mb-0">{t('propertyDetails.noPhotos')}</p>
																)}
															</div>
														</div>
													</div>
												</div>

												{/* Video & FAQ hidden - template-only (same as Buy details) */}

												<div className="accordion-item mb-xl-0">
													<div className="accordion-header">
														<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-9" aria-expanded="true">
															{t('propertyDetails.reviewsTitle')}
														</button>
													</div>
													<div id="accordion-9" className="accordion-collapse collapse show">
														<div className="accordion-body">
															<ReviewSection propertyId={property?._id || propertyId} currentUser={currentUser} />
															{Boolean(0) && (<div style={{ display: 'none' }}>
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
															</div>)}

														</div>
													</div>
												</div>
											</div>

										</div>

										<div className="col-xl-4 theiaStickySidebar buy-details-item">

											{/* Contact Channels */}
											<div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
												<div className="card-header bg-white border-0 pt-4 px-4 pb-0">
													<h5 className="mb-0 fw-semibold text-dark fs-5" style={{ letterSpacing: '-0.3px' }}>{t('propertyDetails.listingOwnerDetails')}</h5>
												</div>
												<div className="card-body p-4">
													<div className="d-flex flex-column gap-3 mb-4 text-dark">
														{ownerProfile?.email && (
															<div className="d-flex align-items-center gap-3">
																<div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: '36px', height: '36px', backgroundColor: '#f3f4f6' }}>
																	<i className="material-icons-outlined text-muted" style={{ fontSize: '18px' }}>email</i>
																</div>
																<div>
																	<p className="mb-0 small text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>Email</p>
																	<p className="mb-0 fw-medium">{ownerProfile.email}</p>
																</div>
															</div>
														)}
														{ownerProfile?.phone && (
															<div className="d-flex align-items-center gap-3">
																<div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: '36px', height: '36px', backgroundColor: '#f3f4f6' }}>
																	<i className="material-icons-outlined text-muted" style={{ fontSize: '18px' }}>phone</i>
																</div>
																<div>
																	<p className="mb-0 small text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>Phone</p>
																	<p className="mb-0 fw-medium">{ownerProfile.phone}</p>
																</div>
															</div>
														)}
														{ownerProfile?.whatsappDigits && (
															<div className="d-flex align-items-center gap-3">
																<div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: '36px', height: '36px', backgroundColor: '#ecfdf5' }}>
																	<i className="material-icons-outlined text-success" style={{ fontSize: '18px' }}>chat</i>
																</div>
																<div>
																	<p className="mb-0 small text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>WhatsApp</p>
																	<p className="mb-0 fw-medium">{ownerProfile.whatsappDigits}</p>
																</div>
															</div>
														)}
													</div>

													<div className="d-flex gap-2">
														{ownerProfile?.whatsappDigits && (
															<a
																href={`https://wa.me/${ownerProfile.whatsappDigits}`}
																target="_blank"
																rel="noopener noreferrer"
																className="btn flex-grow-1 d-flex align-items-center justify-content-center text-white rounded-pill fw-medium transition-all"
																style={{ backgroundColor: '#10b981', border: 'none' }}
															>
																<i className="material-icons-outlined me-1" style={{ fontSize: '18px' }}>chat</i> WhatsApp
															</a>
														)}
														{ownerProfile?.email && (
															<a
																href={`mailto:${ownerProfile.email}?subject=${encodeURIComponent(ownerEmailSubject || '')}`}
																className="btn flex-grow-1 d-flex align-items-center justify-content-center text-white rounded-pill fw-medium transition-all"
																style={{ backgroundColor: '#111827', border: 'none' }}
															>
																<i className="material-icons-outlined me-1" style={{ fontSize: '18px' }}>email</i> Email
															</a>
														)}
													</div>
												</div>
											</div>

											{/* Rent/Booking Card */}
											<div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
												<div className="card-header bg-white border-0 pt-4 pb-0 px-4">
													<h5 className="mb-0 fw-semibold text-dark fs-5" style={{ letterSpacing: '-0.3px' }}>{t('propertyDetails.smartBookingRequest') || 'Rent this Property'}</h5>
												</div>
												<div className="card-body p-4">
													{isBookingBlocked ? (
														<div className="alert border-0 rounded-4 py-3 px-3 mb-3" style={{ backgroundColor: '#fffbeb', color: '#b45309' }} role="alert">
															{blockingLease.status === 'PENDING' ? (
																<>You already have a <strong>pending</strong> rental request.</>
															) : (
																<>You have an active or upcoming stay until <strong>{blockingLease.endDate ? new Date(blockingLease.endDate).toLocaleDateString() : '—'}</strong>.</>
															)}
														</div>
													) : (
														<>
															<div className="mb-4">
																<label className="form-label fw-medium small text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>Duration</label>
																<input
																	type="text"
																	className="form-control form-control-lg rounded-3 shadow-none fw-medium text-dark"
																	value="1 Month (Auto-renewing)"
																	readOnly
																	disabled
																	style={{ border: '1px solid #e5e7eb', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
																/>
															</div>

															<div className="mb-4">
																<label className="form-label fw-medium small text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>Price (TND)</label>
																<input
																	type="text"
																	className="form-control form-control-lg rounded-3 shadow-none fw-medium text-dark"
																	value={`${property?.price || ''} TND`}
																	readOnly
																	disabled
																	style={{ border: '1px solid #e5e7eb', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
																/>
															</div>

															{paymentStatus.hasOwnerWallet && (
																<div className="mt-2">
																	<button
																		type="button"
																		className="btn w-100 py-3 fs-16 d-flex align-items-center justify-content-center gap-2 rounded-pill transition-all text-white"
																		style={{ backgroundColor: '#111827', border: 'none', fontWeight: '500', letterSpacing: '0.3px' }}
																		onClick={handleInstaPay}
																		disabled={paymentModalState.status === 'processing' || !paymentStatus.hasTenantWallet}
																	>
																		{paymentModalState.status === 'processing' ? (
																			<span className="spinner-border spinner-border-sm me-2 text-white" role="status" aria-hidden="true"></span>
																		) : (
																			<i className="material-icons-outlined text-white" style={{ fontSize: '20px' }}>account_balance_wallet</i>
																		)}
																		<span className="text-white">{paymentModalState.status === 'processing' ? t('propertyDetails.processing') : 'Pay Now with EasyWallet'}</span>
																	</button>
																	{!paymentStatus.hasTenantWallet && (
																		<p className="text-muted small mt-3 text-center mb-0">
																			{t('propertyDetails.linkWalletToPay') || 'Link your wallet to pay'} <Link to="/profile-settings" className="text-dark fw-medium text-decoration-none border-bottom border-dark pb-1">{t('propertyDetails.profileSettings') || 'Settings'}</Link>
																		</p>
																	)}
																</div>
															)}

															{!paymentStatus.hasOwnerWallet && (
																<div className="alert border-0 rounded-4 py-3 px-3 small mb-3" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
																	<i className="material-icons-outlined me-2 position-relative" style={{ top: '3px', fontSize: '18px' }}>info</i>
																	{t('propertyDetails.ownerNoWallet') || 'Property owner has not connected a wallet yet.'}
																</div>
															)}
														</>
													)}
												</div>
											</div>

											<div className="card">
												<div className="card-header">
													<h5 className="mb-0">{t('propertyDetails.whyBookWithUs')}</h5>
												</div>
												<div className="card-body">
													<div className="mb-0">
														<p className="d-flex align-items-center gap-2 mb-3 text-body"><i className="material-icons-outlined text-secondary">badge</i> {t('propertyDetails.expertiseExperience')}</p>
														<p className="d-flex align-items-center gap-2 mb-3 text-body"><i className="material-icons-outlined text-secondary">design_services</i> {t('propertyDetails.tailoredServices')}</p>
														<p className="d-flex align-items-center gap-2 mb-3 text-body"><i className="material-icons-outlined text-secondary">play_lesson</i> {t('propertyDetails.comprehensivePlanning')}</p>
														<p className="d-flex align-items-center gap-2 mb-3 text-body"><i className="material-icons-outlined text-secondary">person</i> {t('propertyDetails.clientSatisfaction')}</p>
														<p className="d-flex align-items-center gap-2 mb-0 text-body"><i className="material-icons-outlined text-secondary">support_agent</i> {t('propertyDetails.support247')}</p>
													</div>
												</div>
											</div>


											<div className="card mb-0 border rounded-4 shadow-sm overflow-hidden">
												<div className="card-header bg-white border-bottom py-3">
													<h5 className="mb-0 fs-6 fw-semibold">{t('propertyDetails.nearbyTitle')}</h5>
												</div>
												<div className="card-body">
													<div className="rounded-4 border overflow-hidden mb-3" style={{ height: 176 }}>
														{mapPosition ? (
															<MapContainer
																key={mapKey}
																center={[mapLat, mapLng]}
																zoom={15}
																scrollWheelZoom={false}
																style={{ height: '100%', width: '100%' }}
																className="z-0"
															>
																<RentDetailsMapFlyTo lat={mapLat} lng={mapLng} />
																<TileLayer
																	attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
																	url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
																/>
																<Marker position={[mapLat, mapLng]}>
																	<Popup>
																		<div className="small">
																			<div className="fw-semibold">{property?.title}</div>
																			<div className="text-muted">{displayAddressForMap}</div>
																		</div>
																	</Popup>
																</Marker>
															</MapContainer>
														) : (
															<div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted small">
																{t('propertyDetails.loadingMap')}
															</div>
														)}
													</div>
													<div className="px-3 py-2 border rounded-4 bg-light mb-3">
														<p className="mb-0 text-uppercase fw-semibold text-muted" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
															{t('propertyDetails.propertyAddress')}
														</p>
														<p className="mb-0 mt-1 fw-medium text-dark">{displayAddressForMap || t('propertyDetails.noDescription')}</p>
													</div>
													<ul className="list-unstyled small text-body mb-0">
														<li className="d-flex align-items-center gap-2 mb-2">
															<span className="text-success">+</span>
															{t('propertyDetails.nearAttractions')}
														</li>
														<li className="d-flex align-items-center gap-2 mb-2">
															<span className="text-success">+</span>
															{t('propertyDetails.easyTransport')}
														</li>
														<li className="d-flex align-items-center gap-2 mb-0">
															<span className="text-success">+</span>
															{t('propertyDetails.shopsNearby')}
														</li>
													</ul>
												</div>
											</div>

										</div>
									</div>

								</>
							)}

						</div>
					</div>

					{isTourModalOpen && hasPanoramas && createPortal(
						<div
							className="rent-details-tour-overlay"
							style={{
								position: 'fixed',
								inset: 0,
								zIndex: 10050,
								background: '#000',
								display: 'flex',
								flexDirection: 'column',
							}}
							role="dialog"
							aria-modal="true"
							aria-label={t('propertyDetails.virtualTourAria')}
						>
							<div
								className="d-flex align-items-center justify-content-between flex-shrink-0 px-3 py-2 border-bottom border-secondary"
								style={{ background: 'rgba(30,35,45,0.98)', borderColor: 'rgba(255,255,255,0.12)' }}
							>
								<span className="text-white fw-semibold d-flex align-items-center gap-2 mb-0">
									<i className="material-icons-outlined text-white">panorama</i>
									{t('propertyDetails.virtualTourTitle')}
								</span>
								<button type="button" className="btn btn-sm btn-outline-light" onClick={closeTourModal}>
									{t('common.close')}
								</button>
							</div>
							<div className="flex-grow-1 position-relative" style={{ minHeight: 0, background: '#000' }}>
								<PanoViewer panoramas={tourPanoramas} variant="immersive" fillHeight />
							</div>
						</div>,
						document.body
					)}

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

				{paymentModalState.show && createPortal(
					<div
						className="modal fade show d-block"
						style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
						tabIndex="-1"
						role="dialog"
					>
						<div className="modal-dialog modal-dialog-centered" role="document">
							<div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px', overflow: 'hidden' }}>
								<div className="modal-header border-0 pb-0 justify-content-between align-items-center pt-4 px-4">
									<h5 className="modal-title fw-semibold text-dark fs-5" style={{ letterSpacing: '-0.3px' }}>
										{paymentModalState.status === 'success' ? 'Payment Success' : 'Payment Transfer'}
									</h5>
									{paymentModalState.status !== 'processing' && (
										<button
											type="button"
											className="btn-close shadow-none"
											onClick={() => setPaymentModalState(prev => ({ ...prev, show: false }))}
											aria-label="Close"
										></button>
									)}
								</div>
								<div className="modal-body text-center mt-0 px-4 pb-4 px-sm-5 pb-sm-5 pt-3">
									{paymentModalState.status === 'confirm' && (
										<>
											<p className="text-muted mb-4" style={{ fontSize: '15px' }}>
												Review the amount before paying securely with your wallet.
											</p>
											<div className="py-4 mb-4" style={{ borderBottom: '1px solid #f3f4f6', borderTop: '1px solid #f3f4f6' }}>
												<p className="mb-0 text-muted small text-uppercase fw-semibold tracking-wider">Amount</p>
												<h2 className="display-5 fw-bold mb-0 text-dark" style={{ letterSpacing: '-1px' }}>
													{Number(paymentStatus.amount || property?.price).toLocaleString()} <span className="fs-5 fw-normal text-muted">TND</span>
												</h2>
											</div>
											<button
												className="btn w-100 py-3 rounded-pill fw-medium transition-all"
												style={{ backgroundColor: '#111827', color: '#fff', fontSize: '16px' }}
												onClick={proceedPayment}
											>
												Confirm Payment
											</button>
										</>
									)}

									{paymentModalState.status === 'processing' && (
										<div className="py-5">
											<div className="spinner-border text-dark" style={{ width: '2.5rem', height: '2.5rem', borderWidth: '2px' }} role="status">
												<span className="visually-hidden">Loading...</span>
											</div>
											<p className="mt-4 fw-medium text-dark fs-5">Processing...</p>
											<p className="small text-muted mb-0">Please wait</p>
										</div>
									)}

									{paymentModalState.status === 'success' && (
										<div className="py-4">
											<div className="mb-4 mx-auto d-flex justify-content-center align-items-center rounded-circle" style={{ width: '64px', height: '64px', backgroundColor: '#f0fdf4' }}>
												<i className="material-icons-outlined text-success" style={{ fontSize: '32px' }}>check</i>
											</div>
											<p className="text-muted mb-4 fs-6">Transfer of <strong className="text-dark">{Number(paymentStatus.amount || property?.price).toLocaleString()} TND</strong> completed securely.</p>
											<button
												className="btn w-100 py-3 rounded-pill fw-medium"
												style={{ backgroundColor: '#f3f4f6', color: '#111827' }}
												onClick={() => setPaymentModalState(prev => ({ ...prev, show: false }))}
											>
												Close
											</button>
										</div>
									)}

									{paymentModalState.status === 'error' && (
										<div className="py-4">
											<div className="mb-4 mx-auto d-flex justify-content-center align-items-center rounded-circle" style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2' }}>
												<i className="material-icons-outlined text-danger" style={{ fontSize: '32px' }}>close</i>
											</div>
											<p className="text-dark fw-semibold fs-5 mb-1">Payment Failed</p>
											<p className="text-muted mb-4">{paymentModalState.errorMessage}</p>
											<button
												className="btn w-100 py-3 rounded-pill fw-medium"
												style={{ backgroundColor: '#111827', color: '#fff' }}
												onClick={() => setPaymentModalState(prev => ({ ...prev, status: 'confirm', errorMessage: '' }))}
											>
												Try Again
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}
			</div>
		</div>
	);
};

export default RentDetails;
