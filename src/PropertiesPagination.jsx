import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PropertyReview from './PropertyReview';
import './PropertiesPagination.css';

const PropertiesPagination = ({ properties, user, handleSignIn, onReturnToPending }) => {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const offset = (page - 1) * PER_PAGE;
    if (properties.slice(offset, offset + PER_PAGE).length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [properties, page]);

  // Reset to page 1 when the property list changes (e.g. filter/sort applied)
  useEffect(() => {
    setPage(1);
  }, [properties.length]);

  const goToPage = (n) => {
    setPage(n);
    // Scroll to top of listings so user sees page 2 from the start
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offset = (page - 1) * PER_PAGE;
  const currentProperties = properties.slice(offset, offset + PER_PAGE);
  const totalPages = Math.ceil(properties.length / PER_PAGE);

  const dismissKeyboard = () => {
    if (document.activeElement) document.activeElement.blur();
  };

  return (
    <div className="listings-container" onTouchStart={dismissKeyboard}>
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
};

export default PropertiesPagination;