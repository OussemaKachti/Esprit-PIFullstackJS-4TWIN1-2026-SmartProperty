import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAgencies, getAgencyFilters } from '../services/agencyService';

const AgencyGrid = () => {
	const [agencies, setAgencies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filterOptions, setFilterOptions] = useState({ cities: [], roles: [], categories: [] });
	const [filters, setFilters] = useState({
		role: 'AGENCY',
		city: 'Select'
	});

	const isInitialMount = useRef(true);

	const fetchAgencies = (currentFilters) => {
		setLoading(true);
		getAgencies(currentFilters)
			.then((data) => setAgencies(data))
			.catch((err) => setError(err.message || 'Failed to load agencies'))
			.finally(() => {
				setLoading(false);
				// Re-init Select2 on .select elements after async load
				setTimeout(() => {
					if (window.jQuery && window.jQuery.fn.select2) {
						window.jQuery('.select').select2({ minimumResultsForSearch: -1 });
					}
				}, 100);
			});
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

		// Initialize plugins once
		const initializePlugins = () => {
			enableScrolling();
			if (window.AOS) {
				window.AOS.refresh();
				window.AOS.init({ duration: 1200, once: true });
			}
			if (window.jQuery && window.jQuery.fn.select2) {
				window.jQuery('.select2, .select').select2({ minimumResultsForSearch: -1 });

				// Hook into Select2 change events to update React state
				window.jQuery('.select').on('change', function (e) {
					const name = e.target.getAttribute('name');
					const value = e.target.value;
					if (name) {
						setFilters(prev => ({ ...prev, [name]: value }));
					}
				});
			}
			if (window.jQuery) {
				window.jQuery('#mobile_btn').off('click').on('click', function () {
					window.jQuery('.main-menu-wrapper').addClass('open');
				});
				window.jQuery('#menu_close').off('click').on('click', function () {
					window.jQuery('.main-menu-wrapper').removeClass('open');
				});
			}
		};
		const timer = setTimeout(initializePlugins, 300);

		// Fetch filter options
		getAgencyFilters()
			.then(data => setFilterOptions(data))
			.catch(err => console.error('Error fetching filters:', err));

		// Initial fetch
		fetchAgencies(filters);

		return () => {
			clearTimeout(timer);
			if (window.jQuery && window.jQuery.fn.select2) {
				window.jQuery('.select').off('change');
			}
		};
	}, []);

	// Re-fetch when filters change (skip initial mount to avoid double fetch)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
		} else {
			fetchAgencies(filters);
		}
	}, [filters]);

	const getDisplayName = (agency) => {
		if (agency.firstName || agency.lastName) {
			return `${agency.firstName || ''} ${agency.lastName || ''}`.trim();
		}
		return agency.login;
	};

	const agencyImages = [
		'/assets/img/agency/agency-01.png',
		'/assets/img/agency/agency-02.png',
		'/assets/img/agency/agency-03.png',
		'/assets/img/agency/agency-04.png',
		'/assets/img/agency/agency-05.png',
		'/assets/img/agency/agency-06.png',
		'/assets/img/agency/agency-07.png',
		'/assets/img/agency/agency-08.png',
	];

	return (
		<div style={{ minHeight: '100vh', overflow: 'visible', position: 'relative', width: '100%' }}>
			<div className="page-wrapper">
				<div className="breadcrumb-bar">
					<img src="/assets/img/bg/breadcrumb-bg-01.png" alt="" className="breadcrumb-bg-01 d-none d-lg-block" />
					<img src="/assets/img/bg/breadcrumb-bg-02.png" alt="" className="breadcrumb-bg-02 d-none d-lg-block" />
					<img src="/assets/img/bg/breadcrumb-bg-03.png" alt="" className="breadcrumb-bg-03" />
					<div className="row align-items-center text-center position-relative z-1">
						<div className="col-md-12 col-12 breadcrumb-arrow">
							<h1 className="breadcrumb-title">Agency Grid</h1>
							<nav aria-label="breadcrumb" className="page-breadcrumb">
								<ol className="breadcrumb">
									<li className="breadcrumb-item"><Link to="/"><span><i className="material-icons-outlined me-1">home</i></span>Home</Link></li>
									<li className="breadcrumb-item active" aria-current="page">Agency Grid</li>
								</ol>
							</nav>
						</div>
					</div>
				</div>

				<div className="content">
					<div className="container">
						<div className="row mb-4">
							<div className="col-lg-4 col-sm-6">
								<div className="mb-3">
									<label className="form-label">Agency Type</label>
									<select className="select" name="role" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
										<option value="AGENCY">Agency Only</option>
										<option value="OWNER">Owner Agencies</option>
									</select>
								</div>
							</div>
							<div className="col-lg-4 col-sm-6">
								<div className="mb-3">
									<label className="form-label">Select City</label>
									<select className="select" name="city" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
										<option>Select</option>
										{filterOptions.cities.map(city => (
											<option key={city} value={city}>{city}</option>
										))}
									</select>
								</div>
							</div>
							<div className="col-lg-4 col-sm-6 d-flex align-items-end">
								<div className="mb-3 w-100">
									<button
										className="btn btn-primary w-100"
										onClick={() => setFilters({ role: 'AGENCY', city: 'Select' })}
									>
										Clear Filters
									</button>
								</div>
							</div>
						</div>

						{loading && (
							<div className="text-center py-5">
								<div className="spinner-border text-primary" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<p className="mt-3 text-muted">Loading results...</p>
							</div>
						)}

						{error && (
							<div className="alert alert-danger text-center" role="alert">
								<i className="material-icons-outlined me-2">error_outline</i>
								{error}
							</div>
						)}

						{!loading && !error && agencies.length === 0 && (
							<div className="text-center py-5">
								<i className="material-icons-outlined" style={{ fontSize: '3rem', color: '#ccc' }}>business</i>
								<p className="mt-3 text-muted">No matching agencies found.</p>
							</div>
						)}

						{!loading && !error && agencies.length > 0 && (
							<div className="row justify-content-center text-center">
								<div className="col-12 mb-3">
									<p className="text-muted">Found {agencies.length} {filters.role.toLowerCase()}(s)</p>
								</div>
								{agencies.map((agency, index) => (
									<div key={agency.id} className="col-xl-3 col-lg-4 col-md-6">
										<div className="agent-item">
											<div className="agent-img">
												<Link to="/agency-details">
													<img
														src={agencyImages[index % agencyImages.length]}
														className="img-fluid"
														alt={getDisplayName(agency)}
													/>
												</Link>
												<div className="position-absolute top-0 end-0 p-3">
													<span className="badge bg-secondary">
														{agency.listingsCount} Listing{agency.listingsCount !== 1 ? 's' : ''}
													</span>
												</div>
											</div>
											<div className="agent-content text-start">
												<div className="d-flex align-items-center mb-1">
													<span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem' }}>
														{agency.role}
													</span>
												</div>
												<h5 className="mb-1">
													<Link to="/agency-details">{getDisplayName(agency)}</Link>
												</h5>
												<p className="mb-0 d-inline-flex align-items-center">
													<i className="material-icons-outlined me-1">email</i>
													{agency.email}
												</p>
												{agency.phone && (
													<p className="mb-0 d-flex align-items-center mt-1">
														<i className="material-icons-outlined me-1">phone</i>
														{agency.phone}
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AgencyGrid;
