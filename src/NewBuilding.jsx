import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox, FormControl, FormControlLabel, FormLabel, FormGroup, Radio, RadioGroup, Button } from '@mui/material';
import ImageUrlInput from './ImageURLInput';
import Loading from './Loading';
import BackButton from './BackButton';
import { db } from './firebase.mjs';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './NewBuilding.css';

const NewBuilding = ({ handleNewProperty, showToast }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [lineId, setLineId] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [housingType, setHousingType] = useState('');
  const [bedOption, setBedOption] = useState('');
  const [price, setPrice] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [latError, setLatError] = useState('');
  const [lngError, setLngError] = useState('');
  const [walkingTime, setWalkingTime] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const navigate = useNavigate();

  const bedOptions = ['1 Bedroom', '2 Bedrooms', '3+ Bedrooms'];
  const amenityOptions = [
    'Furniture', 'Private Bathroom', 'Shared Bathroom', 'Washer', 'Dryer',
    'Pets Allowed', 'Water Dispenser', 'Refrigerator', 'Parking',
    'Laundry Room', 'AC', 'Cooking Allowed',
  ];

  const handleUploadingChange = (delta) => {
    setUploadingCount(prev => Math.max(0, prev + delta));
  };

  const validateCoord = (val, min, max) => {
    if (!val) return true; // optional
    const n = parseFloat(val);
    return !isNaN(n) && n >= min && n <= max;
  };

  useEffect(() => {
    const phoneDigits = phone.replace(/\D/g, '');
    const phoneValid = !phone || (phoneDigits.length >= 7 && phoneDigits.length <= 15);
    const latValid = validateCoord(lat, -90, 90);
    const lngValid = validateCoord(lng, -180, 180);
    setIsValid(
      !!name && !nameError && !!landlordName && !!address && !!housingType &&
      !!bedOption && !!price && amenities.length > 0 &&
      imageUrls.length > 0 && phoneValid && !phoneError &&
      latValid && lngValid
    );
  }, [name, nameError, address, housingType, bedOption, price, amenities, imageUrls, phone, phoneError, lat, lng]);

  const handleNameChange = async (e) => {
    const val = e.target.value;
    setName(val);
    if (!val) { setNameError(''); return; }
    const q = query(collection(db, 'properties'), where('name', '==', val.trim()));
    const snap = await getDocs(q);
    setNameError(!snap.empty ? 'A property with this name already exists.' : '');
  };

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
    setPhone(cleaned);
    if (!cleaned) { setPhoneError(''); return; }
    const digits = cleaned.replace(/\D/g, '');
    setPhoneError(digits.length < 7 || digits.length > 15 ? 'Must be 7–15 digits' : '');
  };

  const handleLatChange = (e) => {
    setLat(e.target.value);
    setLatError(e.target.value && !validateCoord(e.target.value, -90, 90) ? 'Must be between -90 and 90' : '');
  };

  const handleLngChange = (e) => {
    setLng(e.target.value);
    setLngError(e.target.value && !validateCoord(e.target.value, -180, 180) ? 'Must be between -180 and 180' : '');
  };

  const handleAmenityChange = (option) => {
    setAmenities(prev =>
      prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
    );
  };

  const deleteImageUrl = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setAttempted(true);
    if (!isValid || uploadingCount > 0) return;
    setLoading(true);
    try {
      const newProperty = {
        name,
        address,
        phone,
        line: lineId,
        landlordName,
        housingType,
        bedOptions: [bedOption],
        amenities,
        price: parseInt(price),
        photos: imageUrls,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        walkingTime: walkingTime ? parseInt(walkingTime) : 0,
        rating: 0,
        numberOfReviews: 0,
        reviews: [],
        status: 'pending',
      };

      const success = await handleNewProperty(newProperty);
      if (success) {
        setSubmitted(true);
      } else {
        showToast?.('Failed to submit listing. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      showToast?.('Failed to submit listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (condition) => attempted && !condition;

  if (submitted) {
    return (
      <div className="new-building-page-container">
        <div className="new-building-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" width="52" height="52" style={{ marginBottom: 16 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 style={{ color: 'var(--navy)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Listing Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your property has been submitted for review. It will appear in listings once approved.
            </p>
            <button onClick={() => navigate('/')} style={{
              padding: '12px 28px', background: 'var(--teal)', color: 'var(--cream)',
              border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14,
              fontWeight: 700, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
            }}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="new-building-page-container">
      {loading ? <Loading /> : (
        <div className="new-building-container">
          <BackButton />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', margin: '4px 0 8px' }}>List Your Property</h1>

          <div className="nb-field">
            <label className="nb-label">Building Name *</label>
            <input className={`nb-input${(!!nameError || fieldError(name)) ? ' nb-input-error' : ''}`} value={name} onChange={handleNameChange} placeholder="Building name" />
            {(nameError || fieldError(name)) && <p className="nb-error">{nameError || 'Building name is required'}</p>}
          </div>

          <div className="nb-field">
            <label className="nb-label">Address *</label>
            <input className={`nb-input${fieldError(address) ? ' nb-input-error' : ''}`} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" />
            {fieldError(address) && <p className="nb-error">Address is required</p>}
          </div>

          <div className="nb-field">
            <label className="nb-label">Location Coordinates</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <input
                  className={`nb-input${latError ? ' nb-input-error' : ''}`}
                  value={lat}
                  onChange={handleLatChange}
                  placeholder="Latitude e.g. 23.8897"
                  type="number"
                  step="any"
                />
                {latError && <p className="nb-error">{latError}</p>}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  className={`nb-input${lngError ? ' nb-input-error' : ''}`}
                  value={lng}
                  onChange={handleLngChange}
                  placeholder="Longitude e.g. 121.5508"
                  type="number"
                  step="any"
                />
                {lngError && <p className="nb-error">{lngError}</p>}
              </div>
            </div>
            <p className="nb-hint">
              Find coordinates: open Google Maps → right-click your property location → click the coordinates shown at the top to copy them
            </p>
          </div>

          <div className="nb-field">
            <label className="nb-label">Walking Time to Campus (minutes)</label>
            <input
              className="nb-input"
              value={walkingTime}
              onChange={e => setWalkingTime(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 10"
              inputMode="numeric"
            />
            <p className="nb-hint">Optional — shown on the listing as walking distance to NDHU</p>
          </div>

          <div className="nb-field">
            <label className="nb-label">Phone Number</label>
            <input className={`nb-input${phoneError ? ' nb-input-error' : ''}`} value={phone} onChange={handlePhoneChange} placeholder="e.g. +0912345678" inputMode="tel" />
            {phoneError && <p className="nb-error">{phoneError}</p>}
          </div>

          <div className="nb-field">
            <label className="nb-label">Line ID</label>
            <input className="nb-input" value={lineId} onChange={e => setLineId(e.target.value)} placeholder="Line ID" />
          </div>

          <div className="nb-field">
            <label className="nb-label">Landlord / Contact Name *</label>
            <input className={`nb-input${fieldError(landlordName) ? ' nb-input-error' : ''}`} value={landlordName} onChange={e => setLandlordName(e.target.value)} placeholder="Your name" />
            {fieldError(landlordName) ? <p className="nb-error">Landlord name is required</p> : <p className="nb-hint">Name shown to tenants on the listing</p>}
          </div>

          <div className="nb-field">
            <label className="nb-label">Monthly Rent (NT$) *</label>
            <input className={`nb-input${fieldError(price) ? ' nb-input-error' : ''}`} value={price} onChange={e => setPrice(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 8000" inputMode="numeric" />
            {fieldError(price) && <p className="nb-error">Rent amount is required</p>}
          </div>

          <FormControl required error={fieldError(housingType)}>
            <FormLabel>Housing Type {fieldError(housingType) && <span style={{ color: '#e53e3e', fontSize: 12 }}> — required</span>}</FormLabel>
            <RadioGroup row value={housingType} onChange={e => setHousingType(e.target.value)}>
              <FormControlLabel value="Apartment" control={<Radio />} label="Apartment" />
              <FormControlLabel value="House" control={<Radio />} label="House" />
              <FormControlLabel value="Dorm" control={<Radio />} label="Dorm" />
            </RadioGroup>
          </FormControl>

          <FormControl required error={fieldError(bedOption)}>
            <FormLabel>Bedrooms {fieldError(bedOption) && <span style={{ color: '#e53e3e', fontSize: 12 }}> — required</span>}</FormLabel>
            <RadioGroup row value={bedOption} onChange={e => setBedOption(e.target.value)}>
              {bedOptions.map(opt => (
                <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
              ))}
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" error={fieldError(amenities.length > 0)}>
            <FormLabel component="legend">
              Amenities *
              {fieldError(amenities.length > 0) && <span style={{ color: '#e53e3e', fontSize: 12 }}> — select at least one</span>}
            </FormLabel>
            <FormGroup row>
              {amenityOptions.map(opt => (
                <FormControlLabel
                  key={opt}
                  control={<Checkbox checked={amenities.includes(opt)} onChange={() => handleAmenityChange(opt)} size="small" />}
                  label={opt}
                />
              ))}
            </FormGroup>
          </FormControl>

          <ImageUrlInput
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            deleteImageUrl={deleteImageUrl}
            onUploadingChange={handleUploadingChange}
          />
          {fieldError(imageUrls.length > 0) && (
            <p style={{ fontSize: 12, color: '#e53e3e', fontWeight: 600, margin: '-4px 0 0' }}>At least one photo is required</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || uploadingCount > 0}
            style={{ marginBottom: 30 }}
          >
            {uploadingCount > 0 ? `Uploading ${uploadingCount} photo${uploadingCount > 1 ? 's' : ''}...` : loading ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewBuilding;