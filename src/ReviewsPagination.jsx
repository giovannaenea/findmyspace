import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import ReviewItem from './ReviewItem';
import './ReviewsPagination.css';

const ReviewsPagination = ({ user, property, handleDeleteReview, handleReply }) => {
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('newest');

  const sortOptions = [
    { value: 'newest', label: 'Newest'},
    { value: 'oldest', label: 'Oldest' },
    { value: 'highestRating', label: 'Highest rated' },
    { value: 'lowestRating', label: 'Lowest rated' },
    { value: 'upvotes', label: 'Upvotes' },
  ];

  useEffect(() => {
    if (isPageEmpty() && page > 1) {
      setPage(page - 1);
    }
  }, [property, page, sortOrder]);

  const isPageEmpty = () => {
    const reviewOffset = (page - 1) * 10;
    return property.reviews.slice(reviewOffset, reviewOffset + 10).length === 0;
  };

  const getSortedReviews = () => {
    const sortedReviews = property.reviews;

    sortedReviews.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.date) - new Date(a.date); // Sort by date
      } else if (sortOrder === 'oldest') {
        return new Date(a.date) - new Date(b.date); // Sort by date
      } else if (sortOrder === 'highestRating') {
        return b.rating - a.rating; // Sort by rating
      } else if (sortOrder === 'lowestRating') {
        return a.rating - b.rating; // Sort by rating
      } else {
        return b.upvotes - a.upvotes; // Sort by upvotes
      }
    });

    return sortedReviews;
  };

  const reviewOffset = (page - 1) * 10
  const sortedReviews = getSortedReviews();
  const currentReviews = sortedReviews.slice(reviewOffset, reviewOffset + 10);

  if (property.reviews.length === 0) {
    return <div className="no-reviews">No reviews available.</div>;
  }

  return (
    <div className="reviews-list">
      <div className="sort-by">
        <label>{"Sort by:"}</label>
        <select className="dropdown" value={sortOrder} onChange={ (e) => setSortOrder(e.target.value) }>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      { currentReviews.map((review) => <ReviewItem key={review.id} user={user} review={review} handleDeleteReview={handleDeleteReview} handleReply={handleReply} propertyId={property.id} />) }
      <Pagination
          count={Math.ceil(property.reviews.length / 10)}
          size="large"
          page={page}
          onChange={(event, value) => setPage(value)}
          style = {{ margin: '20px 0px' }}
        />
    </div>
  );
}

export default ReviewsPagination;