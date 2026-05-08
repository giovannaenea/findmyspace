import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase.mjs';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Loading from './Loading';
import BackButton from './BackButton';
import './AdminPanel.css';

const AdminPanel = ({ user }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    // Read isAdmin from the server-side user document — never trust client state alone
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      const admin = snap.exists() && snap.data().isAdmin === true;
      setIsAdmin(admin);
      if (admin) fetchPending();
      else setLoading(false);
    });
  }, [user]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'properties'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPending(all.filter(p => p.status === 'pending').sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0)));
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

  if (!user) return (
    <div className="admin-page">
      <div className="admin-empty">
        <p>You need to be signed in to access this page.</p>
        <button onClick={() => navigate('/')} className="admin-back-btn">Go Home</button>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="admin-page">
      <div className="admin-empty">
        <p>You don't have permission to view this page.</p>
        <button onClick={() => navigate('/')} className="admin-back-btn">Go Home</button>
      </div>
    </div>
  );

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
                <img src={p.photos[0]} alt={p.name} className="admin-card-img" />
              )}
              <div className="admin-card-body">
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

export default AdminPanel;