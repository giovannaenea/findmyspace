import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Favorite from './Favorite';
import './ImageSlider.css';

const ImageSlider = ({ images, user, propertyId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const mouseStartX = useRef(null);
  const isDragging = useRef(false);

  if (!images || images.length === 0) return null;

  const goTo = (index) => {
    setCurrentIndex((index + images.length) % images.length);
  };

  // ── Touch handlers (mobile) ──────────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 40 && dy < 60) {
      goTo(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }
    touchStartX.current = null;
  };

  // ── Mouse handlers (web) ─────────────────────────────────────────────
  const handleMouseDown = (e) => {
    // Don't start drag tracking if clicking an arrow button
    if (e.target.closest('.slider-arrow')) return;
    mouseStartX.current = e.clientX;
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (mouseStartX.current === null) return;
    if (Math.abs(e.clientX - mouseStartX.current) > 5) {
      isDragging.current = true;
    }
  };

  const handleMouseUp = (e) => {
    if (mouseStartX.current === null) return;
    const dx = e.clientX - mouseStartX.current;
    if (isDragging.current && Math.abs(dx) > 40) {
      goTo(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }
    mouseStartX.current = null;
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    mouseStartX.current = null;
    isDragging.current = false;
  };

  return (
    <div
      className="slider-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {images.map((image, index) => (
        <img
          key={image}
          src={image}
          alt={`Photo ${index + 1}`}
          className={`slide ${index === currentIndex ? 'active' : ''}`}
          draggable={false}
        />
      ))}

      {/* Arrow buttons */}
      {images.length > 1 && (
        <>
          <button
            className="slider-arrow slider-arrow-left"
            onClick={() => goTo(currentIndex - 1)}
            aria-label="Previous photo"
          >
            &#8249;
          </button>
          <button
            className="slider-arrow slider-arrow-right"
            onClick={() => goTo(currentIndex + 1)}
            aria-label="Next photo"
          >
            &#8250;
          </button>
        </>
      )}

      {/* Favorite button */}
      {user && user.role === 'tenant' && (
        <div className="slider-favorite">
          <Favorite userId={user.uid} propertyId={propertyId} />
        </div>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="slider-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`slider-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image counter pill */}
      {images.length > 1 && (
        <div className="slider-counter">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

ImageSlider.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  user: PropTypes.object,
  propertyId: PropTypes.string,
};

export default ImageSlider;