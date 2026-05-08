import React, { useState } from 'react';
import Favorite from './Favorite';
import './ImageSlider.css'; // Importing CSS for the image slider

const ImageSlider = ({ images, user, propertyId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="slider-container">
      {images && images.map((image, index) => (
        <img
          key={image}
          src={image}
          alt={`Slide ${index}`}
          className={`slide ${index === currentImageIndex ? 'active' : ''}`}
        />
      ))}
      { user && <Favorite userId={user.uid} propertyId={propertyId}/> }
      <button className="arrow prev" onClick={prevImage}>&#10094;</button>
      <button className="arrow next" onClick={nextImage}>&#10095;</button>
    </div>
  );
};

export default ImageSlider;