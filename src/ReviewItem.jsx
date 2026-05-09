import React, { useState, useEffect } from 'react';
import { StyledRating } from './ReviewSection';
import './ReviewItem.css';
import { db } from './firebase.mjs';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CHECK_CATEGORIES = [
  { key: 'noise', label: 'Noise' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'internet', label: 'Internet Speed' },
  { key: 'facility', label: 'Facility Condition' },
  { key: 'landlord', label: 'Landlord Treatment' },
];

// FIX: added propertyLandlordId prop so we can check ownership
const ReviewItem = ({ user, review, handleDeleteReview, handleReply, propertyId, propertyLandlordId }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(review.landlordReply || '');
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });

  useEffect(() => {
    setVotes({ upvotes: review.upvotes || 0, downvotes: review.downvotes || 0 });
  }, []);

  const handleUpvote = () => {
    let newVotes = { ...votes };
    newVotes.upvotes += upvoted ? -1 : 1;
    setUpvoted(!upvoted);
    if (downvoted) { setDownvoted(false); newVotes.downvotes -= 1; }
    setVotes(newVotes);
    updateVotes(newVotes);
  };

  const handleDownvote = () => {
    let newVotes = { ...votes };
    newVotes.downvotes += downvoted ? -1 : 1;
    setDownvoted(!downvoted);
    if (upvoted) { setUpvoted(false); newVotes.upvotes -= 1; }
    setVotes(newVotes);
    updateVotes(newVotes);
  };

  const updateVotes = async (newVotes) => {
    const propertyRef = doc(db, 'properties', propertyId);
    const docSnap = await getDoc(propertyRef);
    if (docSnap.exists()) {
      let reviews = docSnap.data().reviews;
      const index = reviews.findIndex((r) => r.id === review.id);
      if (index !== -1) {
        reviews[index].upvotes = newVotes.upvotes;
        reviews[index].downvotes = newVotes.downvotes;
        await setDoc(propertyRef, { reviews }, { merge: true });
      }
    }
  };

  const activeChecks = review.checks
    ? CHECK_CATEGORIES.filter(c => review.checks[c.key])
    : [];

  // FIX: only show Reply button if the logged-in user is THIS property's landlord
  const isPropertyLandlord = user?.role === 'landlord' && user?.uid === propertyLandlordId;

  return (
    <div className="review-item">
      {/* Top row: avatar + name + date + rating */}
      <div className="review-header">
        <img
          src={review.profilePicture || 'https://cdn.vectorstock.com/i/preview-1x/28/63/profile-placeholder-image-gray-silhouette-vector-21542863.jpg'}
          className="review-profile-photo"
          alt=""
        />
        <div className="review-meta">
          <p className="review-name">{review.name}</p>
          <p className="review-date">{review.date ? new Date(review.date).toLocaleDateString('en-US') : ''}</p>
        </div>
        <StyledRating name="read-only" value={review.rating} precision={0.5} readOnly size="small" />
      </div>

      {/* Check badges */}
      {activeChecks.length > 0 && (
        <div className="review-checks">
          {activeChecks.map(({ key, label }) => (
            <span key={key} className="review-check-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="review-desc">{review.description}</p>

      {/* Votes + delete */}
      <div className="review-footer">
        <div className="review-votes">
          <button className={`vote-btn${upvoted ? ' voted' : ''}`} onClick={handleUpvote}>
            <svg viewBox="0 0 24 24" fill={upvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            {votes.upvotes}
          </button>
          <button className={`vote-btn${downvoted ? ' voted-down' : ''}`} onClick={handleDownvote}>
            <svg viewBox="0 0 24 24" fill={downvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
              <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
            </svg>
            {votes.downvotes}
          </button>
        </div>
        {user && review.userId === user.uid && (
          <button className="delete-btn" onClick={() => handleDeleteReview(review.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
        {isPropertyLandlord && (
          <button
            className="reply-btn"
            onClick={() => setShowReplyBox(!showReplyBox)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {review.landlordReply ? 'Edit Reply' : 'Reply'}
          </button>
        )}
      </div>

      {/* Existing landlord reply */}
      {review.landlordReply && !showReplyBox && (
        <div className="landlord-reply">
          <p className="landlord-reply-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            Landlord response
          </p>
          <p className="landlord-reply-text">{review.landlordReply}</p>
        </div>
      )}

      {/* Reply input box */}
      {showReplyBox && (
        <div className="reply-box">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write your response to this review..."
            rows={3}
            className="reply-textarea"
          />
          <div className="reply-actions">
            <button className="reply-cancel" onClick={() => { setShowReplyBox(false); setReplyText(review.landlordReply || ''); }}>Cancel</button>
            <button
              className="reply-submit"
              onClick={() => { handleReply(review.id, replyText); setShowReplyBox(false); }}
              disabled={!replyText.trim()}
            >Post Reply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;