import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getImageUrl, getPropertyById, API_BASE_URL, getFeedbackSummaryByPropertyIds } from '../services/propertyService';
import { apiRequest } from '../api/client';
import { getUserData } from '../utils/auth';
import { normalizePanoramas } from '../utils/panoramaUtils';
import PanoViewer from '../components/PanoViewer';
import ReviewSection from '../components/ReviewSection';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function BuyDetailsMapFlyTo({ lat, lng }) {
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

/** Long listing text: show preview + working Read more / Read less */
const DESCRIPTION_PREVIEW_MAX = 320;

const BuyDetails = () => {
	const { id } = useParams();
	const [currentUser] = useState(() => getUserData());
	const [property, setProperty] = useState(null);
	const [loading, setLoading] = useState(Boolean(id));
	const [error, setError] = useState(null);
	const [ratingSummary, setRatingSummary] = useState({ averageRating: '0.0', totalReviews: 0 });
	const [mapPosition, setMapPosition] = useState(null);

	// Virtual Staging states
	const [isTourModalOpen, setIsTourModalOpen] = useState(false);
	// Virtual Staging states
	const [showStagingModal, setShowStagingModal] = useState(false);
	const [isStagingLoading, setIsStagingLoading] = useState(false);
	const [stagedResultUrl, setStagedResultUrl] = useState(null);
	const [selectedStyle, setSelectedStyle] = useState('modern');
	const [isEnquirySubmitting, setIsEnquirySubmitting] = useState(false);
	const [blockingSale, setBlockingSale] = useState(null);
	const [descriptionExpanded, setDescriptionExpanded] = useState(false);
	const [enquiryForm, setEnquiryForm] = useState({
		offerPrice: '',
		note: 'I would like to proceed with a purchase request.',
	});

	const handleEnquiryFieldChange = (field) => (event) => {
		setEnquiryForm((prev) => ({
			...prev,
			[field]: event.target.value,
		}));
	};

	const handleEnquirySubmit = async () => {
		if (!property?._id) {
			toast.error('Property not ready yet. Please wait a moment.');
			return;
		}

		const buyerId = currentUser?._id || currentUser?.id;
		if (!buyerId) {
			toast.error('Please sign in to submit an offer.');
			return;
		}

		if (!enquiryForm.offerPrice || Number.isNaN(Number(enquiryForm.offerPrice))) {
			toast.error('Please enter your offer price.');
			return;
		}

		setIsEnquirySubmitting(true);
		try {
			// Create a sale record to trigger backend email + notification to owner
			await apiRequest('/api/sales', {
				method: 'POST',
				body: JSON.stringify({
					propertyId: property._id,
					buyerId,
					price: Number(enquiryForm.offerPrice),
					status: 'PENDING',
				}),
			});

			toast.success('Your purchase request was sent to the property owner.');
			setEnquiryForm({
				offerPrice: '',
				note: 'I would like to proceed with a purchase request.',
			});
			setBlockingSale({ status: 'PENDING' });
		} catch (submitError) {
			toast.error(submitError?.message || submitError?.response?.data?.message || 'Failed to send request.');
		} finally {
			setIsEnquirySubmitting(false);
		}
	};

	useEffect(() => {
		if (property?.price && !enquiryForm.offerPrice) {
			setEnquiryForm((prev) => ({ ...prev, offerPrice: property.price }));
		}
	}, [property?.price, enquiryForm.offerPrice]);

	useEffect(() => {
		let cancelled = false;
		const buyerId = currentUser?._id || currentUser?.id;
		if (!property?._id || !buyerId) {
			setBlockingSale(null);
			return () => {
				cancelled = true;
			};
		}
		(async () => {
			try {
				const data = await apiRequest(
					`/api/sales?propertyId=${encodeURIComponent(property._id)}&buyerId=${encodeURIComponent(buyerId)}&limit=50`
				);
				const sales = data?.data?.sales || [];
				const active = sales.find((s) => s.status !== 'CANCELLED');
				if (!cancelled) setBlockingSale(active || null);
			} catch {
				if (!cancelled) setBlockingSale(null);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [property?._id, currentUser]);

	const handleStagingSubmit = async () => {
		setIsStagingLoading(true);
		try {
			// Step 1: Trigger the backend analysis to check if any image is an empty room
			// In a real application, you might want the user to select *which* image to stage first.
			// Here, we'll run the analysis on all of the property's images.
			const analysisResponse = await axios.post(`${API_BASE_URL}/api/properties/${id}/analyze-images`, {}, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
			});

			// After analysis, fetch the updated property data from the response to check eligibility
			const updatedProperty = analysisResponse.data?.data;
			const eligibleImage = updatedProperty?.images?.find(img => img.isEligibleForStaging);

			if (!eligibleImage) {
				toast.error("Vision Analysis failed to verify this room. Please upload a clear photo of an empty interior.", { duration: 5000 });
				setIsStagingLoading(false);
				return;
			}

			// Step 2: Proceed with Virtual Staging API call since we found an eligible image
			const stageResponse = await axios.post(`${API_BASE_URL}/api/properties/${id}/virtual-staging`, {
				imageId: eligibleImage._id,
				style: selectedStyle,
				roomType: 'living_room'
			}, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
			});

			if (stageResponse.data?.success && stageResponse.data?.data?.stagedImageUrl) {
				const rawUrl = stageResponse.data.data.stagedImageUrl;
				const finalUrl = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL}/${rawUrl}`;
				setStagedResultUrl(finalUrl);
				toast.success("✨ Room staged successfully!", { duration: 3000 });
			} else {
				toast.error("Failed to generate staging.");
			}

		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || "AI Analysis or Staging failed due to an error.", { duration: 5000 });
		} finally {
			setIsStagingLoading(false);
		}
	};

	const closeStagingModal = () => {
		setShowStagingModal(false);
		setStagedResultUrl(null);
		setIsStagingLoading(false);
	};

	const listingLabel = useMemo(() => {
		if (!property?.listingType) return 'For Sale';
		return property.listingType === 'FOR_RENT' ? 'For Rent' : 'For Sale';
	}, [property?.listingType]);

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
		if (price === undefined || price === null || Number.isNaN(Number(price))) return 'N/A';
		return `${Number(price).toLocaleString('en-US').replace(/,/g, ' ')} TND`;
	}, [property?.price]);

	const tourPanoramas = useMemo(
		() => normalizePanoramas(property?.panoramas),
		[property?.panoramas]
	);
	const hasPanoramas = tourPanoramas.length > 0;

	const propertyImages = useMemo(() => {
		if (!property?.images?.length) return [];
		return property.images
			.map((img) => getImageUrl(img))
			.filter(Boolean);
	}, [property?.images]);

	const [heroImageIndex, setHeroImageIndex] = useState(0);

	const heroSlides = useMemo(
		() => (propertyImages.length > 0 ? propertyImages : FALLBACK_HERO_SLIDES),
		[propertyImages]
	);

	useEffect(() => {
		setHeroImageIndex(0);
	}, [id, property?._id, propertyImages.length]);

	useEffect(() => {
		if (heroImageIndex >= heroSlides.length) {
			setHeroImageIndex(0);
		}
	}, [heroSlides.length, heroImageIndex]);

	const ownerProfile = useMemo(() => {
		const o = property?.createdBy;
		if (!o || typeof o !== 'object') {
			return {
				displayName: 'Listing owner',
				email: null,
				phone: null,
				whatsappDigits: '',
				memberSince: null,
				initials: '?',
			};
		}
		const name = [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
		const displayName = name || o.login || o.email || 'Listing owner';
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
	}, [property?.createdBy]);

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

	const descriptionText = (property?.description || '').trim();
	const descriptionNeedsTruncate = descriptionText.length > DESCRIPTION_PREVIEW_MAX;
	const descriptionShown =
		!descriptionText
			? ''
			: !descriptionNeedsTruncate || descriptionExpanded
				? descriptionText
				: (() => {
					let cut = descriptionText.slice(0, DESCRIPTION_PREVIEW_MAX);
					const lastSpace = cut.lastIndexOf(' ');
					if (lastSpace > DESCRIPTION_PREVIEW_MAX * 0.55) cut = cut.slice(0, lastSpace);
					return `${cut.trim()}…`;
				})();

	const displayAddressForMap = useMemo(() => {
		if (!property) return '';
		const addr = property.address?.trim();
		if (addr) return addr;
		return [property.city, property.region, property.country || 'Tunisia'].filter(Boolean).join(', ');
	}, [property]);

	const mapLat = mapPosition ? mapPosition[0] : DEFAULT_MAP_CENTER[0];
	const mapLng = mapPosition ? mapPosition[1] : DEFAULT_MAP_CENTER[1];
	const mapKey = mapPosition ? `${mapPosition[0]}-${mapPosition[1]}` : 'default';

	useEffect(() => {
		setMapPosition(null);
	}, [id]);

	useEffect(() => {
		setDescriptionExpanded(false);
	}, [id]);

	useEffect(() => {
		if (!property) {
			setMapPosition(null);
			return;
		}
		const addressParts = [
			property.address,
			property.city,
			property.region,
			property.country || 'Tunisia',
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
		const t = setTimeout(async () => {
			try {
				let res = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=tn`,
					{ headers: { 'User-Agent': 'SmartProperty/1.0 (buy-details)' } }
				);
				let data = await res.json();
				if (!data || data.length === 0) {
					const simple = [property.address, property.city].filter(Boolean).join(', ');
					res = await fetch(
						`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simple)}&limit=1&addressdetails=1&countrycodes=tn`,
						{ headers: { 'User-Agent': 'SmartProperty/1.0 (buy-details)' } }
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
		return () => clearTimeout(t);
	}, [property]);

	// Image check removed; button will always show now.

	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			if (!id) {
				setLoading(false);
				return;
			}
			setLoading(true);
			setError(null);
			try {
				const data = await getPropertyById(id);
				if (!cancelled) {
					setProperty(data);
					const summary = await getFeedbackSummaryByPropertyIds([id]);
					setRatingSummary(summary?.[id] || { averageRating: '0.0', totalReviews: 0 });
				}
			} catch (e) {
				if (!cancelled) setError('Failed to load property. Please try again.');
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		run();
		return () => {
			cancelled = true;
		};
	}, [id]);

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

	return (
		<div style={{
			minHeight: '100vh',
			overflow: 'visible',
			position: 'relative',
			width: '100%'
		}}>



			<div className="main-wrapper">
				<Toaster position="top-right" />

				<div className="page-wrapper">

					<div className="buy-details-header-item">





						<div className="breadcrumb-bar custom-breadcrumb-bar">
							<div className="container">
								<div className="row align-items-center text-center position-relative z-1">
									<div className="col-xl-8">
										<div className="d-flex align-center gap-2 mb-2">
											<span className="badge bg-primary">{property?.type || 'Property'}</span>
											<span className="badge bg-secondary">{listingLabel}</span>
										</div>
										<h1 className="breadcrumb-title text-start ">{property?.title || 'Property'}</h1>
										<div className="d-flex align-items-center gap-2 flex-wrap gap-1 mb-xl-0 mb-4">
											<div className="d-flex align-items-center justify-content-center">
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<i className="material-icons-outlined text-warning">star</i>
												<span className="text-white ms-1"> {ratingSummary.averageRating || '0.0'} ({ratingSummary.totalReviews || 0}) </span>
											</div>
											<i className="fa-solid fa-circle text-body"></i>
											<div className="fs-14 mb-0 text-white d-flex align-items-center flex-wrap gap-1 custom-address-item"><i className="material-icons-outlined text-white me-1">location_on</i>{addressLabel || '—'} <Link to="/buy-grid-map" className="text-primary fs-14 text-decoration-underline ms-1"> View Location</Link></div>
											<i className="fa-solid fa-circle text-body"></i>
											<p className="fs-14 mb-0 text-white">Last Updated on : {formattedUpdatedAt || '—'}</p>
										</div>
									</div>
									<div className="col-xl-4 d-flex d-xl-block align-items-center flex-wrap gap-3">
										<div className="breadcrumb-icons d-flex align-items-center justify-content-xl-end justify-content-start gap-2 mb-xl-4">
											<a href="#" className=""><i className="material-icons-outlined rounded">favorite_border</i></a>
											<a href="#" className=""><i className="material-icons-outlined rounded">bookmark_add</i></a>
											<a href="#" className=""><i className="material-icons-outlined rounded">compare_arrows</i></a>
										</div>
										<h4 className="mb-0 text-primary text-xl-end text-start"> {formattedPrice} </h4>
									</div>
								</div>
							</div>
						</div>


					</div>


					<div className="content">
						<div className="container">
							{loading && (
								<div className="text-center py-5">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
									<p className="mt-3">Loading property...</p>
								</div>
							)}
							{!loading && error && (
								<div className="alert alert-danger" role="alert">
									<i className="material-icons-outlined me-2">error</i>
									{error}
								</div>
							)}

							{!loading && !error && (
								<>
									<div className="row">
										<div className="col-xl-8">

											<div className="mb-4 d-inline-flex align-center justify-content-between w-100 flex-wrap gap-1">
												<div className="d-inline-flex align-center gap-2">
													<span className="badge bg-danger d-flex align-items-center"> <i className="material-icons-outlined fs-14 me-1">generating_tokens</i> Trending </span>
													<span className="badge bg-orange d-flex align-items-center"> <i className="material-icons-outlined  fs-14 me-1">loyalty</i> Featured </span>
													<button
														className="btn btn-sm btn-primary d-flex align-items-center text-white border-0 shadow-sm px-3"
														onClick={() => setShowStagingModal(true)}
														style={{ background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)' }}
														title="Use AI to virtually stage eligible empty rooms"
													>
														<i className="material-icons-outlined fs-14 me-1">auto_awesome</i> Magic Staging
													</button>
													{hasPanoramas && (
														<button
															type="button"
															className="btn btn-sm d-flex align-items-center text-white border-0 shadow-sm px-3"
															onClick={() => setIsTourModalOpen(true)}
															style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
															title="Open immersive 360° virtual tour"
														>
															<i className="material-icons-outlined fs-14 me-1">panorama</i>
															View 360° tour
														</button>
													)}
												</div>
												<p className="mb-0 text-dark">
													Total No of Visits : 45
												</p>
											</div>


											<div className="slider-card service-slider-card mb-4 overflow-hidden bg-white border rounded-4 shadow-sm">
												<div className="position-relative">
													<img
														src={heroSlides[safeHeroIndex] || heroSlides[0]}
														className="w-100 d-block bg-light"
														alt={property?.title || 'Property'}
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
																style={{
																	width: 40,
																	height: 40,
																	zIndex: 6,
																	background: 'rgba(0,0,0,0.5)',
																}}
																onClick={goHeroPrev}
																aria-label="Previous photo"
															>
																<i className="material-icons-outlined">chevron_left</i>
															</button>
															<button
																type="button"
																className="position-absolute top-50 end-0 translate-middle-y me-2 d-flex align-items-center justify-content-center border-0 rounded-circle text-white"
																style={{
																	width: 40,
																	height: 40,
																	zIndex: 6,
																	background: 'rgba(0,0,0,0.5)',
																}}
																onClick={goHeroNext}
																aria-label="Next photo"
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
																{property?.city}
																{property?.country ? `, ${property.country}` : ', Tunisia'}
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
															aria-label="Open 360 degree virtual tour"
														>
															<i className="material-icons-outlined" style={{ fontSize: '18px' }}>panorama</i>
															360° Tour
														</button>
													)}
												</div>
												{heroSlides.length > 1 && (
													<div
														className="row g-1 p-3 border-top"
														style={{ marginLeft: 0, marginRight: 0 }}
													>
														{heroSlides.slice(0, 8).map((url, index) => (
															<div className="col-3" key={`thumb-${index}-${url}`}>
																<button
																	type="button"
																	className={`w-100 p-0 border rounded-3 overflow-hidden bg-light ${index === safeHeroIndex
																			? 'border-primary border-2 shadow-sm'
																			: 'border'
																		}`}
																	style={{ maxHeight: 88 }}
																	onClick={() => setHeroImageIndex(index)}
																	aria-label={`Show photo ${index + 1}`}
																>
																	<img
																		src={url}
																		alt=""
																		className="w-100 h-100"
																		style={{ objectFit: 'cover' }}
																	/>
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
															Description
														</button>
													</div>
													<div id="accordion-1" className="accordion-collapse collapse show">
														<div className="accordion-body">
															<p className="mb-0 text-body" style={{ whiteSpace: 'pre-wrap' }}>
																{descriptionText ? descriptionShown : '—'}
															</p>
															{descriptionNeedsTruncate && (
																<div className="mt-2 d-inline-flex align-items-center gap-1">
																	<button
																		type="button"
																		className="btn btn-link p-0 fs-14 text-decoration-none viewall-button"
																		onClick={() => setDescriptionExpanded((v) => !v)}
																		aria-expanded={descriptionExpanded}
																	>
																		{descriptionExpanded ? 'Read less' : 'Read more'}
																	</button>
																	<i className="material-icons-outlined" style={{ fontSize: '18px' }}>
																		{descriptionExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
																	</i>
																</div>
															)}
														</div>
													</div>
												</div>


												{property?.detectedFeatures && Object.keys(property.detectedFeatures).length > 0 && (
													<div className="accordion-item border-primary" style={{ borderWidth: '2px', backgroundColor: '#f8f9fa' }}>
														<div className="accordion-header">
															<button className="accordion-button text-primary fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-ai-buy" aria-expanded="true">
																<i className="material-icons-outlined me-2">auto_awesome</i> AI Auto-Detected Features
															</button>
														</div>
														<div id="accordion-ai-buy" className="accordion-collapse collapse show">
															<div className="accordion-body">
																<div className="row g-3">
																	<div className="col-12">
																		<p className="mb-2 d-flex align-items-start gap-2">
																			<i className="material-icons-outlined text-success mt-1">category</i>
																			<span>
																				<strong>Detected Objects: </strong>
																				<span className="text-capitalize">{property.detectedFeatures.objects?.length ? property.detectedFeatures.objects.join(', ') : 'None'}</span>
																			</span>
																		</p>
																	</div>
																	{property.detectedFeatures.roomVotes && Object.keys(property.detectedFeatures.roomVotes).length > 0 && (
																		<div className="col-12">
																			<p className="mb-2 fw-semibold d-flex align-items-center gap-2">
																				<i className="material-icons-outlined text-success">sensor_window</i>
																				Detected Rooms:
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
																			<small className="text-muted mt-1 d-block">Primary room in blue · count = supporting objects</small>
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
															Property Features
														</button>
													</div>
													<div id="accordion-2" className="accordion-collapse collapse show">
														<div className="accordion-body">

															<div className="row row-gap-4">
																<div className="col-lg-3 col-md-6">
																	<div className="buy-property-items">
																		<p> <i className="material-icons-outlined">bed</i>  Bedrooms: {property?.rooms ?? 0}</p>
																		<p> <i className="material-icons-outlined">door_sliding</i> Floor: 5th of 12 </p>
																		<p> <i className="material-icons-outlined">straighten</i>  Area : {property?.surface ?? 'N/A'} Sq Ft</p>
																	</div>
																</div>
																<div className="col-lg-3 col-md-6">
																	<div className="buy-property-items">
																		<p> <i className="material-icons-outlined">bathtub</i>  Bathrooms: {property?.bathrooms ?? 0}</p>
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
															<p className="mb-2 text-body">
																This property offers a practical mix of comfort, accessibility, and neighborhood amenities — consistent with the
																description and photos in this listing.
															</p>
															<p className="mb-2 text-body">
																Located in <strong>{property?.city || '—'}</strong>
																{property?.country ? `, ${property.country}` : ', Tunisia'}
																{property?.listingType === 'FOR_RENT'
																	? ', it is offered for rent on Smart Property.'
																	: ', it is offered for sale on Smart Property.'}
															</p>
															<p className="mb-2 text-body">
																<i className="fa-solid fa-circle-check text-success me-2" />
																{property?.surface != null
																	? `Interior surface around ${property.surface} m² (as listed).`
																	: 'See property features for size and room counts.'}
															</p>
															<p className="mb-2 text-body">
																<i className="fa-solid fa-circle-check text-success me-2" />
																Type: <strong>{typeDisplayLabel || '—'}</strong>
																{property?.rooms != null ? ` · ${property.rooms} rooms` : ''}
																{property?.bathrooms != null ? ` · ${property.bathrooms} bathrooms` : ''}
															</p>
															<p className="mb-0 text-body">
																<i className="fa-solid fa-circle-check text-success me-2" />
																Contact the listing owner for visits, paperwork, and any questions specific to this home.
															</p>
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


												{hasPanoramas && (
													<div className="accordion-item">
														<div className="accordion-header">
															<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-360" aria-expanded="true">
																360° Virtual Tour
															</button>
														</div>
														<div id="accordion-360" className="accordion-collapse collapse show">
															<div className="accordion-body p-0 overflow-hidden bg-black">
																<PanoViewer panoramas={tourPanoramas} variant="immersive" />
															</div>
														</div>
													</div>
												)}

												<div className="accordion-item">
													<div className="accordion-header">
														<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-6" aria-expanded="true">
															Gallery
														</button>
													</div>
													<div id="accordion-6" className="accordion-collapse collapse show">
														<div className="accordion-body gallery-body">
															<div className="gallery-slider">
																{propertyImages.length > 0 ? (
																	propertyImages.map((src, idx) => (
																		<div key={`g-${idx}-${src}`} className="gallery-card">
																			<a href={src} data-fancybox="property-gallery" data-caption={property?.title || ''} className="gallery-item rounded">
																				<img src={src} alt="" className="rounded img-fluid" />
																			</a>
																		</div>
																	))
																) : (
																	<p className="text-body mb-0">No photos have been uploaded for this listing yet.</p>
																)}
															</div>
														</div>
													</div>
												</div>


												{/* <div className="accordion-item">
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
												</div> */}


												{/* FAQ section hidden — template copy was not property-specific
												<div className="accordion-item">
													...
												</div>
												*/}


												<div className="accordion-item mb-xl-0">
													<div className="accordion-header">
														<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion-9" aria-expanded="true">
															Reviews
														</button>
													</div>
													<div id="accordion-9" className="accordion-collapse collapse show">
														<div className="accordion-body">
															<ReviewSection propertyId={id} currentUser={currentUser} />
															{false && (<>
																<div className="sub-head d-flex align-items-center justify-content-between mb-4">
																	<h6 className="fs-16 fw-semibold mb-0"> Reviews (45) </h6>
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
																						<div className="progress-bar bg-warning five-star" role="progressbar" aria-label="Success example" style={{ width: '95%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
																					</div>
																					<p>247</p>
																				</div>


																				<div className="progress-lvl mb-2">
																					<p>4 Star Ratings</p>
																					<div className="progress">
																						<div className="progress-bar bg-warning" role="progressbar" aria-label="Success example" style={{ width: '65%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
																					</div>
																					<p>145</p>
																				</div>


																				<div className="progress-lvl mb-2">
																					<p>3 Star Ratings</p>
																					<div className="progress">
																						<div className="progress-bar bg-warning" role="progressbar" aria-label="Success example" style={{ width: '55%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
																					</div>
																					<p>600</p>
																				</div>


																				<div className="progress-lvl mb-2">
																					<p>2 Star Ratings</p>
																					<div className="progress">
																						<div className="progress-bar bg-warning" role="progressbar" aria-label="Success example" style={{ width: '45%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
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
															</>)}

														</div>
													</div>
												</div>
											</div>

										</div>

										<div className="col-xl-4 theiaStickySidebar buy-details-item">

											<div className="card">
												<div className="card-header">
													<h5 className="mb-0">Enquiry</h5>
												</div>

												<div className="card-body">

													<ul className="nav nav-pills listing-nav flex-nowrap" role="tablist">
														<li className="nav-item me-2 w-100" role="presentation">
															<Link className="nav-link active fs-14 w-100" data-bs-toggle="tab" to="/buy-details" role="tab" aria-controls="listing-1" aria-selected="true">
																<i className="material-icons-outlined fs-14 me-1 d-flex align-center">info</i>Request Info
															</Link>
														</li>
														<li className="nav-item w-100" role="presentation">
															<Link className="nav-link fs-14 w-100" data-bs-toggle="tab" to="/buy-details" role="tab" aria-controls="listing-2" aria-selected="false" tabIndex="-1">
																<i className="material-icons-outlined fs-14 me-1">videocam</i>Schedule a Visit
															</Link>
														</li>
													</ul>


													<div className="tab-content">
														<div className="tab-pane fade active show" id="listing-1" role="tabpanel">
															<div className="card bg-light border-0 rounded shadow-none custom-btn">
																<div className="card-body">
																	<div className="d-flex align-items-center gap-2">
																		<div className="avatar avatar-lg">
																			<img src="/assets/img/users/user-06.jpg" alt="" className="rounded-circle" />
																		</div>
																		<div>
																			<h6 className="mb-1 fs-16 fw-semibold">Adrian Hendriques</h6>
																			<p className="mb-0 fs-14 text-body"> Company Agent </p>
																		</div>
																	</div>
																</div>
															</div>

															{blockingSale && (
																<div className="alert alert-warning py-2 small mb-3" role="alert">
																	You already have an active purchase request for this property (status:{' '}
																	<strong>{blockingSale.status}</strong>). You can submit a new offer only after it is
																	cancelled or completed.
																</div>
															)}
															<div className="mb-3">
																<label className="form-label fw-semibold"> Offer Price </label>
																<input
																	type="number"
																	className="form-control"
																	placeholder="Your offer"
																	value={enquiryForm.offerPrice}
																	onChange={handleEnquiryFieldChange('offerPrice')}
																	disabled={Boolean(blockingSale)}
																/>
															</div>
															<div className="mb-4">
																<label className="form-label fw-semibold"> Note to Owner (optional) </label>
																<textarea
																	className="form-control"
																	rows="3"
																	value={enquiryForm.note}
																	onChange={handleEnquiryFieldChange('note')}
																	disabled={Boolean(blockingSale)}
																></textarea>
															</div>
															<div>
																<button
																	type="button"
																	className="btn btn-dark w-100 py-2 fs-14"
																	onClick={handleEnquirySubmit}
																	disabled={isEnquirySubmitting || Boolean(blockingSale)}
																>
																	{isEnquirySubmitting ? 'Submitting...' : 'Submit Purchase Request'}
																</button>
															</div>
														</div>
														<div className="tab-pane fade" id="listing-2" role="tabpanel">
															<div className="card bg-light border-0 rounded shadow-none custom-btn">
																<div className="card-body">
																	<div className="d-flex align-items-center gap-2">
																		<div className="avatar avatar-lg">
																			<img src="/assets/img/users/user-06.jpg" alt="" className="rounded-circle" />
																		</div>
																		<div>
																			<h6 className="mb-1 fs-16 fw-semibold">Adrian Hendriques</h6>
																			<p className="mb-0 fs-14 text-body"> Company Agent </p>
																		</div>
																	</div>
																</div>
															</div>
															<div className="mb-3">
																<label className="form-label fw-semibold"> Name </label>
																<input
																	type="text"
																	className="form-control"
																	placeholder="Your Name"
																	value={enquiryForm.name}
																	onChange={handleEnquiryFieldChange('name')}
																/>
															</div>
															<div className="mb-3">
																<label className="form-label fw-semibold"> Email </label>
																<input
																	type="email"
																	className="form-control"
																	placeholder="Your Email"
																	value={enquiryForm.email}
																	onChange={handleEnquiryFieldChange('email')}
																/>
															</div>
															<div className="mb-3">
																<label className="form-label fw-semibold"> Phone </label>
																<input
																	type="text"
																	className="form-control"
																	placeholder="Your Phone Number"
																	value={enquiryForm.phone}
																	onChange={handleEnquiryFieldChange('phone')}
																/>
															</div>
															<div className="mb-4">
																<label className="form-label fw-semibold"> Description </label>
																<textarea
																	className="form-control"
																	rows="3"
																	value={enquiryForm.description}
																	onChange={handleEnquiryFieldChange('description')}
																></textarea>
															</div>
															<div>
																<button
																	type="button"
																	className="btn btn-dark w-100 py-2 fs-14"
																	onClick={handleEnquirySubmit}
																	disabled={isEnquirySubmitting || Boolean(blockingSale)}
																>
																	{isEnquirySubmitting ? 'Submitting...' : 'Submit'}
																</button>
															</div>
														</div>
														<div className="tab-pane fade" id="listing-2" role="tabpanel">
															<div className="card bg-light border-0 rounded shadow-none custom-btn">
																<div className="card-body">
																	<div className="d-flex align-items-center gap-2">
																		<div className="avatar avatar-lg">
																			<img src="/assets/img/users/user-06.jpg" alt="" className="rounded-circle" />
																		</div>
																		<div>
																			<h6 className="mb-1 fs-16 fw-semibold">Adrian Hendriques</h6>
																			<p className="mb-0 fs-14 text-body"> Company Agent </p>
																		</div>
																	</div>
																</div>
															</div>

															<div className="select-date-item">
																<h6 className="fs-16 fw-semibold mb-2"> Select Day </h6>
																<div className="d-flex align-items-center justify-content-between gap-1 flex-wrap">
																	<div className="d-flex flex-column gap-1 border">
																		<p className="mb-0"> Mon </p>
																		<h5 className="mb-0"> 21 </h5>
																		<p className="mb-0"> Feb </p>
																	</div>
																	<div className="d-flex flex-column gap-1 border">
																		<p className="mb-0"> Tue </p>
																		<h5 className="mb-0"> 22 </h5>
																		<p className="mb-0"> Feb </p>
																	</div>
																	<div className="d-flex flex-column gap-1 border">
																		<p className="mb-0"> Wed </p>
																		<h5 className="mb-0"> 23 </h5>
																		<p className="mb-0"> Feb </p>
																	</div>
																	<div className="d-flex flex-column gap-1 border">
																		<p className="mb-0"> Thu </p>
																		<h5 className="mb-0"> 24 </h5>
																		<p className="mb-0"> Feb </p>
																	</div>
																	<div className="d-flex flex-column gap-1 border">
																		<p className="mb-0"> Fri </p>
																		<h5 className="mb-0"> 25 </h5>
																		<p className="mb-0"> Feb </p>
																	</div>
																</div>
															</div>

															<div className="mb-3">
																<label className="form-label fw-semibold"> Select Time </label>
																<div className="input-group w-auto input-group-flat">
																	<input type="text" className="form-control bg-light timepicker" placeholder="-- : --" />
																	<span className="input-group-text">
																		<i className="material-icons-outlined text-dark">schedule</i>
																	</span>
																</div>
															</div>

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
																<Link to="/buy-details" className="btn btn-dark w-100 py-2 fs-14">Submit</Link>
															</div>
														</div>
													</div>

												</div>
											</div>


											<div className="card">
												<div className="card-header">
													<h5 className="mb-0">Listing Owner Details</h5>
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
																This listing: {ratingSummary.averageRating || '0.0'} / 5 · {ratingSummary.totalReviews || 0}{' '}
																review{Number(ratingSummary.totalReviews) === 1 ? '' : 's'}
															</p>
														</div>
													</div>
													<ul className="mb-3 list-unstyled">
														<li className="d-flex align-center justify-content-between flex-wrap gap-1 mb-3">
															<span className="text-body">Phone</span>
															<span className="text-end">{ownerProfile.phone || '—'}</span>
														</li>
														<li className="d-flex align-center justify-content-between flex-wrap gap-1 mb-3">
															<span className="text-body">Email</span>
															<span className="text-end text-break">
																{ownerProfile.email ? (
																	<a href={`mailto:${ownerProfile.email}`} className="text-primary">
																		{ownerProfile.email}
																	</a>
																) : (
																	'—'
																)}
															</span>
														</li>
														<li className="d-flex align-center justify-content-between flex-wrap gap-1 mb-3">
															<span className="text-body">Member since</span>
															<span>{ownerProfile.memberSince || '—'}</span>
														</li>
														<li className="d-flex align-center justify-content-between flex-wrap gap-1 mb-0">
															<span className="text-body">Account</span>
															<div className="badge bg-success text-white">Registered</div>
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
																WhatsApp
															</a>
														) : (
															<span className="btn btn-secondary disabled w-100">WhatsApp</span>
														)}
														{ownerProfile.email ? (
															<a
																href={`mailto:${ownerProfile.email}?subject=${encodeURIComponent(`Regarding listing: ${property?.reference || property?.title || ''}`)}`}
																className="btn btn-dark d-flex align-center fs-14 fw-medium w-100 text-center justify-content-center"
															>
																Email owner
															</a>
														) : (
															<span className="btn btn-secondary disabled w-100">Email owner</span>
														)}
													</div>
												</div>
											</div>


											<div className="card">
												<div className="card-header">
													<h5 className="mb-0">Share Property</h5>
												</div>
												<div className="card-body">
													<div className="buy-social-icons-items d-flex align-center gap-2 flex-wrap">
														<a href="#" className="item-1"><i className="fa-brands fa-facebook-f"></i></a>
														<a href="#" className="item-2"><i className="fa-brands fa-instagram"></i></a>
														<a href="#" className="item-3"><i className="fa-brands fa-behance"></i></a>
														<a href="#" className="item-4"><i className="fa-brands fa-twitter"></i></a>
														<a href="#" className="item-5"><i className="fa-brands fa-pinterest-p"></i></a>
														<a href="#" className="item-6"><i className="fa-brands fa-linkedin"></i></a>
													</div>
												</div>
											</div>


											<div className="card">
												<div className="card-header">
													<h5 className="mb-0">Mortarage Calculator</h5>
												</div>
												<div className="card-body">
													<form>
														<div className="mb-3">
															<label className="form-label fw-semibold"> Total Amount ($) </label>
															<input type="text" className="form-control" placeholder="Your Total Amount " value="15000" />
														</div>
														<div className="mb-3">
															<label className="form-label fw-semibold"> Down Payment ($) </label>
															<input type="text" className="form-control" placeholder="Your Down Payment" value="10000" />
														</div>
														<div className="mb-3">
															<label className="form-label fw-semibold"> Loan Terms (Years) </label>
															<input type="text" className="form-control" placeholder="Your Loan Terms" value="3" />
														</div>
														<div className="mb-3">
															<label className="form-label fw-semibold"> Interest Rate (%)</label>
															<input type="text" className="form-control" placeholder="Your Interest Rate" value="15" />
														</div>
														<div className="mb-0">
															<label className="form-label fw-semibold"> Min Sqft </label>
															<input type="text" className="form-control" />
														</div>
													</form>
												</div>
											</div>


											<div className="card mb-0 border rounded-4 shadow-sm overflow-hidden">
												<div className="card-header bg-white border-bottom py-3">
													<h5 className="mb-0 fs-6 fw-semibold">Nearby Landmarks &amp; Visits</h5>
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
																<BuyDetailsMapFlyTo lat={mapLat} lng={mapLng} />
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
																Loading map…
															</div>
														)}
													</div>
													<div className="px-3 py-2 border rounded-4 bg-light mb-3">
														<p className="mb-0 text-uppercase fw-semibold text-muted" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
															Property address
														</p>
														<p className="mb-0 mt-1 fw-medium text-dark">{displayAddressForMap || '—'}</p>
													</div>
													<ul className="list-unstyled small text-body mb-0">
														<li className="d-flex align-items-center gap-2 mb-2">
															<span className="text-success">✔</span>
															Near main city attractions
														</li>
														<li className="d-flex align-items-center gap-2 mb-2">
															<span className="text-success">✔</span>
															Easy access to transportation
														</li>
														<li className="d-flex align-items-center gap-2 mb-0">
															<span className="text-success">✔</span>
															Shops and services nearby
														</li>
													</ul>
												</div>
											</div>

										</div>
									</div>




									<div className="row row-gap-4 custom-properties-items">


										<div className="col-xl-3 col-lg-6 col-md-6 d-flex">
											<div className="property-card mb-0 flex-fill">
												<div className="property-listing-item p-0 mb-0 shadow-none">
													<div className="buy-grid-img mb-0 rounded-0">
														<Link to="/buy-details">
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
																	<Link to="/buy-details">Beautiful Condo Room</Link>
																</h6>
																<p className="d-flex align-items-center fs-14 mb-0 gap-1"><i className="material-icons-outlined me-1 ms-0">location_on</i>25, Willow Apartment, USA</p>
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
														<Link to="/buy-details">
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
																	<Link to="/buy-details">Serenity Condo Suite</Link>
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
														<Link to="/buy-details">
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
																	<Link to="/buy-details">Downtown Luxe Room</Link>
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
														<Link to="/buy-details">
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
																	<Link to="/buy-details">Modern Haven Suite</Link>
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
								</>
							)}


						</div>
					</div>



				</div>








				<div className="modal fade" id="search-modal" tabIndex="-1" aria-hidden="true">
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

				{/* Magic Staging Modal */}
				{showStagingModal && (
					<div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
						<div className="modal-dialog modal-dialog-centered modal-lg">
							<div className="modal-content border-0 shadow-lg">
								<div className="modal-header border-0 pb-0">
									<h5 className="modal-title d-flex align-items-center gap-2 fw-semibold">
										<span style={{ fontSize: '1.5rem' }}>✨</span> AI Virtual Staging
									</h5>
									<button type="button" className="btn-close" onClick={closeStagingModal}></button>
								</div>
								<div className="modal-body p-4">
									<p className="text-muted mb-4">Transform this empty room into a beautifully furnished space using AI.</p>

									<div className="row">
										<div className="col-md-8">
											<div className="position-relative bg-light rounded d-flex align-items-center justify-content-center overflow-hidden shadow-sm" style={{ minHeight: '350px' }}>
												{isStagingLoading ? (
													<div className="text-center p-4">
														<div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
														<h6 className="mb-1 text-primary fw-bold">Analyzing Room Depth...</h6>
														<p className="text-muted fs-14">Applying {selectedStyle} aesthetics</p>
													</div>
												) : stagedResultUrl ? (
													<img src={stagedResultUrl} alt="Staged Room" className="img-fluid w-100 h-100 object-fit-cover" />
												) : (
													<img src={propertyImages[0] || "/assets/img/buy/buy-slide-img-1.jpg"} alt="Original Room" className="img-fluid w-100 h-100 object-fit-cover opacity-75" />
												)}

												{stagedResultUrl && !isStagingLoading && (
													<div className="position-absolute top-0 start-0 m-3">
														<span className="badge bg-success shadow-sm px-3 py-2 fs-13">VIRTUAL STAGING</span>
													</div>
												)}
											</div>
										</div>
										<div className="col-md-4 mt-4 mt-md-0 d-flex flex-column">
											<h6 className="fw-bold mb-3">Select Style</h6>
											<div className="d-flex flex-column gap-3 mb-4">
												{['modern', 'scandinavian', 'industrial', 'luxury'].map(style => (
													<label key={style} className={`border rounded p-3 transition-all ${selectedStyle === style ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-light bg-white'}`} style={{ cursor: 'pointer' }}>
														<div className="d-flex align-items-center gap-2">
															<input
																type="radio"
																name="stagingStyle"
																className="form-check-input mt-0"
																checked={selectedStyle === style}
																onChange={() => setSelectedStyle(style)}
															/>
															<span className="text-capitalize fw-semibold text-dark fs-15">{style}</span>
														</div>
													</label>
												))}
											</div>

											<div className="mt-auto">
												<button
													className="btn btn-primary w-100 btn-lg d-flex align-items-center justify-content-center gap-2 fw-bold text-white shadow-sm"
													onClick={handleStagingSubmit}
													disabled={isStagingLoading}
													style={{ background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)', border: 'none' }}
												>
													{isStagingLoading ? (
														<>Generating...</>
													) : stagedResultUrl ? (
														<><i className="material-icons-outlined">refresh</i> Regenerate</>
													) : (
														<><span>✨</span> Apply Magic Staging</>
													)}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{isTourModalOpen && hasPanoramas && createPortal(
					<div
						className="buy-details-tour-overlay"
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
						aria-label="360 virtual tour"
					>
						<div
							className="d-flex align-items-center justify-content-between flex-shrink-0 px-3 py-2 border-bottom border-secondary"
							style={{ background: 'rgba(30,35,45,0.98)', borderColor: 'rgba(255,255,255,0.12)' }}
						>
							<span className="text-white fw-semibold d-flex align-items-center gap-2 mb-0">
								<i className="material-icons-outlined text-white">panorama</i>
								360° Virtual Tour
							</span>
							<button type="button" className="btn btn-sm btn-outline-light" onClick={closeTourModal}>
								Close
							</button>
						</div>
						<div className="flex-grow-1 position-relative" style={{ minHeight: 0, background: '#000' }}>
							<PanoViewer panoramas={tourPanoramas} variant="immersive" fillHeight />
						</div>
					</div>,
					document.body
				)}

			</div>
		</div>
	);
};

export default BuyDetails;



