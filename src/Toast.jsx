import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ flexShrink: 0 }}>
        {type === 'error'
          ? <><circle cx="12" cy="12" r="10" /><line x1="12" y1="7" x2="12" y2="13" strokeWidth="2.5" strokeLinecap="round" /><circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none" /></>
          : type === 'info'
          ? <><circle cx="12" cy="12" r="10" /><line x1="12" y1="11" x2="12" y2="17" strokeWidth="2.5" strokeLinecap="round" /><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" /></>
          : <><circle cx="12" cy="12" r="10" /><polyline points="7 12.5 10.5 16 17 9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></>
        }
      </svg>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'success', 'info']),
  onClose: PropTypes.func.isRequired,
};

export default Toast;