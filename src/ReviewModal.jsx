import React, { useState } from 'react';
import { Rating, Modal, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': { color: '#b5b682' },
  '& .MuiRating-iconHover': { color: '#b5b682' },
});

const CHECK_CATEGORIES = [
  { key: 'noise', label: 'Noise' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'internet', label: 'Internet Speed' },
  { key: 'facility', label: 'Facility Condition' },
  { key: 'landlord', label: 'Landlord Treatment' },
];

const ANON_AVATAR = 'https://cdn.vectorstock.com/i/preview-1x/28/63/profile-placeholder-image-gray-silhouette-vector-21542863.jpg';

const ReviewModal = ({ user, isModalOpen, handleModalClose, handleNewReview }) => {
  const [anonymous, setAnonymous] = useState(false);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [checks, setChecks] = useState({});

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isValid = rating >= 1 && description.trim().length > 0;

  // FIX #6: prefer the custom name/profilePicture set in the Firestore user doc
  // (stored on the user object in App.jsx) over the raw Firebase Auth fields.
  const displayName = user?.name || user?.displayName;
  const avatarSrc  = user?.profilePicture || user?.photoURL;

  const handleSubmit = () => {
    const newReview = {
      id: uuidv4(),
      name: anonymous ? 'Anonymous' : displayName,
      profilePicture: anonymous ? ANON_AVATAR : avatarSrc,
      rating,
      description,
      checks,
      photos: [],
      date: Date.now(),
      upvotes: 0,
      downvotes: 0,
      userId: user.uid,
    };
    handleNewReview(newReview);
    setDescription('');
    setRating(0);
    setChecks({});
    setAnonymous(false);
    handleModalClose();
  };

  return (
    <Modal open={isModalOpen} onClose={handleModalClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(440px, 92vw)',
        bgcolor: '#f7f8f9',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(3,63,99,0.15)',
        outline: 'none',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fedc97', fontWeight: 700, fontSize: 16 }}>Write a Review</span>
          <button onClick={handleModalClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Reviewer name toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={anonymous ? ANON_AVATAR : (avatarSrc || ANON_AVATAR)}
              alt=""
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>
                {anonymous ? 'Anonymous' : displayName}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reviewing as</p>
            </div>
            <button
              onClick={() => setAnonymous(!anonymous)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: '1.5px solid var(--border)',
                background: anonymous ? 'var(--navy)' : 'white',
                color: anonymous ? 'white' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
              }}
            >
              {anonymous ? 'Anonymous ✓' : 'Go Anonymous'}
            </button>
          </div>

          {/* Rating */}
          <div style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(3,63,99,0.08)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Overall Rating</p>
            <StyledRating
              value={rating}
              onChange={(e, val) => setRating(val)}
              precision={0.5}
              sx={{ fontSize: '2rem' }}
            />
          </div>

          {/* Check categories */}
          <div style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(3,63,99,0.08)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>What stood out?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CHECK_CATEGORIES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleCheck(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8,
                    border: `1.5px solid ${checks[key] ? 'var(--teal)' : 'var(--border)'}`,
                    background: checks[key] ? 'rgba(40,102,110,0.08)' : 'white',
                    color: checks[key] ? 'var(--teal)' : 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                    {checks[key]
                      ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                      : <circle cx="12" cy="12" r="10"/>
                    }
                  </svg>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(3,63,99,0.08)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Your Review</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share your experience with this property..."
              maxLength={1000}
              rows={4}
              style={{
                width: '100%', border: '1.5px solid var(--border)', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                color: 'var(--navy)', outline: 'none', resize: 'vertical',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>{description.length}/1000</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none',
              background: isValid ? 'var(--teal)' : 'var(--border)',
              color: isValid ? 'var(--cream)' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
              cursor: isValid ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
            }}
          >
            Submit Review
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default ReviewModal;