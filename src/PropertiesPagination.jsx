import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import PropertyReview from './PropertyReview';
import './PropertiesPagination.css';

const PULL_THRESHOLD = 72;  // px of pull needed to trigger refresh

const PropertiesPagination = ({ properties, user, handleSignIn, onReturnToPending, onRefresh }) => {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // ── Pull-to-refresh state ─────────────────────────────────────────
  const [pullY, setPullY]         = useState(0);   // current drag distance
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pulling     = useRef(false);

  const handleTouchStart = useCallback((e) => {
    // Only start pull tracking when the page is scrolled to the very top
    if (window.scrollY > 0) return;
    touchStartY.current = e.touches[0].clientY;
    pulling.current = true;
    // also dismiss keyboard
    if (document.activeElement) document.activeElement.blur();
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) {
      // Dampen the drag so it feels spring-like
      setPullY(Math.min(PULL_THRESHOLD * 1.5, dy * 0.45));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullY >= PULL_THRESHOLD && onRefresh) {
      setRefreshing(true);
      setPullY(PULL_THRESHOLD); // snap to resting position while refreshing
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
  }, [pullY, onRefresh]);

  // ── Pagination ────────────────────────────────────────────────────
  useEffect(() => {
    const offset = (page - 1) * PER_PAGE;
    if (properties.slice(offset, offset + PER_PAGE).length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [properties, page]);

  useEffect(() => { setPage(1); }, [properties.length]);

  const goToPage = (n) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offset = (page - 1) * PER_PAGE;
  const currentProperties = properties.slice(offset, offset + PER_PAGE);
  const totalPages = Math.ceil(properties.length / PER_PAGE);

  const pullProgress = Math.min(pullY / PULL_THRESHOLD, 1);
  const isTriggered  = pullY >= PULL_THRESHOLD;

  return (
    <div
      className="listings-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: pullY > 0 ? `translateY(${pullY}px)` : undefined, transition: pullY === 0 ? 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none' }}
    >
      {/* Pull-to-refresh indicator */}
      {(pullY > 0 || refreshing) && (
        <div className="ptr-indicator" style={{ opacity: refreshing ? 1 : pullProgress, transform: `translateY(${refreshing ? 0 : -48 + pullY * 0.6}px)` }}>
          <div className={`ptr-spinner${refreshing || isTriggered ? ' ptr-spinner--spin' : ''}`} style={{ transform: `rotate(${pullProgress * 180}deg)` }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="var(--teal)" strokeWidth="2.2" strokeDasharray="56" strokeDashoffset={refreshing ? 0 : 56 - pullProgress * 56} strokeLinecap="round" />
            </svg>
          </div>
          <span className="ptr-label">{refreshing ? 'Refreshing…' : isTriggered ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      )}

      <div className="listings-header">
        <h2 className="listings-title">Available Listings</h2>
        <span className="listings-count">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</span>
      </div>
      <div className="listings-grid">
        {currentProperties.map((property) => (
          <PropertyReview
            key={property.id}
            id={property.id}
            name={property.name}
            rating={property.rating}
            address={property.address}
            price={property.price}
            bedOptions={property.bedOptions}
            photos={property.photos}
            reviews={property.reviews}
            user={user}
            handleSignIn={handleSignIn}
            landlordId={property.landlordId}
            onReturnToPending={onReturnToPending}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="listings-pagination">
          <button
            className="listings-page-btn"
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            &#8249;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`listings-page-btn${page === n ? ' listings-page-btn--active' : ''}`}
              onClick={() => goToPage(n)}
              aria-label={`Page ${n}`}
            >
              {n}
            </button>
          ))}
          <button
            className="listings-page-btn"
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            &#8250;
          </button>
        </div>
      )}
    </div>
  );
};

PropertiesPagination.propTypes = {
  properties: PropTypes.array.isRequired,
  user: PropTypes.object,
  handleSignIn: PropTypes.func,
  onReturnToPending: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default PropertiesPagination;