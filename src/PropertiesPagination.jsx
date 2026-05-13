import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Pagination from '@mui/material/Pagination';
import PropertyReview from './PropertyReview';
import './PropertiesPagination.css';

const PropertiesPagination = ({ properties, user, handleSignIn }) => {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const offset = (page - 1) * PER_PAGE;
    if (properties.slice(offset, offset + PER_PAGE).length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [properties, page]);

  const offset = (page - 1) * PER_PAGE;
  const currentProperties = properties.slice(offset, offset + PER_PAGE);

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
          />
        ))}
      </div>
      {Math.ceil(properties.length / PER_PAGE) > 1 && (
        <div className="listings-pagination">
          <Pagination
            count={Math.ceil(properties.length / PER_PAGE)}
            page={page}
            onChange={(e, value) => setPage(value)}
            size="small"
            sx={{
              '& .MuiPaginationItem-root': { color: '#033f63' },
              '& .MuiPaginationItem-root.Mui-selected': { background: '#033f63', color: '#fff' },
            }}
          />
        </div>
      )}
    </div>
  );
};

PropertiesPagination.propTypes = {
  properties: PropTypes.array.isRequired,
  user: PropTypes.object,
  handleSignIn: PropTypes.func,
};

export default PropertiesPagination;