import React, { useState, useEffect, useCallback } from 'react';
import { getFeedbacks, createFeedback, calculateReviewStats } from '../services/feedbackService';
import toast from 'react-hot-toast';

const ReviewSection = ({ propertyId, currentUser }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });

    // Form state
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const fetchReviews = useCallback(async () => {
        if (!propertyId) return;

        setLoading(true);
        try {
            const data = await getFeedbacks({ propertyId, limit: 100 });
            setReviews(data.feedbacks || []);
            setStats(calculateReviewStats(data.feedbacks || []));
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            setError('Could not load reviews.');
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('Please log in to submit a review');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        setSubmitting(true);
        try {
            const { feedback, message } = await createFeedback({
                propertyId,
                rating,
                comment
            });

            if (feedback?.profanityFiltered) {
                toast(message || 'Your review was published with some wording adjusted to keep the community respectful.', {
                    duration: 7000,
                    icon: '⚠️',
                    style: {
                        borderRadius: '12px',
                        background: '#fffbeb',
                        border: '1px solid #fcd34d',
                        color: '#78350f',
                        padding: '14px 16px',
                    },
                });
            } else {
                toast.success(message || 'Review submitted successfully!');
            }
            setComment('');
            setRating(5);

            // Close modal using standard Bootstrap/jQuery method if available
            if (window.jQuery) {
                window.jQuery('#add_review').modal('hide');
            }

            // Refresh reviews
            fetchReviews();
        } catch (err) {
            toast.error(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (count) => {
        const ratingValue = Math.max(0, Math.min(5, Number(count) || 0));
        return [...Array(5)].map((_, i) => (
            <span
                key={i}
                style={{
                    fontSize: '18px',
                    lineHeight: 1,
                    color: i < ratingValue ? '#ffc107' : '#d1d5db',
                    marginRight: 1,
                }}
                aria-hidden="true"
            >
                ★
            </span>
        ));
    };

    if (loading && reviews.length === 0) {
        return <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    return (
        <div className="review-wrap">
            <div className="card shadow-none mb-0">
                <div className="card-header">
                    <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <h5>Reviews ({stats.totalReviews})</h5>
                        <a
                            href="javascript:void(0);"
                            className="btn btn-primary d-flex align-items-center"
                            data-bs-toggle="modal"
                            data-bs-target="#add_review"
                        >
                            <i className="material-icons-outlined me-1">edit</i> Write a Review
                        </a>
                    </div>
                </div>
                <div className="card-body">
                    <div className="review-stats d-flex align-items-center justify-content-between flex-wrap row-gap-3 border-bottom pb-4 mb-4">
                        <div className="review-average text-center p-4 bg-light rounded">
                            <h2 className="mb-1">{stats.averageRating}</h2>
                            <div className="d-flex justify-content-center mb-1">
                                {renderStars(Math.round(stats.averageRating))}
                            </div>
                            <p className="mb-0 fs-14 text-muted">{stats.totalReviews} Reviews</p>
                        </div>

                        <div className="review-progress flex-fill ms-lg-4">
                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="d-flex align-items-center mb-2">
                                    <span className="fs-14 me-2" style={{ minWidth: '45px' }}>{star} Stars</span>
                                    <div className="progress flex-fill" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar bg-warning"
                                            role="progressbar"
                                            style={{ width: `${stats.totalReviews ? (stats.starDistribution[star] / stats.totalReviews) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="fs-14 ms-2" style={{ minWidth: '30px' }}>{stats.starDistribution[star]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="review-list">
                        {reviews.length === 0 ? (
                            <div className="text-center py-4">
                                <i className="material-icons-outlined text-muted" style={{ fontSize: '48px' }}>rate_review</i>
                                <p className="mt-2 text-muted">No reviews yet. Be the first to review this property!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review._id} className="review-item border-bottom pb-4 mb-4">
                                    <div className="d-flex align-items-start justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="avatar avatar-md rounded-circle border">
                                                <img
                                                    src={review.authorId?.avatar || "/assets/img/users/user-01.jpg"}
                                                    alt="User"
                                                    className="rounded-circle"
                                                    onError={(e) => { e.target.src = "/assets/img/users/user-01.jpg"; }}
                                                />
                                            </div>
                                            <div>
                                                <h6 className="mb-0">
                                                    {review.authorId?.firstName || review.authorId?.login || 'Anonymous'} {review.authorId?.lastName || ''}
                                                </h6>
                                                <span className="fs-12 text-muted">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                        {review.profanityFiltered ? (
                                            <span className="badge rounded-pill text-bg-warning text-dark fw-semibold" title="Some words were hidden to match community guidelines">
                                                Moderated
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="mb-0 text-body fs-14">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Write a Review Modal */}
            <div className="modal fade" id="add_review" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            <div className="modal-header">
                                <h4 className="text-dark modal-title fw-bold">Write a Review</h4>
                                <button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
                                    <i className="material-icons-outlined">close</i>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label d-block">Ratings</label>
                                    <div className="d-flex align-items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setRating(num)}
                                                className="btn p-0 border-0 bg-transparent"
                                                aria-label={`Rate ${num} star${num > 1 ? 's' : ''}`}
                                            >
                                                <i
                                                    className="material-icons"
                                                    style={{
                                                        fontSize: '28px',
                                                        lineHeight: 1,
                                                        color: num <= rating ? '#ffc107' : '#d1d5db',
                                                    }}
                                                >
                                                    star
                                                </i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Write your review</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Describe your experience..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                    <p className="form-text text-muted fs-12 mb-0 mt-1">
                                        Reviews are checked automatically: offensive language may be masked and you may receive a courtesy email from SmartProperty.
                                    </p>
                                </div>
                                {!currentUser && (
                                    <div className="alert alert-warning fs-14">
                                        <i className="material-icons-outlined me-1 fs-16">info</i>
                                        You must be logged in to submit a review.
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting || !currentUser}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default ReviewSection;
