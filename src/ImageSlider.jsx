import React, { useState, useRef } from 'react';
import Favorite from './Favorite';
import './ImageSlider.css';

const ImageSlider = ({ images, user, propertyId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  if (!images || images.length === 0) return null;

  const goTo = (index) => {
    setCurrentIndex((index + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only swipe if horizontal movement dominates
    if (Math.abs(dx) > 40 && dy < 60) {
      goTo(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="slider-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

      {/* Favorite button */}
      {user && (
        <div className="slider-favorite">
          <Favorite userId={user.uid} propertyId={propertyId} />
        </div>
      )}

      {/* Dot indicators — only show if more than 1 image */}
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

export default ImageSlider;