import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase.mjs';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import Loading from './Loading';
import BackButton from './BackButton';
import './AdminPanel.css';

const AdminPanel = ({ user }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'properties'),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by submittedAt descending on the client to avoid needing a composite index
      docs.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
      setPending(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    await updateDoc(doc(db, 'properties', id), { status: 'approved' });
    setPending(prev => prev.filter(p => p.id !== id));
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    await deleteDoc(doc(db, 'properties', id));
    setPending(prev => prev.filter(p => p.id !== id));
    setActionLoading(null);
  };

  if (loading) return <Loading />;

  // Hard guard — even if the route somehow renders this for a non-admin,
  // the component refuses to show anything. Firestore rules are the real
  // enforcement but this prevents the UI from flashing.
  if (!user || user.isAdmin !== true) {
    return null;
  }

  return (
    <div className="admin-page">
      <BackButton />
      <div className="admin-header">
        <h1 className="admin-title">Pending Listings</h1>
        <span className="admin-count">{pending.length} pending</span>
      </div>

      {pending.length === 0 ? (
        <div className="admin-empty">
          <div style={{ fontSize: 40, marginBottom: 12 }}></div>
          <p style={{ color: 'var(--navy)', fontWeight: 700 }}>All caught up!</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No listings waiting for review.</p>
        </div>
      ) : (
        <div className="admin-list">
          {pending.map(p => (
            <div key={p.id} className="admin-card">
              {p.photos?.[0] && (
                <img src={p.photos[0]} alt={p.name} className="admin-card-img" onClick={() => navigate(`/property/${p.id}`)} style={{ cursor: 'pointer' }} />
              )}
              <div className="admin-card-body" onClick={() => navigate(`/property/${p.id}`)} style={{ cursor: 'pointer' }}>
                <h3 className="admin-card-name">{p.name}</h3>
                <p className="admin-card-detail">{p.address}</p>
                {p.landlordName && <p className="admin-card-detail" style={{ fontWeight: 600 }}>Landlord: {p.landlordName}</p>}
                <p className="admin-card-detail">NT$ {p.price?.toLocaleString()}/mo</p>
                <p className="admin-card-detail">{p.bedOptions?.[0]}</p>
                <p className="admin-card-detail">{p.housingType}</p>
                {p.phone && <p className="admin-card-detail">{p.phone}</p>}
                {p.submittedAt && (
                  <p className="admin-card-date">
                    Submitted {new Date(p.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                <div className="admin-card-amenities">
                  {p.amenities?.map(a => <span key={a} className="admin-amenity-tag">{a}</span>)}
                </div>
              </div>
              <div className="admin-card-actions">
                <button
                  className="admin-approve-btn"
                  onClick={() => handleApprove(p.id)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === p.id + '_approve' ? '...' : '✓ Approve'}
                </button>
                <button
                  className="admin-reject-btn"
                  onClick={() => handleReject(p.id)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === p.id + '_reject' ? '...' : '✕ Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

AdminPanel.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string,
    isAdmin: PropTypes.bool,
  }),
};

export default AdminPanel;