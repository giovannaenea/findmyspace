import React, { useState, useEffect } from 'react';
import './ReviewSection.css';
import { styled } from '@mui/material/styles';
import './PropertyReview.css';
import ReviewModal from './ReviewModal';
import { Rating } from '@mui/material';

export const StyledRating = styled(Rating)({
    '& .MuiRating-iconFilled': {
      color: '#b5b682',
    },
    '& .MuiRating-iconHover': {
      color: '#b5b682',
    },
  });

const Review = ({ user, handleSignIn, rating, reviews, handleNewReview }) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [ratingText, setRatingText] = useState('N/A');

    useEffect(() => {
      let text = "";
      switch (Math.round(rating)) {
        case 1: text = "Poor"; break;
        case 2: text = "Fair"; break;
        case 3: text = "Good"; break;
        case 4: text = "Very Good"; break;
        case 5: text = "Excellent"; break;
        default: text = "No Rating";
      }
      setRatingText(text);
    }, [rating]);
    
    const handleModalOpen = () => {
      if (!user) {
        handleSignIn();
      } else {
        setIsModalOpen(true);
      }
    }
    const handleModalClose = () => setIsModalOpen(false);

    return (
      <div className="review-layout">
        <div className="rating-box">
          <div className="rating-score">{rating}</div>
          <div className="rating-description">{ratingText}</div>
          <div className="rating-out-of">Out of 5</div>
        </div>
        <div className="reviews-box">
          <div className="stars-and-review">
            <StyledRating
              name="read-only"
              value={rating}
              precision={0.5}
              readOnly
            />
            <div className="reviews-count">{reviews.length} Reviews</div>
          </div>
          
          <button className="review-button" onClick={handleModalOpen} disabled={user?.role === 'landlord'} style={user?.role === 'landlord' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
            {user?.role === 'landlord' ? 'Landlords cannot write reviews' : 'Write a Review'}
          </button>
          <ReviewModal 
            user={user}
            isModalOpen={isModalOpen} 
            handleModalClose={handleModalClose}
            handleNewReview={handleNewReview} 
          />

          {/* {sortedReviews.map((review, index) => (
            <ReviewItem key={index} index={index} propertyId={propertyId} review={review} />
          ))} */}
      </div>
    </div>
  );
  };
  
  export default Review;