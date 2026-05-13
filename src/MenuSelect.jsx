import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import './MenuSelect.css';
import { hapticLight } from './haptics.js';

const MenuSelect = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandlord = user?.role === 'landlord';

  const tenantTabs = [
    {
      key: 'home', label: 'Home', path: '/',
      icon: (active) => (
        <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 6.94C13.5009 6.8012 13.473 6.66372 13.4179 6.53632C13.3628 6.40892 13.2818 6.29438 13.18 6.2L7 0.5L0.82 6.2C0.718225 6.29438 0.637213 6.40892 0.58212 6.53632C0.527027 6.66372 0.499061 6.8012 0.5 6.94V12.5C0.5 12.7652 0.605357 13.0196 0.792893 13.2071C0.98043 13.3946 1.23478 13.5 1.5 13.5H12.5C12.7652 13.5 13.0196 13.3946 13.2071 13.2071C13.3946 13.0196 13.5 12.7652 13.5 12.5V6.94Z" />
        </svg>
      )
    },
    {
      key: 'favorites', label: 'Saved', path: '/favorites',
      icon: (active) => (
        <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 13.5L7 9.5L3 13.5V1.5C3 1.23478 3.10536 0.98043 3.29289 0.792893C3.48043 0.605357 3.73478 0.5 4 0.5H10C10.2652 0.5 10.5196 0.605357 10.7071 0.792893C10.8946 0.98043 11 1.23478 11 1.5V13.5Z" />
        </svg>
      )
    },
    {
      key: 'profile', label: 'Profile', path: '/profile',
      icon: (active) => (
        <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.68 7C8.47493 7 9.93 5.54493 9.93 3.75C9.93 1.95507 8.47493 0.5 6.68 0.5C4.88508 0.5 3.43 1.95507 3.43 3.75C3.43 5.54493 4.88508 7 6.68 7Z" />
          <path d="M12.86 13.5C12.4402 12.1909 11.6155 11.0489 10.5048 10.2386C9.3941 9.42842 8.05481 8.99184 6.68 8.99184C5.3052 8.99184 3.96591 9.42842 2.85522 10.2386C1.74453 11.0489 0.919826 12.1909 0.500004 13.5H12.86Z" />
        </svg>
      )
    },
  ];

  const landlordTabs = [
    {
      key: 'home', label: 'Browse', path: '/',
      icon: (active) => (
        <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 6.94C13.5009 6.8012 13.473 6.66372 13.4179 6.53632C13.3628 6.40892 13.2818 6.29438 13.18 6.2L7 0.5L0.82 6.2C0.718225 6.29438 0.637213 6.40892 0.58212 6.53632C0.527027 6.66372 0.499061 6.8012 0.5 6.94V12.5C0.5 12.7652 0.605357 13.0196 0.792893 13.2071C0.98043 13.3946 1.23478 13.5 1.5 13.5H12.5C12.7652 13.5 13.0196 13.3946 13.2071 13.2071C13.3946 13.0196 13.5 12.7652 13.5 12.5V6.94Z" />
        </svg>
      )
    },
    {
      key: 'myproperties', label: 'My Listings', path: '/my-properties',
      icon: (active) => (
        <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 13.5H0.5V4L4.5 0.5L8.5 4V13.5Z" /><path d="M8.5 13.5H13.5V6.5H8.5" /><path d="M4.5 13.5V11.5" /><path d="M3 8.5H6" /><path d="M3 5.5H6" />
        </svg>
      )
    },
    {
      key: 'profile', label: 'Profile', path: '/profile',
      icon: (active) => (
        <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.68 7C8.47493 7 9.93 5.54493 9.93 3.75C9.93 1.95507 8.47493 0.5 6.68 0.5C4.88508 0.5 3.43 1.95507 3.43 3.75C3.43 5.54493 4.88508 7 6.68 7Z" />
          <path d="M12.86 13.5C12.4402 12.1909 11.6155 11.0489 10.5048 10.2386C9.3941 9.42842 8.05481 8.99184 6.68 8.99184C5.3052 8.99184 3.96591 9.42842 2.85522 10.2386C1.74453 11.0489 0.919826 12.1909 0.500004 13.5H12.86Z" />
        </svg>
      )
    },
  ];

  const isAdmin = user?.isAdmin === true || user?.role === 'admin';
  const tabs = isAdmin ? [] : isLandlord ? landlordTabs : tenantTabs;

  if (isAdmin) {
    tabs.push(
      {
        key: 'home', label: 'Home', path: '/',
        icon: (active) => (
          <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 6.94C13.5009 6.8012 13.473 6.66372 13.4179 6.53632C13.3628 6.40892 13.2818 6.29438 13.18 6.2L7 0.5L0.82 6.2C0.718225 6.29438 0.637213 6.40892 0.58212 6.53632C0.527027 6.66372 0.499061 6.8012 0.5 6.94V12.5C0.5 12.7652 0.605357 13.0196 0.792893 13.2071C0.98043 13.3946 1.23478 13.5 1.5 13.5H12.5C12.7652 13.5 13.0196 13.3946 13.2071 13.2071C13.3946 13.0196 13.5 12.7652 13.5 12.5V6.94Z" />
          </svg>
        )
      },
      {
        key: 'admin', label: 'Admin', path: '/admin',
        icon: (active) => (
          <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 0.5L1 3V7C1 10.31 3.64 13.41 7 13.5C10.36 13.41 13 10.31 13 7V3L7 0.5Z" />
          </svg>
        )
      },
      {
        key: 'profile', label: 'Profile', path: '/profile',
        icon: (active) => (
          <svg viewBox="0 0 14 14" fill={active ? '#033F63' : 'none'} stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.68 7C8.47493 7 9.93 5.54493 9.93 3.75C9.93 1.95507 8.47493 0.5 6.68 0.5C4.88508 0.5 3.43 1.95507 3.43 3.75C3.43 5.54493 4.88508 7 6.68 7Z" />
            <path d="M12.86 13.5C12.4402 12.1909 11.6155 11.0489 10.5048 10.2386C9.3941 9.42842 8.05481 8.99184 6.68 8.99184C5.3052 8.99184 3.96591 9.42842 2.85522 10.2386C1.74453 11.0489 0.919826 12.1909 0.500004 13.5H12.86Z" />
          </svg>
        )
      }
    );
  }

  return (
    <div className="tab-bar">
      {tabs.map(tab => {
        const active = location.pathname === tab.path;
        return (
          <button key={tab.key} className={`tab-item ${active ? 'active' : ''}`} onClick={() => { hapticLight(); navigate(tab.path); }}>
            <span className="tab-icon">{tab.icon(active)}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

MenuSelect.propTypes = {
  user: PropTypes.object,
};

export default MenuSelect;