import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './navbar';
import Footbar from './footbar';
import StarRating from './starrating';
import ErrorMessage from './components/ErrorMessage';
import api from './config/api.js';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addToCartStatus, setAddToCartStatus] = useState({ loading: false, error: null, success: false });
  const [userId, setUserId] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Review Feature State ---
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState(null); // If user already reviewed
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // --- Edit Review State and Handlers ---
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching product with ID:", id);
        const response = await api.get(`/listings/id/${id}`);
        console.log("Product data:", response.data);
        
        if (response.data) {
          setProduct(response.data);
          setQuantity(1);
        } else {
          setError("Product not found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load product:", error);
        setError(((error.response?.data?.message) || "Failed to load product"));
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const response = await api.get("/check-auth", {
          withCredentials: true
        });
        if (response.data.status === "ok") {
          const userData = response.data.user;
          sessionStorage.setItem("userData", JSON.stringify(userData));
          setUserId(userData._id);
          setIsAdmin(userData.role === "admin");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/${id}`);
        setReviews(res.data || []);
      } catch (error) {
        setReviews([]);
      }
    };

    const fetchAverageRating = async () => {
      try {
        const res = await api.get(`/reviews/average/${id}`);
        setAverageRating(res.data.averageRating || 0);
      } catch (error) {
        setAverageRating(0);
      }
    };

    if (id) {
      fetchProduct();
      checkAuth();
      fetchReviews();
      fetchAverageRating();
    }
  }, [id]);

  // Check if user has already reviewed
  useEffect(() => {
    if (userId && reviews.length > 0) {
      const found = reviews.find(r => r.userId === userId);
      setUserReview(found || null);
    } else {
      setUserReview(null);
    }
  }, [userId, reviews]);

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      setAddToCartStatus({ loading: true, error: null, success: false });
      const response = await api.post("/cart", {
        userId: userId,
          productId: id,
          quantity: quantity
      }, { withCredentials: true });

      if (response.data) {
        setCartCount(prev => prev + quantity);
        setAddToCartStatus({ loading: false, error: null, success: true });
        alert("Item added to cart successfully!");
        
        // Reset success state after 2 seconds
        setTimeout(() => {
          setAddToCartStatus({ loading: false, error: null, success: false });
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddToCartStatus({ 
        loading: false, 
        error: (error.response?.data?.error) || "Failed to add item to cart", 
        success: false 
      });
    }
  };

  // --- Review Submission Handler ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(false);
    if (!userId) {
      setReviewError('Please login to submit a review.');
      return;
    }
    if (!newRating || !newComment.trim()) {
      setReviewError('Please provide a star rating and a comment.');
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        listingId: id,
        userId,
        username: (JSON.parse(sessionStorage.getItem("userData"))?.name) || "User",
        rating: newRating,
        comment: newComment.trim()
      }, { withCredentials: true });
      setReviewSuccess(true);
      setNewRating(0);
      setNewComment('');
      // Refresh reviews and average
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data || []);
      const avgRes = await api.get(`/reviews/average/${id}`);
      setAverageRating(avgRes.data.averageRating || 0);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // --- Edit Review State and Handlers ---
  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditError(null);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
    setEditError(null);
  };

  const handleEditReviewSubmit = async (e, reviewId) => {
    e.preventDefault();
    setEditError(null);
    setEditSubmitting(true);
    try {
      await api.put(`/reviews/${reviewId}`,
        {
          listingId: id,
          userId,
          username: (JSON.parse(sessionStorage.getItem("userData"))?.name) || "User",
          rating: editRating,
          comment: editComment.trim()
        },
        { withCredentials: true }
      );
      setEditingReviewId(null);
      setEditRating(0);
      setEditComment('');
      // Refresh reviews and average
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data || []);
      const avgRes = await api.get(`/reviews/average/${id}`);
      setAverageRating(avgRes.data.averageRating || 0);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update review.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Review Handler ---
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`, { withCredentials: true });
      // Refresh reviews and average
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data || []);
      const avgRes = await api.get(`/reviews/average/${id}`);
      setAverageRating(avgRes.data.averageRating || 0);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review.');
    }
  };

  // --- Delete Listing Handler ---
  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await api.delete(`/listings/${id}`, { withCredentials: true });
      alert('Listing deleted successfully!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete listing.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">Product not found</div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-orange-300 text-white px-6 py-2 rounded-full hover:bg-orange-400 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Ensure all required properties exist before rendering
  const {
    title = '',
    price = 0,
    images = [],
    description = '',
    metalType = '',
    metalPurity = '',
    gemstones = [],
    category = ''
  } = product;

  // Get the current selected image URL
  const getCurrentImageUrl = () => {
    try {
      if (images && images.length > 0 && images[selectedImage] && images[selectedImage].url) {
        return images[selectedImage].url;
      }
      // Fallback to old image field if images array is empty
      if (product.image) {
        return product.image;
      }
      // Final fallback to placeholder image
      return 'https://via.placeholder.com/400x400/FFA500/FFFFFF?text=No+Image';
    } catch (error) {
      console.error('Error getting image URL:', error);
      return 'https://via.placeholder.com/400x400/FFA500/FFFFFF?text=Error+Loading+Image';
    }
  };

  // Ensure images array exists and selectedImage is valid
  const validImages = images && Array.isArray(images) ? images.filter(img => img && img.url) : [];
  const validSelectedImage = selectedImage >= 0 && selectedImage < validImages.length ? selectedImage : 0;

  // Safety check - don't render if product is not fully loaded
  if (!product || !title || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading product details...</div>
      </div>
    );
  }

  // Additional safety check for images
  if (!validImages || !Array.isArray(validImages)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading product details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Navbar/>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <img
                src={getCurrentImageUrl()}
                alt={title || 'Product Image'}
                className="w-full h-[500px] object-cover"
                onError={(e) => {
                  console.error('Error loading main image:', e.target.src);
                  e.target.src = 'https://via.placeholder.com/400x500/FFA500/FFFFFF?text=Error+Loading+Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>

            {/* Thumbnail Images */}
            {validImages.length > 1 && (
              <div className="flex gap-4">
                {validImages.map((image, index) => {
                  try {
                    if (!image || !image.url) {
                      console.warn('Invalid image object at index:', index);
                      return null;
                    }
                    
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          validSelectedImage === index 
                            ? 'border-orange-400 shadow-lg' 
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <img
                          src={image.url || 'https://via.placeholder.com/80x80/FFA500/FFFFFF?text=Image'}
                          alt={`${title} - Image ${index + 1}`}
                          className="w-20 h-20 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80/FFA500/FFFFFF?text=Error';
                          }}
                        />
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering thumbnail:', error);
                    return null;
                  }
                })}
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="font-serif text-3xl font-bold text-gray-800 mb-1">
                {title}
              </h1>
              {/* Average Rating just below title */}
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={averageRating} readOnly size={22} />
                <span className="text-gray-600 text-base">{averageRating.toFixed(1)} / 5</span>
                <span className="text-gray-400 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
              <div className="flex items-baseline gap-4">
                <p className="text-2xl font-bold text-gray-800">
                  ₹ {price.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-gray-400">+18% GST</p>
              </div>
            </div>

            {/* Metal Details */}
            {metalType && (
              <div className="border-t border-gray-200 pt-4">
                <h2 className="font-serif text-lg font-bold text-gray-800 mb-2">Metal Details</h2>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Type:</span> {metalType.replace('_', ' ').toUpperCase()}
                  </p>
                  {metalPurity && (
                    <p className="text-gray-600">
                      <span className="font-medium">Purity:</span> {metalPurity}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Gemstone Details */}
            {gemstones && gemstones.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h2 className="font-serif text-lg font-bold text-gray-800 mb-2">Gemstone Details</h2>
                <div className="space-y-1">
                  {gemstones.map((gem, index) => (
                    <p key={index} className="text-gray-600">
                      <span className="font-medium">{gem.type.toUpperCase()}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="border-t border-gray-200 pt-4">
              <h2 className="font-serif text-lg font-bold text-gray-800 mb-2">Quantity</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-orange-300 text-orange-400 hover:bg-orange-50 hover:text-orange-500 transition-all duration-200"
                >
                  -
                </button>
                <span className="text-lg font-medium text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border border-orange-300 text-orange-400 hover:bg-orange-50 hover:text-orange-500 transition-all duration-200"
                >
                  +
                </button>
              </div>
            </div>
                        {/* Action Buttons */}
                        <div className="border-t border-gray-200 pt-4 space-y-3">
              <button 
                onClick={handleAddToCart}
                disabled={addToCartStatus.loading}
                className={`w-full ${
                  addToCartStatus.loading 
                    ? 'bg-gray-400' 
                    : addToCartStatus.success 
                    ? 'bg-green-500' 
                    : 'bg-orange-300 hover:bg-orange-400'
                } text-white px-6 py-2.5 rounded-full transition-all duration-200 font-medium text-base shadow-lg`}
              >
                {addToCartStatus.loading 
                  ? 'Adding...' 
                  : addToCartStatus.success 
                  ? 'Added to Cart!' 
                  : 'Add to Cart'}
              </button>
              {addToCartStatus.error && (
                <p className="text-red-500 text-sm text-center">{addToCartStatus.error}</p>
              )}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                  <button
                    onClick={handleDeleteListing}
                    className="w-60 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  >
                    Delete Listing
                  </button>
                  <button
                    onClick={() => navigate(`/editproduct/${id}`)}
                    className="w-60 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  >
                    Edit Listing
                  </button>
                </div>
              )}
            </div>


            {/* Product Description */}
            <div className="border-t border-gray-200 pt-4">
              <h2 className="font-serif text-lg font-bold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Additional Information */}
            <div className="border-t border-gray-200 pt-4">
              <h2 className="font-serif text-lg font-bold text-gray-800 mb-2">Additional Information</h2>
              <div className="space-y-1">
                <p className="text-gray-600">
                  <span className="font-medium">SKU:</span> {id}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Category:</span> {category.toUpperCase()}
                </p>
              </div>
            </div>

            {/* --- Review Section --- */}
            <div className="border-t border-gray-200 pt-4">
              {/* Review Form */}
              {userId && !userReview && (
                <form onSubmit={handleReviewSubmit} className="mb-6 p-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Your Rating:</span>
                    <StarRating rating={newRating} onRatingChange={setNewRating} size={28} />
                  </div>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white"
                    rows={3}
                    placeholder="Write your review here..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className={`px-6 py-2 rounded-full text-white font-medium transition-all duration-200 ${reviewSubmitting ? 'bg-gray-400' : 'bg-orange-300 hover:bg-orange-400'}`}
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  {reviewError && <p className="text-red-500 text-sm mt-1">{reviewError}</p>}
                  {reviewSuccess && <p className="text-green-600 text-sm mt-1">Review submitted successfully!</p>}
                </form>
              )}
              {userId && userReview && (
                <div className="mb-6 p-0 flex items-center gap-3">
                  <span className="font-medium text-green-700">You have already reviewed this product.</span>
                  <StarRating rating={userReview.rating} readOnly size={20} />
                </div>
              )}
              {!userId && (
                <div className="mb-6 p-0 text-yellow-700">
                  Please <button className="underline font-medium" onClick={() => navigate('/login')}>login</button> to write a review.
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-0">
                {reviews.length === 0 && (
                  <div className="text-gray-500 text-sm py-4">No reviews yet. Be the first to review!</div>
                )}
                {reviews.map((review, idx) => (
                  <div key={review._id || idx} className="py-3 border-b-2 border-gray-400 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{review.username}</span>
                      <StarRating rating={review.rating} readOnly size={18} />
                      <span className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {editingReviewId === review._id ? (
                      <form onSubmit={e => handleEditReviewSubmit(e, review._id)} className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <StarRating rating={editRating} onRatingChange={setEditRating} size={20} />
                        </div>
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white"
                          rows={2}
                          value={editComment}
                          onChange={e => setEditComment(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button type="submit" disabled={editSubmitting} className="px-4 py-1 rounded-full text-white font-medium transition-all duration-200 bg-blue-500 hover:bg-blue-600">
                            {editSubmitting ? 'Saving...' : 'Save'}
                          </button>
                          <button type="button" onClick={cancelEditReview} className="px-4 py-1 rounded-full text-gray-700 font-medium transition-all duration-200 bg-gray-200 hover:bg-gray-300">
                            Cancel
                          </button>
                        </div>
                        {editError && <p className="text-red-500 text-sm mt-1">{editError}</p>}
                      </form>
                    ) : (
                      <>
                    <div className="text-gray-700 text-sm">{review.comment}</div>
                        {userId && review.userId === userId && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => startEditReview(review)}
                              className="px-3 py-1 rounded-full text-white font-medium transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="px-3 py-1 rounded-full text-white font-medium transition-all duration-200 bg-red-500 hover:bg-red-600 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footbar/>
    </div>
  );
}

export default ProductPage;