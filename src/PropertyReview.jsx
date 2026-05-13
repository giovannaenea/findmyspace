import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './PropertyReview.css';
import Favorite from './Favorite';

export const formatBeds = (bedOptions) => {
  if (!bedOptions || bedOptions.length === 0) return 'N/A';
  const numberedOptions = bedOptions.sort((a, b) => a - b).map(option => option == 'Studio' ? 0 : parseInt(option[0]));
  let result = bedOptions[0];
  let consecutive = 1;
  for (let i = 1; i < bedOptions.length; i++) {
    if (numberedOptions[i] === numberedOptions[i - 1] + 1) {
      consecutive++;
    } else {
      if (consecutive > 1) result += ` - ${bedOptions[i - 1]}`;
      result += `, ${bedOptions[i]}`;
      consecutive = 1;
    }
  }
  if (consecutive > 1) result += ` - ${bedOptions[bedOptions.length - 1]}`;
  return result;
};

const PropertyReview = ({ id, name, rating, address, price, bedOptions, walkingTime, photos, reviews, user, handleSignIn }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!user) {
      sessionStorage.setItem('postSignInNav', `/property/${id}`);
      handleSignIn();
    } else {
      navigate(`/property/${id}`);
    }
  };

  return (
    <div className="property-card" onClick={handleClick}>
      <div className="property-card-image-wrap">
        {photos && photos[0] && (
          <img
            className="property-card-image"
            src={photos[0]}
            alt={name}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="property-card-price-badge">
          NT$ {price?.toLocaleString()}/mo
        </div>
        {user && user.role === 'tenant' && (
          <div className="property-card-favorite" onClick={e => e.stopPropagation()}>
            <Favorite userId={user.uid} propertyId={id} />
          </div>
        )}
        {!user && (
          <div className="property-card-lock">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ flexShrink: 0 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Sign in to view
          </div>
        )}
      </div>

      <div className="property-card-body">
        <h3 className="property-card-name">{name}</h3>
        <p className="property-card-address">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 5C11.5 7.49 7 13.5 7 13.5C7 13.5 2.5 7.49 2.5 5C2.5 3.80653 2.97411 2.66193 3.81802 1.81802C4.66193 0.974106 5.80653 0.5 7 0.5C8.19347 0.5 9.33807 0.974106 10.182 1.81802C11.0259 2.66193 11.5 3.80653 11.5 5V5Z" /><path d="M7 6.5C7.82843 6.5 8.5 5.82843 8.5 5C8.5 4.17157 7.82843 3.5 7 3.5C6.17157 3.5 5.5 4.17157 5.5 5C5.5 5.82843 6.17157 6.5 7 6.5Z" />
          </svg>
          {address}
        </p>
        <div className="property-card-meta">
          {/* Bed icon — corrected from house to bed */}
          <div className="property-card-meta-item">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5 0.5H2.5C1.94772 0.5 1.5 0.947715 1.5 1.5V12.5C1.5 13.0523 1.94772 13.5 2.5 13.5H11.5C12.0523 13.5 12.5 13.0523 12.5 12.5V1.5C12.5 0.947715 12.0523 0.5 11.5 0.5Z" /><path d="M9.5 0.5V3.5H4.5V0.5" /><path d="M1.5 6H12.5" />
            </svg>
            {bedOptions ? formatBeds(bedOptions) : 'N/A'}
          </div>

          {/* Rating */}
          <div className="property-card-meta-item">
            <svg viewBox="0 0 24 24" fill="#b5b682" stroke="#b5b682" strokeWidth="1" width="14" height="14">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {rating?.toFixed(1)} ({reviews?.length || 0})
          </div>
        </div>
      </div>
    </div>
  );
};

PropertyReview.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired,
  price: PropTypes.number,
  bedOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  photos: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleSignIn: PropTypes.func,
};

export default PropertyReview;