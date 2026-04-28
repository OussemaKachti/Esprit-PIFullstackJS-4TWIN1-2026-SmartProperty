import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

const toDateInputValue = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return date.toISOString().slice(0, 10);
};

const TODAY_DATE_INPUT = toDateInputValue(new Date());

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

	const startDateMin = TODAY_DATE_INPUT;
	const endDateMin = bookingForm.startDate || TODAY_DATE_INPUT;
	const isBookingBlocked = Boolean(blockingLease && blockingLease.status !== 'CANCELLED');

	const [property, setProperty] = useState(null);
	const [loading, setLoading] = useState(false);
	const [loadError, setLoadError] = useState(null);
	const [ratingSummary, setRatingSummary] = useState({ averageRating: '0.0', totalReviews: 0 });
	const [mapPosition, setMapPosition] = useState(null);
	const [heroImageIndex, setHeroImageIndex] = useState(0);
	const [isTourModalOpen, setIsTourModalOpen] = useState(false);

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
			return;
		}
		const addressParts = [
			property.address,
			property.city,
			property.region,
			property.country || t('propertyPages.countryFallback'),
		].filter(Boolean);

		if (addressParts.length === 0) {
			const coords = property.location?.coordinates;
			if (coords && Array.isArray(coords) && coords.length === 2) {
				const [lon, lat] = coords;
				if (Number.isFinite(lon) && Number.isFinite(lat) && lon !== 0 && lat !== 0) {
					setMapPosition([lat, lon]);
					return;
				}
			}
			setMapPosition([...DEFAULT_MAP_CENTER]);
			return;
		}

		const query = addressParts.join(', ');
		const geocodeTimer = setTimeout(async () => {
			try {
				let res = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=tn`,
					{ headers: { 'User-Agent': 'SmartProperty/1.0 (rent-details)' } }
				);
				let data = await res.json();
				if (!data || data.length === 0) {
					const simple = [property.address, property.city].filter(Boolean).join(', ');
					res = await fetch(
						`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simple)}&limit=1&addressdetails=1&countrycodes=tn`,
						{ headers: { 'User-Agent': 'SmartProperty/1.0 (rent-details)' } }
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
			} catch {
				setMapPosition([...DEFAULT_MAP_CENTER]);
			}
		}, 500);
		return () => clearTimeout(geocodeTimer);
	}, [property, t]);

	useEffect(() => {
		setBookingForm((prev) => ({ ...prev, note: t('propertyDetails.bookingRequestDefaultNote') }));
	}, [t]);

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
		if (property?.price && !bookingForm.rentAmount) {
			setBookingForm((prev) => ({ ...prev, rentAmount: String(property.price) }));
		}
	}, [property?.price, bookingForm.rentAmount]);

	useEffect(() => {
		let cancelled = false;
		const tenantId = currentUser?._id || currentUser?.id;
		if (!propertyId || !tenantId) {
			setBlockingLease(null);
			return () => {
				cancelled = true;
			};
		}
		(async () => {
			try {
				const data = await apiRequest(
					`/api/leases?propertyId=${encodeURIComponent(propertyId)}&tenantId=${encodeURIComponent(tenantId)}&limit=50`
				);
				const leases = data?.data?.leases || [];
				const block = pickBlockingLease(leases);
				if (!cancelled) setBlockingLease(block || null);
			} catch {
				if (!cancelled) setBlockingLease(null);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [propertyId, currentUser]);

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

	const handleBookingChange = (field) => (event) => {
		const value = event.target.value;
		setBookingForm((prev) => {
			const next = { ...prev, [field]: value };
			if (field === 'startDate' && next.endDate && next.endDate < value) {
				next.endDate = '';
			}
			return next;
		});
	};

	const handleSendBooking = async () => {
		setErrorMessage('');
		setSuccessMessage('');

		const userId = currentUser?._id || currentUser?.id;

		if (!propertyId) {
			setErrorMessage(t('propertyDetails.missingPropertyIdentifier'));
			return;
		}

		if (!currentUser || !userId) {
			setErrorMessage(t('propertyDetails.signInToBook'));
			return;
		}

		if (!bookingForm.startDate || !bookingForm.endDate || !bookingForm.rentAmount) {
			setErrorMessage(t('propertyDetails.chooseDatesBudget'));
			return;
		}

		if (bookingForm.startDate < TODAY_DATE_INPUT) {
			setErrorMessage('Start date cannot be earlier than today.');
			return;
		}

		if (bookingForm.endDate <= bookingForm.startDate) {
			setErrorMessage('End date must be after the start date.');
			return;
		}

		const offerPrice = Number(bookingForm.rentAmount);
		if (!Number.isFinite(offerPrice) || offerPrice <= 0) {
			setErrorMessage('Offer price must be greater than 0.');
			return;
		}

		setIsSending(true);
		try {
			const payload = {
				propertyId,
				tenantId: userId,
				startDate: bookingForm.startDate,
				endDate: bookingForm.endDate,
				rentAmount: Number(bookingForm.rentAmount),
				charges: 0,
				status: 'PENDING',
			};

			await apiRequest('/api/leases', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			setBlockingLease({
				status: 'PENDING',
				endDate: bookingForm.endDate,
				startDate: bookingForm.startDate,
			});
		} catch (error) {
			setErrorMessage(error.message || t('propertyDetails.couldNotSendRequest'));
		} finally {
			setIsSending(false);
		}
	};
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

											<div className="card">
												<div className="card-header">
													<h5 className="mb-0">{t('propertyDetails.listingOwnerDetails')}</h5>
												</div>
												<div className="card-body">
													<div className="d-flex align-items-center gap-2 mb-3">
														<div
															className="avatar avatar-lg rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-semibold fs-18"
															style={{ width: 56, height: 56, minWidth: 56 }}
															aria-hidden
														>
															{ownerProfile.initials}
														</div>
														<div>
															<h6 className="mb-1 fs-16 fw-semibold">{ownerProfile.displayName}</h6>
															<p className="mb-0 fs-14 text-body">
																{t('propertyDetails.thisListingRating', { rating: ratingSummary.averageRating || '0.0', total: ratingSummary.totalReviews || 0 })}
															</p>
														</div>
													</div>
													<ul className="mb-3 list-unstyled">
														<li className="d-flex align-center justify-content-between flex-wrap gap-1 mb-3">
															<span className="text-body">{t('propertyDetails.phone')}</span>
															<span className="text-end">{ownerProfile.phone || t('propertyDetails.noDescription')}</span>
														</li>
														<li className="d-flex align-center justify-content-between flex-wrap gap-1 mb-3">
															<span className="text-body">{t('propertyDetails.email')}</span>
															<span className="text-end text-break">
																{ownerProfile.email ? (
																	<a href={`mailto:${ownerProfile.email}`} className="text-primary">
																		{ownerProfile.email}
																	</a>
																) : (
																		t('propertyDetails.noDescription')
																)}
															</span>
														</li>
														<li className="d-flex align-center justify-content-between flex-wrap gap-1 mb-3">
															<span className="text-body">{t('propertyDetails.memberSince')}</span>
															<span>{ownerProfile.memberSince || t('propertyDetails.noDescription')}</span>
														</li>
														<li className="d-flex align-center justify-content-between flex-wrap gap-1 mb-0">
															<span className="text-body">{t('propertyDetails.account')}</span>
															<div className="badge bg-success text-white">{t('propertyDetails.registered')}</div>
														</li>
													</ul>
													<div className="d-flex align-items-center justify-content-between gap-3">
														{ownerProfile.whatsappDigits ? (
															<a
																href={`https://wa.me/${ownerProfile.whatsappDigits}`}
																target="_blank"
																rel="noopener noreferrer"
																className="btn btn-primary d-flex align-center fs-14 fw-medium w-100 justify-content-center"
															>
																{t('propertyDetails.whatsapp')}
															</a>
														) : (
															<span className="btn btn-secondary disabled w-100">{t('propertyDetails.whatsapp')}</span>
														)}
														{ownerProfile.email ? (
															<a
																href={`mailto:${ownerProfile.email}?subject=${ownerEmailSubject}`}
																className="btn btn-dark d-flex align-center fs-14 fw-medium w-100 text-center justify-content-center"
															>
																{t('propertyDetails.emailOwner')}
															</a>
														) : (
															<span className="btn btn-secondary disabled w-100">{t('propertyDetails.emailOwner')}</span>
														)}
													</div>
												</div>
											</div>


											<div className="card">
												<div className="card-header d-flex align-items-center justify-content-between">
													<h5 className="mb-0">{t('propertyDetails.smartBookingRequest')}</h5>
													<span className="badge bg-primary">Live</span>
												</div>
												<div className="card-body">
													<div className="alert alert-info py-2 mb-3">
														<div className="fw-semibold">{t('propertyDetails.notifyOwnerInstantly')}</div>
													</div>

													{isBookingBlocked && (
														<div id="booking-blocked-msg" className="alert alert-warning py-2 mb-3 small" role="alert" aria-live="assertive">
															{blockingLease.status === 'PENDING' ? (
																<>
																	You already have a <strong>pending</strong> rental request for this listing.
																</>
															) : (
																<>
																	You have an active or upcoming stay until{' '}
																	<strong>
																		{blockingLease.endDate
																			? new Date(blockingLease.endDate).toLocaleDateString()
																			: t('propertyDetails.noDescription')}
																	</strong>
																	.
																</>
															)}{' '}
															Send another request only after your rental <strong>end date</strong> has passed.
														</div>
													)}

													<div className="mb-3">
														<label className="form-label fw-semibold">{t('propertyDetails.startDate')}</label>
														<input
															type="date"
															className="form-control"
															min={startDateMin}
															value={bookingForm.startDate}
															onChange={handleBookingChange('startDate')}
															disabled={isBookingBlocked}
														/>
													</div>

													<div className="mb-3">
														<label className="form-label fw-semibold">{t('propertyDetails.endDate')}</label>
														<input
															type="date"
															className="form-control"
															min={endDateMin}
															value={bookingForm.endDate}
															onChange={handleBookingChange('endDate')}
															disabled={isBookingBlocked}
														/>
													</div>

													<div className="mb-3">
														<label className="form-label fw-semibold">{t('propertyDetails.yourBudgetTnd')}</label>
														<input
															type="number"
															min="0"
															step="1"
															className="form-control"
															placeholder={t('propertyDetails.budgetPlaceholder')}
															value={bookingForm.rentAmount}
															onChange={handleBookingChange('rentAmount')}
															disabled={isBookingBlocked}
														/>
													</div>

													<div className="mb-3">
														<label className="form-label fw-semibold">{t('propertyDetails.messageToOwner')}</label>
														<textarea
															className="form-control"
															rows="3"
															value={bookingForm.note}
															onChange={handleBookingChange('note')}
															disabled={isBookingBlocked}
														/>
													</div>

													{successMessage && (
														<div id="booking-success-msg" className="alert alert-success py-2 mb-3" role="status" aria-live="polite">{successMessage}</div>
													)}
													{errorMessage && (
														<div id="booking-error-msg" className="alert alert-danger py-2 mb-3" role="alert" aria-live="assertive">{errorMessage}</div>
													)}

													<button
														type="button"
														className="btn btn-dark w-100 py-2 fs-14 d-flex align-items-left justify-content-center gap-2 text-center"
														style={{ color: '#fff' }}
														aria-busy={isSending}
														aria-disabled={isSending || isBookingBlocked}
														aria-describedby={[
															isBookingBlocked ? 'booking-blocked-msg' : null,
															errorMessage ? 'booking-error-msg' : null,
															successMessage ? 'booking-success-msg' : null,
															!propertyId ? 'booking-open-from-card-msg' : null,
															!currentUser ? 'booking-signin-msg' : null,
														].filter(Boolean).join(' ') || undefined}
														onClick={handleSendBooking}
														disabled={isSending || isBookingBlocked}
													>
														<span className="text-white">{isSending ? t('propertyDetails.sending') : t('propertyDetails.sendRentalRequest')}</span>
													</button>
													{!propertyId && (
														<p id="booking-open-from-card-msg" className="text-danger small mt-2 mb-0">{t('propertyDetails.openFromPropertyCard')}</p>
													)}
													{!currentUser && (
														<p id="booking-signin-msg" className="text-muted small mt-2 mb-0">{t('propertyDetails.signInAutoAttach')}</p>
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

							{/* <div className="row row-gap-4 custom-properties-items">


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

							</div> */}


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




			</div>
		</div>
	);
};

export default RentDetails;



