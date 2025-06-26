import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewForm = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [review, setReview] = useState({
    patientName: '',
    comment: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit({
      ...review,
      rating,
      date: new Date().toISOString().split('T')[0],
      id: Date.now(),
    });
    setReview({ patientName: '', comment: '' });
    setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Your Name</label>
        <input
          type="text"
          value={review.patientName}
          onChange={(e) => setReview({...review, patientName: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Rating</label>
        <div className="flex">
          {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            return (
              <label key={i} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                  className="hidden"
                />
                <FaStar
                  className="text-2xl"
                  color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(null)}
                />
              </label>
            );
          })}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Review</label>
        <textarea
          value={review.comment}
          onChange={(e) => setReview({...review, comment: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          required
        ></textarea>
      </div>
      
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;