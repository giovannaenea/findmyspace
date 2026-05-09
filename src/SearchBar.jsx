import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import FilterDropdown from './FilterDropdown';
import GoogleSignInButton from './GoogleSignIn';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import { FormControl, FormLabel, FormControlLabel, Slider } from '@mui/material';

const SearchBar = ({onSearch, user, handleSignIn, handleSignOut, conditions}) => {
  const [searchTerm, setSearchTerm] = useState(conditions['searchTerm']);
  const [showFilters, setShowFilters] = useState(false);
  const [orderBy, setOrderBy] = useState(conditions['orderBy']);
  const [rentRange, setRentRange] = useState(conditions['rentRange']);
  const [numberOfBedsOption, setNumberOfBedsOption] = useState(conditions['bedOptions']);
  const [showOrderBy, setShowOrderBy] = useState(false);
  const [amenities, setAmenities] = useState(conditions['amenities']);
  const [bathroomOption, setBathroomOption] = useState(conditions['bathroomType'] || 'Any');

  useEffect(() => {
    setSearchTerm(conditions['searchTerm']);
    setOrderBy(conditions['orderBy']);
    setNumberOfBedsOption(conditions['bedOptions']);
    setAmenities(conditions['amenities']);
    setRentRange(conditions['rentRange']);
    setBathroomOption(conditions['bathroomType'] || 'Any');
  }, [conditions]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    setShowOrderBy(false);
  };

  const toggleOrderBy = () => {
    setShowOrderBy(!showOrderBy);
    setShowFilters(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    handleSearchUpdate('searchTerm', e.target.value);
  };

  const handleCheckBoxChange = (option) => {
    const currentIndex = amenities.indexOf(option);
    const newSelectedOptions = [...amenities];
    if (currentIndex === -1) {
      newSelectedOptions.push(option);
    } else {
      newSelectedOptions.splice(currentIndex, 1);
    }
    setAmenities(newSelectedOptions);
    handleSearchUpdate('amenities', newSelectedOptions);
  };

  const handleOrderByChange = (option) => {
    setOrderBy(option);
    handleSearchUpdate('orderBy', option);
  };

  const handleNumberOfBedsChange = (option) => {
    setNumberOfBedsOption(option);
    handleSearchUpdate('numberOfBeds', option);
  };

  const handleRentCommit = () => {
    handleSearchUpdate('rent', rentRange);
  };

  const handleBathroomChange = (option) => {
    setBathroomOption(option);
    handleSearchUpdate('bathroomType', option);
  };

  const handleSearchUpdate = (key, option) => {
    const searchConditions = {
      searchTerm: key === 'searchTerm' ? option : searchTerm,
      bedOptions: key === 'numberOfBeds' ? option : numberOfBedsOption,
      orderBy: key === 'orderBy' ? option : orderBy,
      amenities: key === 'amenities' ? option : amenities,
      rentRange: key === 'rent' ? option : rentRange,
      bathroomType: key === 'bathroomType' ? option : bathroomOption,
    };
    onSearch(searchConditions);
  };

  const orderByOptions = [
    { value: 'All', label: 'Recommended' },
    { value: 'rating', label: 'Rating' },
    { value: 'numberOfReviews', label: 'Number of Reviews' },
  ];

  const numberOfBeds = [
    { value: 'All', label: 'All Beds' },
    { value: '1 Bedroom', label: '1 Bedroom' },
    { value: '2 Bedrooms', label: '2 Bedrooms' },
    { value: '3+ Bedrooms', label: '3+ Bedrooms' },
  ];

  const amenityOptions = [
    'Furniture', 'Private Bathroom', 'Shared Bathroom', 'Washer', 'Dryer',
    'Pets Allowed', 'Water Dispenser', 'Refrigerator', 'Parking',
    'Laundry Room', 'AC', 'Cooking Allowed',
  ];

  const navigate = useNavigate();
  const handleAddClick = () => {
    if (!user) {
      // Store the intended destination so App.jsx can redirect after sign-in
      sessionStorage.setItem('postSignInNav', '/add');
      handleSignIn();
    } else {
      navigate('/add');
    }
  };

  const bathroomOptions = [
    { value: 'Any', label: 'Any' },
    { value: 'Private Bathroom', label: 'Single (Private)' },
    { value: 'Shared Bathroom', label: 'Shared' },
  ];

  const activeFilterCount =
    (numberOfBedsOption !== 'All' ? 1 : 0) +
    (bathroomOption !== 'Any' ? 1 : 0) +
    amenities.length +
    (rentRange[0] !== 1000 || rentRange[1] !== 30000 ? 1 : 0);

  return (
    <div className="navbar">
      {/* Top bar */}
      <div className="navbar-top">
        <span className="navbar-logo">FindMySpace</span>
        <div className="navbar-actions">
          {user?.role === 'landlord' && (
            <Tooltip title="Add new building">
              <button className="add-btn" onClick={handleAddClick}>
                <AddIcon style={{ fontSize: 18 }} />
              </button>
            </Tooltip>
          )}
          <GoogleSignInButton
            user={user}
            handleSignIn={handleSignIn}
            handleSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* Hero + Search */}
      <div className="navbar-hero">
        <h1 className="hero-title">Find your home</h1>
        <p className="hero-subtitle">Near National Dong Hwa University</p>
        <div className="search-row">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button
            className={`filter-nav-btn${activeFilterCount > 0 ? ' filter-nav-btn--active' : ''}`}
            onClick={toggleFilters}
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3.5C2.82843 3.5 3.5 2.82843 3.5 2C3.5 1.17157 2.82843 0.5 2 0.5C1.17157 0.5 0.5 1.17157 0.5 2C0.5 2.82843 1.17157 3.5 2 3.5Z" /><path d="M3.5 2H13.5" /><path d="M7 8.5C7.82843 8.5 8.5 7.82843 8.5 7C8.5 6.17157 7.82843 5.5 7 5.5C6.17157 5.5 5.5 6.17157 5.5 7C5.5 7.82843 6.17157 8.5 7 8.5Z" /><path d="M0.5 7H5.5" /><path d="M8.5 7H13.5" /><path d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z" /><path d="M10.5 12H0.5" />
            </svg>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        {/* Sort chips */}
        <div className="sort-chips">
          {orderByOptions.map(opt => (
            <button
              key={opt.value}
              className={`sort-chip${orderBy === opt.value ? ' sort-chip--active' : ''}`}
              onClick={() => handleOrderByChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter drawer */}
      {showFilters && (
        <div className="filter-drawer">
          <div className="filter-drawer-header">
            <span className="filter-drawer-title">Filters</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeFilterCount > 0 && (
                <button className="filter-clear-btn" onClick={() => {
                  setNumberOfBedsOption('All');
                  setBathroomOption('Any');
                  setAmenities([]);
                  setRentRange([1000, 30000]);
                  onSearch({
                    searchTerm,
                    bedOptions: 'All',
                    orderBy,
                    amenities: [],
                    rentRange: [1000, 30000],
                    bathroomType: 'Any',
                  });
                }}>
                  Clear all
                </button>
              )}
              <button className="filter-drawer-close" onClick={toggleFilters}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="filter-section">
            <p className="filter-section-label">Bathroom Type</p>
            <div className="filter-chips">
              {bathroomOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`filter-chip${bathroomOption === opt.value ? ' filter-chip--active' : ''}`}
                  onClick={() => handleBathroomChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <p className="filter-section-label">Bed</p>
            <div className="filter-chips">
              {numberOfBeds.map(opt => (
                <button
                  key={opt.value}
                  className={`filter-chip${numberOfBedsOption === opt.value ? ' filter-chip--active' : ''}`}
                  onClick={() => handleNumberOfBedsChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <p className="filter-section-label">Monthly Rent</p>
            <div className="filter-slider-row">
              <span className="filter-slider-label">NT${rentRange[0].toLocaleString()}</span>
              <FormControl style={{ flex: 1 }}>
                <Slider
                  value={rentRange}
                  onChange={(e) => setRentRange(e.target.value)}
                  onChangeCommitted={handleRentCommit}
                  valueLabelDisplay="auto"
                  getAriaValueText={(v) => `NT$${v}`}
                  min={1000}
                  max={30000}
                  step={100}
                  sx={{
                    color: 'var(--teal)',
                    '& .MuiSlider-thumb': { backgroundColor: 'var(--navy)' },
                    '& .MuiSlider-valueLabel': { backgroundColor: 'var(--navy)' },
                  }}
                />
              </FormControl>
              <span className="filter-slider-label">NT${rentRange[1].toLocaleString()}</span>
            </div>
          </div>

          <div className="filter-section">
            <p className="filter-section-label">Amenities</p>
            <div className="amenity-checks">
              {amenityOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={amenities.indexOf(option) !== -1}
                      onChange={() => handleCheckBoxChange(option)}
                      name={option}
                      size="small"
                      sx={{
                        color: 'var(--sage)',
                        '&.Mui-checked': { color: 'var(--teal)' },
                        padding: '4px 8px',
                      }}
                    />
                  }
                  label={<span style={{ fontSize: 13, color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif' }}>{option}</span>}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;