import React, { useMemo } from 'react';

/**
 * Builds [1, 'ellipsis', 4, 5, 6, 'ellipsis', 12] style page items.
 */
function buildPageItems(currentPage, totalPages, siblingCount = 1) {
	if (totalPages <= 0) return [];
	if (totalPages === 1) return [1];

	const pages = new Set([1, totalPages]);
	for (let i = currentPage - siblingCount; i <= currentPage + siblingCount; i += 1) {
		if (i >= 1 && i <= totalPages) pages.add(i);
	}

	const sorted = [...pages].sort((a, b) => a - b);
	const out = [];
	let prev = 0;
	for (const p of sorted) {
		if (prev && p - prev > 1) out.push('ellipsis');
		out.push(p);
		prev = p;
	}
	return out;
}

/**
 * Professional pagination for property list/grid pages (Bootstrap-friendly).
 */
const PropertyListPagination = ({
	currentPage = 1,
	totalPages = 1,
	onPageChange,
	disabled = false,
	className = '',
}) => {
	const items = useMemo(
		() => buildPageItems(currentPage, totalPages, 1),
		[currentPage, totalPages]
	);

	if (totalPages <= 1) return null;

	const go = (page) => {
		if (disabled || page < 1 || page > totalPages || page === currentPage) return;
		onPageChange(page);
	};

	return (
		<div
			className={`sp-property-pagination-wrap card border-0 shadow-sm rounded-4 mt-4 mb-2 mx-auto ${className}`.trim()}
			style={{ maxWidth: 720, background: 'linear-gradient(180deg, #fafbfc 0%, #fff 100%)' }}
		>
			<div className="card-body py-4 px-3">
				<nav
					className="sp-property-pagination d-flex flex-column align-items-center gap-3"
					aria-label="Property list pagination"
				>
					<p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
						Page <span className="fw-semibold text-dark">{currentPage}</span> of{' '}
						<span className="fw-semibold text-dark">{totalPages}</span>
					</p>
					<div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
				<button
					type="button"
					className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center rounded-3 px-3 py-2"
					style={{ minWidth: 44, minHeight: 44 }}
					disabled={disabled || currentPage <= 1}
					onClick={() => go(currentPage - 1)}
					aria-label="Previous page"
				>
					<i className="material-icons-outlined" style={{ fontSize: 22 }}>
						chevron_left
					</i>
				</button>

				<div
					className="d-flex flex-wrap align-items-center justify-content-center gap-1 px-1 py-1 rounded-4 border bg-white shadow-sm"
					style={{ borderColor: 'rgba(0,0,0,0.06)' }}
				>
					{items.map((item, idx) =>
						item === 'ellipsis' ? (
							<span
								key={`e-${idx}`}
								className="px-2 text-muted user-select-none"
								aria-hidden
							>
								…
							</span>
						) : (
							<button
								key={item}
								type="button"
								className={`btn btn-sm rounded-3 px-3 py-2 fw-semibold ${
									item === currentPage
										? 'btn-primary shadow-sm'
										: 'btn-light text-dark border-0'
								}`}
								style={{ minWidth: 42 }}
								disabled={disabled}
								onClick={() => go(item)}
								aria-label={`Page ${item}`}
								aria-current={item === currentPage ? 'page' : undefined}
							>
								{item}
							</button>
						)
					)}
				</div>

				<button
					type="button"
					className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center rounded-3 px-3 py-2"
					style={{ minWidth: 44, minHeight: 44 }}
					disabled={disabled || currentPage >= totalPages}
					onClick={() => go(currentPage + 1)}
					aria-label="Next page"
				>
					<i className="material-icons-outlined" style={{ fontSize: 22 }}>
						chevron_right
					</i>
				</button>
					</div>
				</nav>
			</div>
		</div>
	);
};

export default PropertyListPagination;
