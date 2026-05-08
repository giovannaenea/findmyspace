import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@mui/material';
import './FilterPage.css';

const amenityOptions = [
  'Furniture', 'Private Bathroom', 'Shared Bathroom', 'Washer & Dryer',
  'Pets Allowed', 'Water Dispenser', 'Refrigerator', 'Parking',
  'Laundry Room', 'AC', 'Cooking Allowed',
];

const FilterPage = ({ conditions, onSearch }) => {
  const navigate = useNavigate();
  const [rentRange, setRentRange] = useState(conditions.rentRange || [1000, 30000]);
  const [bedOptions, setBedOptions] = useState(conditions.bedOptions || 'All');
  const [amenities, setAmenities] = useState(conditions.amenities || []);
  const [orderBy, setOrderBy] = useState(conditions.orderBy || 'All');

  const bedChoices = ['All', '1 Bedroom', '2 Bedrooms', '3+ Bedrooms'];

  const toggleAmenity = (option) => {
    setAmenities(prev =>
      prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
    );
  };

  const handleApply = () => {
    onSearch({
      ...conditions,
      rentRange,
      bedOptions,
      amenities,   // pass the full array — App.jsx uses .every() now
      orderBy,
    });
    navigate('/');
  };

  const handleReset = () => {
    const resetConditions = {
      searchTerm: conditions.searchTerm || '',
      bedOptions: 'All',
      orderBy: 'All',
      amenities: [],
      rentRange: [1000, 30000],
    };
    setRentRange([1000, 30000]);
    setBedOptions('All');
    setAmenities([]);
    setOrderBy('All');
    onSearch(resetConditions);
    navigate('/');
  };

  const activeFilterCount = [
    bedOptions !== 'All' ? 1 : 0,
    amenities.length,
    (rentRange[0] !== 1000 || rentRange[1] !== 30000) ? 1 : 0,
    orderBy !== 'All' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="filter-page">
      <div className="filter-header">
        <button className="filter-back" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="filter-title">
          Filters {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
        </h2>
        <button className="filter-reset" onClick={handleReset}>Reset All</button>
      </div>

      <div className="filter-body">

        {/* Price Range */}
        <div className="filter-section">
          <h3 className="filter-section-title">Price Range (NT$/month)</h3>
          <div className="price-labels">
            <span>NT$ {rentRange[0].toLocaleString()}</span>
            <span>to</span>
            <span>NT$ {rentRange[1].toLocaleString()}</span>
          </div>
          <Slider
            value={rentRange}
            onChange={(e) => setRentRange(e.target.value)}
            min={1000}
            max={30000}
            step={100}
            sx={{
              color: '#033f63',
              '& .MuiSlider-thumb': { backgroundColor: '#033f63' },
              '& .MuiSlider-track': { backgroundColor: '#033f63' },
              '& .MuiSlider-rail': { backgroundColor: '#e8eaec' },
            }}
          />
          <div className="price-minmax">
            <span>NT$ 1,000</span>
            <span>NT$ 30,000</span>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="filter-section">
          <h3 className="filter-section-title">Bedrooms</h3>
          <div className="bed-options">
            {bedChoices.map(b => (
              <button
                key={b}
                className={`bed-btn ${bedOptions === b ? 'active' : ''}`}
                onClick={() => setBedOptions(b)}
              >
                {b === 'All' ? 'Any' : b}
              </button>
            ))}
          </div>
        </div>

        {/* Property Features */}
        <div className="filter-section">
          <h3 className="filter-section-title">
            Property Features
            {amenities.length > 0 && (
              <span className="filter-section-count">{amenities.length} selected</span>
            )}
          </h3>
          <div className="amenity-grid">
            {amenityOptions.map(option => (
              <button
                key={option}
                className={`amenity-chip ${amenities.includes(option) ? 'active' : ''}`}
                onClick={() => toggleAmenity(option)}
              >
                {amenities.includes(option) && <span className="amenity-check">✓ </span>}
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="filter-section">
          <h3 className="filter-section-title">Sort By</h3>
          <div className="sort-options">
            {[
              { value: 'All', label: 'Recommended' },
              { value: 'rating', label: 'Highest Rating' },
              { value: 'numberOfReviews', label: 'Most Reviews' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`bed-btn ${orderBy === opt.value ? 'active' : ''}`}
                onClick={() => setOrderBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="filter-footer">
        <button className="apply-btn" onClick={handleApply}>
          Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>
    </div>
  );
};

export default FilterPage;