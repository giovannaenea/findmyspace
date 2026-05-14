import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase.mjs';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { Checkbox, FormControl, FormControlLabel, FormLabel, FormGroup, Radio, RadioGroup } from '@mui/material';
import ImageUrlInput from './ImageURLInput';
import MenuSelect from './MenuSelect';
import Loading from './Loading';
import BackButton from './BackButton';
import './MyProperties.css';

const bedOptions = ['1 Bedroom', '2 Bedrooms', '3+ Bedrooms'];
const amenityOptions = [
  'Furniture', 'Private Bathroom', 'Shared Bathroom', 'Washer', 'Dryer',
  'Pets Allowed', 'Water Dispenser', 'Refrigerator', 'Parking',
  'Laundry Room', 'AC', 'Cooking Allowed',
];

const MyProperties = ({ user, handleSignIn, showToast }) => {
  const navigate = useNavigate();

  // Role guard — tenants have no listings; redirect them home
  useEffect(() => {
    if (user && user.role !== 'landlord') {
      navigate('/', { replace: true });
    }
  }, [user]);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhoneError, setEditPhoneError] = useState('');
  const [editLine, setEditLine] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editHousingType, setEditHousingType] = useState('');
  const [editBedOption, setEditBedOption] = useState('');
  const [editAmenities, setEditAmenities] = useState([]);
  const [editImageUrls, setEditImageUrls] = useState([]);
  const [editLandlordName, setEditLandlordName] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');

  useEffect(() => {
    if (user) fetchMyProperties();
    else setLoading(false);
  }, [user]);

  const fetchMyProperties = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'properties'), where('landlordId', '==', user.uid));
      const snap = await getDocs(q);
      setProperties(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      showToast?.('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'properties', id));
      setProperties(prev => prev.filter(p => p.id !== id));
      showToast?.('Listing deleted.', 'success');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to delete listing. Please try again.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };


  const startEdit = (p) => {
    setEditingId(p.id);
    setEditName(p.name || '');
    setEditAddress(p.address || '');
    setEditPhone(p.phone || '');
    setEditPhoneError('');
    setEditLine(p.line || '');
    setEditPrice(String(p.price || ''));
    setEditHousingType(p.housingType || '');
    setEditBedOption(p.bedOptions?.[0] || '');
    setEditAmenities(p.amenities || []);
    setEditImageUrls(p.photos || []);
    setEditLandlordName(p.landlordName || '');
    setEditLat(String(p.lat ?? ''));
    setEditLng(String(p.lng ?? ''));
    setUploadingCount(0);
  };

  const handleEditPhone = (raw) => {
    const cleaned = raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
    setEditPhone(cleaned);
    if (!cleaned) { setEditPhoneError(''); return; }
    const digits = cleaned.replace(/\D/g, '');
    setEditPhoneError(digits.length < 7 || digits.length > 15 ? 'Must be 7-15 digits' : '');
  };

  const toggleAmenity = (opt) => {
    setEditAmenities(prev =>
      prev.includes(opt) ? prev.filter(a => a !== opt) : [...prev, opt]
    );
  };

  const handleSaveEdit = async (id) => {
    if (editPhoneError || uploadingCount > 0) return;
    setSavingId(id);
    try {
      const updates = {
        name: editName,
        address: editAddress,
        phone: editPhone,
        line: editLine,
        price: Math.max(1, parseInt(editPrice) || 1),
        housingType: editHousingType,
        bedOptions: editBedOption ? [editBedOption] : [],
        amenities: editAmenities,
        photos: editImageUrls,
        landlordName: editLandlordName,
        lat: editLat ? parseFloat(editLat) : null,
        lng: editLng ? parseFloat(editLng) : null,
      };
      await updateDoc(doc(db, 'properties', id), updates);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      setEditingId(null);
      showToast?.('Listing updated!', 'success');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to save changes. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="myprops-page">
      <BackButton />
      <div className="myprops-header">
        <h1 className="myprops-title">My Listings</h1>
        <button className="myprops-add-btn" onClick={() => navigate('/add')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Listing
        </button>
      </div>

      {!user ? (
        <div className="myprops-empty">
          <p>Sign in to view your listings.</p>
          <button className="myprops-signin-btn" onClick={handleSignIn}>Sign In</button>
        </div>
      ) : properties.length === 0 ? (
        <div className="myprops-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ color: 'var(--border)', marginBottom: 12 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <p className="myprops-empty-title">No listings yet</p>
          <p className="myprops-empty-sub">Tap "Add Listing" to post your first property.</p>
        </div>
      ) : (
        <div className="myprops-list">
          {properties.map(p => (
            <div key={p.id} className="myprops-card">
              <div className="myprops-card-top">
                <div className="myprops-card-img-wrap" onClick={() => editingId !== p.id && navigate(`/property/${p.id}`)}>
                  {p.photos?.[0]
                    ? <img src={p.photos[0]} alt={p.name} className="myprops-card-img" loading="lazy" />
                    : <div className="myprops-card-img-placeholder" />
                  }
                  <span className={`myprops-status-badge ${p.status === 'pending' ? 'pending' : 'approved'}`}>
                    {p.status === 'pending' ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        Pending Review
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Live
                      </>
                    )}
                  </span>
                </div>

                <div className="myprops-card-body">
                  {editingId === p.id ? (
                    <div className="myprops-edit-form">
                      <label className="myprops-edit-label">Building Name</label>
                      <input className="myprops-edit-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Building name" />

                      <label className="myprops-edit-label">Address</label>
                      <input className="myprops-edit-input" value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Address" />

                      <label className="myprops-edit-label">Monthly Rent (NT$)</label>
                      <input className="myprops-edit-input" type="number" value={editPrice} onChange={e => setEditPrice(e.target.value.replace(/\D/g, ''))} placeholder="Monthly rent" inputMode="numeric" />

                      <label className="myprops-edit-label">Phone Number</label>
                      <input className="myprops-edit-input" value={editPhone} onChange={e => handleEditPhone(e.target.value)} placeholder="e.g. +0912345678" inputMode="tel" />
                      {editPhoneError && <p style={{ fontSize: 11, color: '#e53e3e', margin: '-4px 0 4px' }}>{editPhoneError}</p>}

                      <label className="myprops-edit-label">Line ID</label>
                      <input className="myprops-edit-input" value={editLine} onChange={e => setEditLine(e.target.value)} placeholder="Line ID" />

                      <label className="myprops-edit-label">Location Coordinates</label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input
                          className="myprops-edit-input"
                          value={editLat}
                          onChange={e => setEditLat(e.target.value)}
                          placeholder="Latitude e.g. 23.8897"
                          type="number"
                          step="any"
                          style={{ flex: 1 }}
                        />
                        <input
                          className="myprops-edit-input"
                          value={editLng}
                          onChange={e => setEditLng(e.target.value)}
                          placeholder="Longitude e.g. 121.5508"
                          type="number"
                          step="any"
                          style={{ flex: 1 }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Right-click on Google Maps to get coordinates</p>

                      <label className="myprops-edit-label">Landlord / Contact Name *</label>
                      <input className="myprops-edit-input" value={editLandlordName} onChange={e => setEditLandlordName(e.target.value)} placeholder="Name shown to tenants" />

                      <FormControl style={{ marginTop: 8 }}>
                        <FormLabel style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>Housing Type</FormLabel>
                        <RadioGroup row value={editHousingType} onChange={e => setEditHousingType(e.target.value)}>
                          {['Apartment', 'House', 'Dorm'].map(opt => (
                            <FormControlLabel key={opt} value={opt} control={<Radio size="small" />} label={opt} />
                          ))}
                        </RadioGroup>
                      </FormControl>

                      <FormControl style={{ marginTop: 8 }}>
                        <FormLabel style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>Bedrooms</FormLabel>
                        <RadioGroup row value={editBedOption} onChange={e => setEditBedOption(e.target.value)}>
                          {bedOptions.map(opt => (
                            <FormControlLabel key={opt} value={opt} control={<Radio size="small" />} label={opt} />
                          ))}
                        </RadioGroup>
                      </FormControl>

                      <FormControl component="fieldset" style={{ marginTop: 8 }}>
                        <FormLabel component="legend" style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>Amenities</FormLabel>
                        <FormGroup row>
                          {amenityOptions.map(opt => (
                            <FormControlLabel
                              key={opt}
                              control={<Checkbox checked={editAmenities.includes(opt)} onChange={() => toggleAmenity(opt)} size="small" />}
                              label={opt}
                            />
                          ))}
                        </FormGroup>
                      </FormControl>

                      <label className="myprops-edit-label" style={{ marginTop: 8 }}>Photos</label>
                      <ImageUrlInput
                        imageUrls={editImageUrls}
                        setImageUrls={setEditImageUrls}
                        deleteImageUrl={(i) => setEditImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                        onUploadingChange={(delta) => setUploadingCount(prev => Math.max(0, prev + delta))}
                      />

                      <div className="myprops-edit-actions">
                        <button className="myprops-edit-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                        <button
                          className="myprops-edit-save"
                          onClick={() => handleSaveEdit(p.id)}
                          disabled={savingId === p.id || !!editPhoneError || uploadingCount > 0}
                        >
                          {uploadingCount > 0 ? `Uploading ${uploadingCount}...` : savingId === p.id ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div onClick={() => navigate(`/property/${p.id}`)}>
                        <p className="myprops-card-name">{p.name}</p>
                        <p className="myprops-card-address">{p.address}</p>
                      </div>
                      <p className="myprops-card-price">NT$ {p.price?.toLocaleString()}/mo</p>
                      <div className="myprops-card-stats">
                        <span>
                          <svg viewBox="0 0 24 24" fill="#b5b682" stroke="#b5b682" strokeWidth="1" width="12" height="12" style={{ marginRight: 3 }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {p.rating?.toFixed(1) || '—'}
                        </span>
                        <span>{p.numberOfReviews || 0} reviews</span>
                      </div>
                    </>
                  )}
                </div>{/* end card-body */}
              </div>{/* end card-top */}

              <div className="myprops-card-actions">
                <button className="myprops-action-btn myprops-edit-btn" onClick={() => startEdit(p)}>
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                    <path d="M0.5 13.5H11.5" /><path d="M6.5 10L3.5 10.54L4 7.5L10.73 0.79C10.823 0.696272 10.9336 0.621877 11.0554 0.571109C11.1773 0.52034 11.308 0.494202 11.44 0.494202C11.572 0.494202 11.7027 0.52034 11.8246 0.571109C11.9464 0.621877 12.057 0.696272 12.15 0.79L13.21 1.85C13.3037 1.94296 13.3781 2.05356 13.4289 2.17542C13.4797 2.29728 13.5058 2.42799 13.5058 2.56C13.5058 2.69201 13.4797 2.82272 13.4289 2.94458C13.3781 3.06644 13.3037 3.17704 13.21 3.27L6.5 10Z" />
                  </svg>
                  Edit
                </button>
                {confirmDeleteId === p.id ? (
                  <div className="myprops-delete-confirm">
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {p.status === 'approved' ? 'Take down?' : 'Delete?'}
                    </span>
                    <button className="myprops-action-btn myprops-delete-btn" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                      {deletingId === p.id ? '...' : 'Yes'}
                    </button>
                    <button className="myprops-action-btn" onClick={() => setConfirmDeleteId(null)}>No</button>
                  </div>
                ) : (
                  <button className="myprops-action-btn myprops-delete-btn" onClick={() => setConfirmDeleteId(p.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                    {p.status === 'approved' ? 'Take Down' : 'Delete'}
                  </button>
                )}
              </div>{/* end card-actions */}
            </div>
          ))}
        </div>
      )}

      <div className="menu-container">
        <MenuSelect user={user} />
      </div>
    </div>
  );
};

MyProperties.propTypes = {
  user: PropTypes.object,
  handleSignIn: PropTypes.func,
  showToast: PropTypes.func,
};

export default MyProperties;