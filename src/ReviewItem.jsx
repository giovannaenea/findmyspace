import React, { useState, useEffect } from 'react';
import { StyledRating } from './ReviewSection';
import './ReviewItem.css';
import { db } from './firebase.mjs';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const CHECK_CATEGORIES = [
  { key: 'noise', label: 'Noise' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'internet', label: 'Internet Speed' },
  { key: 'facility', label: 'Facility Condition' },
  { key: 'landlord', label: 'Landlord Treatment' },
];

const ReviewItem = ({ user, review, handleDeleteReview, handleReply, propertyId, propertyLandlordId }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(review.landlordReply || '');
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [votes, setVotes] = useState({ upvotes: review.upvotes || 0, downvotes: review.downvotes || 0 });

  // Load this user's persisted vote from their Firestore user doc on mount.
  // The votes field is a map: { [propertyId_reviewId]: 'up' | 'down' }
  useEffect(() => {
    if (!user?.uid) return;
    const key = `${propertyId}_${review.id}`;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (!snap.exists()) return;
      const vote = snap.data().votes?.[key];
      if (vote === 'up') setUpvoted(true);
      else if (vote === 'down') setDownvoted(true);
    }).catch(() => {/* non-critical — votes just won't show as active */});
  }, [user?.uid, propertyId, review.id]);

  const handleUpvote = () => {
    if (!user) return;
    const wasUpvoted = upvoted;
    const wasDownvoted = downvoted;
    const newUpvoted = !wasUpvoted;
    const newDownvoted = false;

    const newVotes = {
      upvotes: Math.max(0, votes.upvotes + (wasUpvoted ? -1 : 1)),
      downvotes: Math.max(0, votes.downvotes - (wasDownvoted ? 1 : 0)),
    };
    setUpvoted(newUpvoted);
    setDownvoted(newDownvoted);
    setVotes(newVotes);
    persistVote(newVotes, newUpvoted ? 'up' : null);
  };

  const handleDownvote = () => {
    if (!user) return;
    const wasUpvoted = upvoted;
    const wasDownvoted = downvoted;
    const newDownvoted = !wasDownvoted;
    const newUpvoted = false;

    const newVotes = {
      upvotes: Math.max(0, votes.upvotes - (wasUpvoted ? 1 : 0)),
      downvotes: Math.max(0, votes.downvotes + (wasDownvoted ? -1 : 1)),
    };
    setUpvoted(newUpvoted);
    setDownvoted(newDownvoted);
    setVotes(newVotes);
    persistVote(newVotes, newDownvoted ? 'down' : null);
  };

  const persistVote = async (newVotes, voteChoice) => {
    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const docSnap = await getDoc(propertyRef);
      if (docSnap.exists()) {
        const freshReviews = docSnap.data().reviews || [];
        const updatedReviews = freshReviews.map(r =>
          r.id === review.id
            ? { ...r, upvotes: newVotes.upvotes, downvotes: newVotes.downvotes }
            : r
        );
        await setDoc(propertyRef, { reviews: updatedReviews }, { merge: true });
      }

      if (user?.uid) {
        const key = `${propertyId}_${review.id}`;
        const userRef = doc(db, 'users', user.uid);
        const voteUpdate = voteChoice === null
          ? { [`votes.${key}`]: null }
          : { [`votes.${key}`]: voteChoice };
        await updateDoc(userRef, voteUpdate);
      }
    } catch (err) {
      console.error('Failed to persist vote:', err);
    }
  };

  const activeChecks = review.checks
    ? CHECK_CATEGORIES.filter(c => review.checks[c.key])
    : [];

  const isPropertyLandlord = user?.role === 'landlord' && user?.uid === propertyLandlordId;

  return (
    <div className="review-item">
      <div className="review-header">
        <img
          src={review.profilePicture || 'https://cdn.vectorstock.com/i/preview-1x/28/63/profile-placeholder-image-gray-silhouette-vector-21542863.jpg'}
          className="review-profile-photo"
          alt=""
        />
        <div className="review-meta">
          <p className="review-name">{review.name}</p>
          <p className="review-date">
            {review.date ? new Date(review.date).toLocaleDateString('en-US') : ''}
            {review.editedAt && <span className="review-edited-badge"> (edited)</span>}
          </p>
        </div>
        <StyledRating name="read-only" value={review.rating} precision={0.5} readOnly size="small" />
      </div>

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

      <p className="review-desc">{review.description}</p>

      {review.photos && review.photos.length > 0 && (
        <div>
          <div className="review-photos">
            {(showAllPhotos ? review.photos : review.photos.slice(0, 3)).map((url, i) => (
              <button key={i} className="review-photo-wrap" onClick={() => setLightboxIndex(i)}>
                <img src={url} alt={`Review photo ${i + 1}`} className="review-photo" />
              </button>
            ))}
          </div>
          {review.photos.length > 3 && (
            <button className="review-photos-toggle" onClick={(e) => { e.stopPropagation(); setShowAllPhotos(p => !p); }}>
              {showAllPhotos ? 'Show less' : `+${review.photos.length - 3} more photo${review.photos.length - 3 > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}

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
        {user && (review.userId === user.uid || user.isAdmin) && (
          <button className="delete-btn" onClick={() => handleDeleteReview(review.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
        {isPropertyLandlord && (
          <button className="reply-btn" onClick={() => setShowReplyBox(!showReplyBox)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {review.landlordReply ? 'Edit Reply' : 'Reply'}
          </button>
        )}
      </div>

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

      {lightboxIndex !== null && review.photos?.length > 0 && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIndex(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {review.photos.length > 1 && (
            <button className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + review.photos.length) % review.photos.length); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <img
            src={review.photos[lightboxIndex]}
            alt={`Photo ${lightboxIndex + 1}`}
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          {review.photos.length > 1 && (
            <button className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % review.photos.length); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
          {review.photos.length > 1 && (
            <div className="lightbox-dots">
              {review.photos.map((_, dotIdx) => (
                <button key={dotIdx} className={`lightbox-dot${dotIdx === lightboxIndex ? ' active' : ''}`} onClick={e => { e.stopPropagation(); setLightboxIndex(dotIdx); }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;