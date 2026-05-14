import React from 'react';
import './SkeletonPage.css';

// ── Primitives ────────────────────────────────────────────────────────────────
const S = ({ w = '100%', h = 14, r = 6, mb = 0, style = {} }) => (
  <div className="sk-block shimmer" style={{ width: w, height: h, borderRadius: r, marginBottom: mb, ...style }} />
);

// ── Shared topbar (back arrow + title bar) ────────────────────────────────────
const Topbar = ({ hasBack = true }) => (
  <div className="sk-topbar">
    {hasBack && <S w={28} h={28} r={8} />}
    <S w={120} h={16} r={6} style={{ margin: '0 auto' }} />
    <div style={{ width: 28 }} />
  </div>
);

// ── Shared 2-col card grid ────────────────────────────────────────────────────
const CardGrid = ({ count = 4 }) => (
  <div className="sk-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="sk-card">
        <S w="100%" h={130} r={0} />
        <div style={{ padding: 10 }}>
          <S w="88%" h={12} mb={6} />
          <S w="65%" h={10} mb={10} />
          <S w="52%" h={13} mb={10} />
          <div style={{ display: 'flex', gap: 6 }}>
            <S w={52} h={22} r={20} />
            <S w={52} h={22} r={20} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Home: listings header + 2-col card grid */
export const SkeletonHome = ({ count = 6 }) => (
  <div style={{ padding: '16px 16px 100px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <S w={130} h={16} />
      <S w={70} h={12} />
    </div>
    <CardGrid count={count} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

/** PropertyDetails: full-bleed image + content rows */
export const SkeletonPropertyDetails = () => (
  <div className="sk-page">
    <Topbar />
    {/* Hero image */}
    <S w="100%" h={300} r={0} />
    <div className="sk-content">
      {/* Title + price row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <S w="75%" h={20} mb={8} />
          <S w="55%" h={13} mb={6} />
          <S w="48%" h={13} />
        </div>
        <S w={80} h={36} r={10} />
      </div>
      {/* Amenity pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {[60, 80, 70, 90, 65].map((w, i) => <S key={i} w={w} h={28} r={20} />)}
      </div>
      {/* Description lines */}
      <S w="100%" h={12} mb={8} />
      <S w="92%" h={12} mb={8} />
      <S w="78%" h={12} mb={24} />
      {/* Landlord row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <S w={44} h={44} r={22} />
        <div style={{ flex: 1 }}>
          <S w="50%" h={13} mb={6} />
          <S w="35%" h={11} />
        </div>
      </div>
      {/* Review section header */}
      <S w="40%" h={16} mb={14} />
      {[1, 2].map(i => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <S w={36} h={36} r={18} />
            <div style={{ flex: 1 }}>
              <S w="45%" h={12} mb={5} />
              <S w="30%" h={10} />
            </div>
          </div>
          <S w="100%" h={11} mb={5} />
          <S w="85%" h={11} />
        </div>
      ))}
    </div>
  </div>
);

/** Favorites: topbar + 2-col grid */
export const SkeletonFavorites = () => (
  <div className="sk-page">
    <div className="sk-topbar sk-topbar--tall">
      <S w={140} h={20} mb={6} />
      <S w={180} h={13} />
    </div>
    <div style={{ padding: '0 16px 100px' }}>
      <CardGrid count={4} />
    </div>
  </div>
);

/** MyProperties: topbar + full-width list cards */
export const SkeletonMyProperties = () => (
  <div className="sk-page">
    <Topbar />
    <div style={{ padding: '16px 16px 100px' }}>
      {/* Header row with add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <S w={110} h={22} />
        <S w={100} h={34} r={10} />
      </div>
      {/* Full-width property cards */}
      {[1, 2, 3].map(i => (
        <div key={i} className="sk-list-card">
          <S w="100%" h={160} r={0} />
          <div style={{ padding: '12px 14px 14px' }}>
            <S w="70%" h={15} mb={8} />
            <S w="55%" h={12} mb={8} />
            <S w="40%" h={12} mb={12} />
            <div style={{ display: 'flex', gap: 8 }}>
              <S w={80} h={30} r={8} />
              <S w={80} h={30} r={8} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** AdminPanel: topbar + review cards */
export const SkeletonAdminPanel = () => (
  <div className="sk-page">
    <Topbar />
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <S w={140} h={20} />
        <S w={70} h={14} />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="sk-list-card" style={{ marginBottom: 14 }}>
          <S w="100%" h={150} r={0} />
          <div style={{ padding: '12px 14px 14px' }}>
            <S w="65%" h={15} mb={8} />
            <S w="80%" h={12} mb={6} />
            <S w="50%" h={12} mb={14} />
            <div style={{ display: 'flex', gap: 8 }}>
              <S w={90} h={32} r={8} />
              <S w={90} h={32} r={8} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);