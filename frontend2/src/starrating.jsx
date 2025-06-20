import React, { useState } from 'react';
import './App.css'
import { Link, useNavigate } from 'react-router-dom';

const StarRating = ({
  totalStars = 5,
  size = 24,
  rating = 0,
  onRatingChange = () => {},
  readOnly = false
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleMouseEnter = (index) => {
    if (!readOnly) setHoveredStar(index);
  };

  const handleMouseLeave = () => {
    if (!readOnly) setHoveredStar(0);
  };

  const handleClick = (index) => {
    if (!readOnly) onRatingChange(index);
  };

  const renderStars = () => {
    return [...Array(totalStars)].map((_, index) => {
      const starIndex = index + 1;
      const isFilled = hoveredStar
        ? starIndex <= hoveredStar
        : starIndex <= rating;

      return (
        <svg
          key={starIndex}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={isFilled ? 'gold' : 'lightgray'}
          onMouseEnter={() => handleMouseEnter(starIndex)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(starIndex)}
          style={{ width: size, height: size }}
          className="cursor-pointer transition-transform duration-150 hover:scale-110"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.12 3.442a1 1 0 00.95.69h3.626c.969 0 1.371 1.24.588 1.81l-2.934 2.13a1 1 0 00-.364 1.118l1.12 3.442c.3.921-.755 1.688-1.538 1.118l-2.934-2.13a1 1 0 00-1.175 0l-2.934 2.13c-.783.57-1.838-.197-1.538-1.118l1.12-3.442a1 1 0 00-.364-1.118l-2.934-2.13c-.783-.57-.38-1.81.588-1.81h3.626a1 1 0 00.95-.69l1.12-3.442z" />
        </svg>
      );
    });
  };

  return <div className="flex space-x-1">{renderStars()}</div>;
};

export default StarRating;
