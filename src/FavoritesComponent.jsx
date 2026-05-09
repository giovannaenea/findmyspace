import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase.mjs';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { getRecommendations } from './gemini.js';
import PropertyReview from './PropertyReview';
import MenuSelect from './MenuSelect';
import Loading from './Loading';
import './FavoritesComponent.css';

const FavoritesComponent = ({ user, handleSearch, handleSignIn }) => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchFavorites();
    else setLoading(false);
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'properties'));
      const propertyData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const approved = propertyData.filter(p => p.status === 'approved' || !p.status);
      setAllProperties(approved);
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userFavorites = userSnap.data()?.favorites || [];
      setProperties(approved.filter(p => userFavorites.includes(p.id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (properties.length === 0) {
      setRecError('Save some properties first to get recommendations.');
      return;
    }
    setRecLoading(true);
    setRecError('');
    try {
      const unsaved = allProperties.filter(p => !properties.find(s => s.id === p.id));
      if (unsaved.length === 0) {
        setRecError('No other properties to recommend from.');
        setRecLoading(false);
        return;
      }
      const recs = await getRecommendations(properties, unsaved);
      const recProps = recs
        .map(r => {
          const prop = allProperties.find(p => p.id === r.id);
          return prop ? { ...prop, reason: r.reason } : null;
        })
        .filter(Boolean);
      setRecommendations(recProps);
    } catch (e) {
      console.error('Recommendations error:', e);
      setRecError('Failed to get recommendations. Please try again.');
    } finally {
      setRecLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="favorites-page">
      <div className="favorites-topbar">
        <h2 className="favorites-title">Saved Properties</h2>
        <p className="favorites-sub">Your bookmarked listings</p>
      </div>

      {!user ? (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">
            <svg viewBox="0 0 80 80" fill="none" width="64" height="64">
              <circle cx="40" cy="40" r="40" fill="#e8f0f2" />
              <path d="M24 20h32a2 2 0 0 1 2 2v36l-18-10-18 10V22a2 2 0 0 1 2-2z" fill="#28666e" stroke="#033f63" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="favorites-empty-title">Sign in to see saved properties</h3>
          <p className="favorites-empty-sub">Save listings you love and find them here</p>
          <button className="favorites-signin-btn" onClick={handleSignIn}>Sign In</button>
        </div>
      ) : properties.length === 0 ? (
        <div className="favorites-empty">
          <div className="favorites-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" color="var(--teal)">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h3 className="favorites-empty-title">No saved properties yet</h3>
          <p className="favorites-empty-sub">Tap the bookmark icon on any listing to save it</p>
        </div>
      ) : (
        <>
          <div className="favorites-grid">
            {properties.map(p => (
              <PropertyReview key={p.id} {...p} user={user} handleSignIn={handleSignIn} />
            ))}
          </div>

          <div className="rec-section">
            <div className="rec-header">
              <h3 className="rec-title">Recommended for You</h3>
              <button
                className="rec-btn"
                onClick={handleGetRecommendations}
                disabled={recLoading}
              >
                {recLoading ? 'Finding...' : recommendations.length > 0 ? 'Refresh' : 'Get Recommendations'}
              </button>
            </div>
            {recError && <p className="rec-error">{recError}</p>}
            {recommendations.length > 0 && (
              <div className="rec-list">
                {recommendations.map((prop, i) => (
                  <div key={prop.id} className="rec-card" onClick={() => navigate(`/property/${prop.id}`)}>
                    <span className="rec-rank">#{i + 1}</span>
                    {prop.photos?.[0] && (
                      <img src={prop.photos[0]} alt={prop.name} className="rec-img" />
                    )}
                    <div className="rec-body">
                      <p className="rec-name">{prop.name}</p>
                      <p className="rec-price">NT$ {prop.price?.toLocaleString()}/mo</p>
                      <p className="rec-reason">{prop.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="menu-container">
        <MenuSelect user={user} />
      </div>
    </div>
  );
};

export default FavoritesComponent;