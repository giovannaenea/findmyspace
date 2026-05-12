import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase.mjs';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import ImageSlider from './ImageSlider';
import ReviewSection from './ReviewSection';
import ReviewsPagination from './ReviewsPagination';
import Loading from './Loading';
import MenuSelect from './MenuSelect';
import { formatBeds } from './PropertyReview';
import './PropertyDetails.css';

const PropertyDetails = ({ user, handleSignIn, handleSignOut, handleSearch, showToast }) => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [landlordName, setLandlordName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    try {
      const propertyRef = doc(db, 'properties', id);
      const docSnap = await getDoc(propertyRef);

      if (!docSnap.exists()) {
        setNotFound(true);
        return;
      }

      const raw = docSnap.data();
      const data = { id, ...raw, reviews: raw.reviews ?? [] };
      setProperty(data);

      // Landlord fetch — separate try/catch so failures don't trigger error toast
      try {
        if (data.landlordId) {
          const landlordSnap = await getDoc(doc(db, 'users', data.landlordId));
          if (landlordSnap.exists()) {
            setLandlordName(data.landlordName || landlordSnap.data().name || 'Unknown');
          } else if (data.landlordName) {
            setLandlordName(data.landlordName);
          }
        }
      } catch {
        if (data.landlordName) setLandlordName(data.landlordName);
      }

    } catch (error) {
      console.error('Error fetching property:', error);
      showToast?.('Failed to load property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiSummary = async () => {
    if (!property.reviews || property.reviews.length === 0) return;
    setAiLoading(true);
    setAiSummary('');
    try {
      const { summarizeReviews } = await import('./gemini.js');
      const summary = await summarizeReviews(property.reviews);
      setAiSummary(summary || 'Could not generate summary.');
    } catch {
      setAiSummary('Could not generate summary.');
      showToast?.('AI summary failed. Please try again.');
    }
    setAiLoading(false);
  };

  const calculateRating = (reviews) =>
    reviews.length === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const handleNewReview = async (newReview) => {
    try {
      const propertyRef = doc(db, 'properties', property.id);
      const docSnap = await getDoc(propertyRef);
      const newReviews = [...docSnap.data().reviews, newReview];
      const newRating = calculateRating(newReviews);
      const newPhotos = [...docSnap.data().photos, ...newReview.photos];
      const updatedProperty = {
        ...docSnap.data(),
        photos: newPhotos,
        numberOfReviews: property.numberOfReviews + 1,
        rating: parseFloat(newRating.toFixed(2)),
        reviews: newReviews,
      };
      await setDoc(propertyRef, updatedProperty, { merge: true });
      setProperty({ id: property.id, ...updatedProperty });
      handleSearch();
      showToast?.('Review submitted!', 'success');
    } catch (error) {
      console.error('Error adding review', error);
      showToast?.('Failed to submit review. Please try again.');
    }
  };

  const handleReply = async (reviewId, replyText) => {
    try {
      const propertyRef = doc(db, 'properties', property.id);
      const updatedReviews = property.reviews.map(r =>
        r.id === reviewId ? { ...r, landlordReply: replyText } : r
      );
      await setDoc(propertyRef, { reviews: updatedReviews }, { merge: true });
      setProperty(prev => ({ ...prev, reviews: updatedReviews }));
      showToast?.('Reply saved!', 'success');
    } catch (error) {
      console.error('Error saving reply:', error);
      showToast?.('Failed to save reply. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const propertyRef = doc(db, 'properties', property.id);
      const docSnap = await getDoc(propertyRef);
      if (docSnap.exists()) {
        const newReviews = property.reviews.filter(r => r.id !== reviewId);
        const newRating = calculateRating(newReviews);
        const updatedProperty = {
          ...docSnap.data(),
          numberOfReviews: property.numberOfReviews - 1,
          rating: parseFloat(newRating.toFixed(2)),
          reviews: newReviews,
        };
        await setDoc(propertyRef, updatedProperty, { merge: true });
        setProperty({ id: property.id, ...updatedProperty });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast?.('Failed to delete review. Please try again.');
    }
  };

  if (loading) return <Loading />;

  if (notFound) return (
    <div className="detail-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 12 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" width="48" height="48">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
      </svg>
      <h2 style={{ color: 'var(--navy)', fontSize: 18, fontWeight: 700 }}>Property not found</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>This listing may have been removed or the link is invalid.</p>
      <button onClick={() => navigate('/')} style={{ marginTop: 8, padding: '10px 24px', background: 'var(--teal)', color: 'var(--cream)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
        Back to Home
      </button>
    </div>
  );

  const amenityAll = [
    'Furniture', 'Private Bathroom', 'Shared Bathroom', 'Washer', 'Dryer',
    'Pets Allowed', 'Water Dispenser', 'Refrigerator', 'Parking',
    'Laundry Room', 'AC', 'Cooking Allowed',
  ];

  return (
    <div className="detail-page">
      <div className="detail-topbar">
        <button className="detail-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="detail-topbar-title">{property.name}</h2>
        <div style={{ width: 28 }} />
      </div>

      <ImageSlider images={property.photos} user={user} propertyId={property.id} />

      <div className="detail-content">
        {/* Title + Price */}
        <div className="detail-title-row">
          <div>
            <h1 className="detail-name">{property.name}</h1>
            {property.address && (
              <p className="detail-location-line">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 5C11.5 7.49 7 13.5 7 13.5C7 13.5 2.5 7.49 2.5 5C2.5 3.80653 2.97411 2.66193 3.81802 1.81802C4.66193 0.974106 5.80653 0.5 7 0.5C8.19347 0.5 9.33807 0.974106 10.182 1.81802C11.0259 2.66193 11.5 3.80653 11.5 5V5Z" /><path d="M7 6.5C7.82843 6.5 8.5 5.82843 8.5 5C8.5 4.17157 7.82843 3.5 7 3.5C6.17157 3.5 5.5 4.17157 5.5 5C5.5 5.82843 6.17157 6.5 7 6.5Z" />
                </svg>
                {property.address}
              </p>
            )}

            <button
              className="detail-maps-link"
              onClick={() => window.open(`https://www.google.com/maps?q=${property.lat},${property.lng}`, '_blank')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Open in Google Maps
            </button>
          </div>
          <div className="detail-price-block">
            <span className="detail-price">NT$ {property.price?.toLocaleString()}</span>
            <span className="detail-price-label">per month</span>
          </div>
        </div>

        {/* Rating */}
        <div className="detail-rating-row">
          <svg viewBox="0 0 24 24" fill="#b5b682" stroke="#b5b682" strokeWidth="1" width="16" height="16">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="detail-rating-val">{property.rating?.toFixed(1)}</span>
          <span className="detail-review-count">({property.reviews?.length || 0})</span>
          <span className="detail-badge">{property.housingType}</span>
        </div>

        {/* Property Details */}
        <div className="detail-card">
          <h3 className="detail-card-title">Property Details</h3>
          <div className="detail-stats">
            <div className="detail-stat">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 0.5H2.5C1.94772 0.5 1.5 0.947715 1.5 1.5V12.5C1.5 13.0523 1.94772 13.5 2.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V1.5C12.5 0.947715 12.0523 0.5 11.5 0.5Z" /><path d="M9.5 0.5V3.5H4.5V0.5" /><path d="M1.5 6H12.5" />
              </svg>
              <span className="detail-stat-val">{formatBeds(property.bedOptions)}</span>
              <span className="detail-stat-label">Bedrooms</span>
            </div>
            <div className="detail-stat">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6.5C3 5.43913 3.42143 4.42172 4.17157 3.67157C4.92172 2.92143 5.93913 2.5 7 2.5C8.06087 2.5 9.07828 2.92143 9.82843 3.67157C10.5786 4.42172 11 5.43913 11 6.5H3Z" /><path d="M5 9.5V10.5" /><path d="M3.5 12.5V13.5" /><path d="M7 12.5V13.5" /><path d="M10.5 12.5V13.5" /><path d="M9 9.5V10.5" /><path d="M7 2.5V0.5" />
              </svg>
              <span className="detail-stat-val">
                {property.amenities?.includes('Private Bathroom') ? 'Private'
                  : property.amenities?.includes('Shared Bathroom') ? 'Shared' : '—'}
              </span>
              <span className="detail-stat-label">Bathroom</span>
            </div>
            {property.walkingTime > 0 && (
              <div className="detail-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                  <circle cx="12" cy="5" r="1" fill="currentColor" />
                  <path d="m9 20 1-5 2 3 2-8 1 5" />
                  <path d="m6 10 3-3 2 2 2-2 3 3" />
                </svg>
                <span className="detail-stat-val">{property.walkingTime}</span>
                <span className="detail-stat-label">Min walk</span>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="detail-card">
          <h3 className="detail-card-title">Property Features</h3>
          <div className="amenity-list">
            {amenityAll.map(a => {
              const has = property.amenities?.includes(a);
              return (
                <div key={a} className={`amenity-row ${has ? 'has' : 'no'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    {has
                      ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                      : <><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></>
                    }
                  </svg>
                  {a}
                </div>
              );
            })}
          </div>
        </div>

        {/* Landlord Info */}
        <div className="detail-card">
          <h3 className="detail-card-title">Landlord Information</h3>

          {landlordName && (
            <div className="detail-contact-row" style={{ marginBottom: 12 }}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
                <path d="M6.68 7C8.47493 7 9.93 5.54493 9.93 3.75C9.93 1.95507 8.47493 0.5 6.68 0.5C4.88508 0.5 3.43 1.95507 3.43 3.75C3.43 5.54493 4.88508 7 6.68 7Z" /><path d="M12.86 13.5C12.4402 12.1909 11.6155 11.0489 10.5048 10.2386C9.3941 9.42842 8.05481 8.99184 6.68 8.99184C5.3052 8.99184 3.96591 9.42842 2.85522 10.2386C1.74453 11.0489 0.919826 12.1909 0.500004 13.5H12.86Z" />
              </svg>
              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{landlordName}</span>
            </div>
          )}

          {user ? (
            <div className="detail-contact">
              <div className="detail-contact-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.58 5.08 2 2 0 0 1 3.55 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.84a16 16 0 0 0 6.85 6.84l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.92z" />
                </svg>
                <span>{property.phone || 'Not provided'}</span>
              </div>
              <div className="detail-contact-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{property.line ? `Line: ${property.line}` : 'Line ID: Not provided'}</span>
              </div>
            </div>
          ) : (
            <button className="detail-login-prompt" onClick={handleSignIn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Sign in to view contact information
            </button>
          )}
        </div>

        {/* AI Review Summary */}
        {property.reviews?.some(r => (r.description || r.comment || '').trim().length > 0) && (
          <div className="detail-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: aiSummary ? 12 : 0 }}>
              <h3 className="detail-card-title" style={{ margin: 0 }}>AI Review Summary</h3>
              <button
                onClick={handleAiSummary}
                disabled={aiLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 20,
                  border: 'none', background: aiLoading ? 'var(--border)' : 'var(--teal)',
                  color: aiLoading ? 'var(--text-muted)' : 'var(--cream)',
                  fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
                  cursor: aiLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                  <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" />
                </svg>
                {aiLoading ? 'Summarizing...' : aiSummary ? 'Regenerate' : 'Summarize Reviews'}
              </button>
            </div>
            {aiSummary && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {aiSummary}
              </p>
            )}
          </div>
        )}

        <ReviewSection
          user={user}
          propertyId={property.id}
          handleSignIn={handleSignIn}
          rating={property.rating}
          reviews={property.reviews}
          handleNewReview={handleNewReview}
        />
        <ReviewsPagination
          user={user}
          property={property}
          handleDeleteReview={handleDeleteReview}
          handleReply={handleReply}
        />
      </div>

      <div className="menu-container">
        <MenuSelect user={user} />
      </div>
    </div>
  );
};

export default PropertyDetails;