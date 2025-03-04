import React from "react";
import '../styles/ReviewForm.css'

const ReviewsList = ({reviews}) => {
    return (
        <div className="reviews-list">
            <h2>Reviews</h2>
            {reviews.length > 0 ? (
                <div>
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <p><strong>User:</strong>{review.user}</p>
                            <p><strong>Rating:</strong> {review.rating} stars</p>
                            <p><strong>Comment:</strong>{review.comment}</p>
                            <p><strong>Submitted on:</strong>{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No reviews found.</p>
            )}
        </div>
    );
};

export default ReviewsList;