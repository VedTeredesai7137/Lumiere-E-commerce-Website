import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';
import Navbar from './navbar';
import Footbar from './footbar';
import StarRating from './starrating';
import ErrorMessage from './components/ErrorMessage';

function ListPage() {
  const [jewelryData, setJewelryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsData, setReviewsData] = useState({});
  const navigate = useNavigate();
  const { category } = useParams();

  // Category configuration
  const categoryConfig = {
    rings: {
      title: 'Exquisite Ring Collection',
      description: 'Discover our handcrafted rings, each piece telling a unique story of elegance and craftsmanship',
      endpoint: 'ring',
      singular: 'ring',
      plural: 'rings'
    },
    necklaces: {
      title: 'Exquisite Necklace Collection',
      description: 'Discover our handcrafted necklaces, each piece telling a unique story of elegance and craftsmanship',
      endpoint: 'necklace',
      singular: 'necklace',
      plural: 'necklaces'
    },
    earrings: {
      title: 'Exquisite Earring Collection',
      description: 'Discover our handcrafted earrings, each piece telling a unique story of elegance and craftsmanship',
      endpoint: 'earrings',
      singular: 'earring',
      plural: 'earrings'
    },
    bracelets: {
      title: 'Exquisite Bracelet Collection',
      description: 'Discover our handcrafted bracelets, each piece telling a unique story of elegance and craftsmanship',
      endpoint: 'bracelet',
      singular: 'bracelet',
      plural: 'bracelets'
    }
  };

  // Check for valid category
  const isValidCategory = !!categoryConfig[category];
  if (!isValidCategory) {
    return <ErrorMessage notFound={true} />;
  }
  const currentCategory = categoryConfig[category];

  useEffect(() => {
    const fetchJewelry = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8030/listings/${currentCategory.endpoint}`);
        setJewelryData(response.data);
        
        // Fetch reviews for each jewelry item
        const reviewsPromises = response.data.map(async (item) => {
          try {
            const reviewResponse = await axios.get(`http://localhost:8030/reviews/average/${item._id}`);
            return { id: item._id, averageRating: reviewResponse.data.averageRating || 0 };
          } catch (err) {
            return { id: item._id, averageRating: 0 };
          }
        });
        
        const reviewsResults = await Promise.all(reviewsPromises);
        const reviewsMap = {};
        reviewsResults.forEach(result => {
          reviewsMap[result.id] = result.averageRating;
        });
        setReviewsData(reviewsMap);
        
        setLoading(false);
      } catch (err) {
        console.error(`Failed to load ${currentCategory.plural}:`, err);
        setError(`Failed to load ${currentCategory.plural}. Please try again later.`);
        setLoading(false);
      }
    };

    if (category && categoryConfig[category]) {
      fetchJewelry();
    }
  }, [category, currentCategory.endpoint, currentCategory.plural]);

  const handleJewelryClick = (jewelryId) => {
    navigate(`/product/${jewelryId}`);
  };

  // Helper function to format metal type
  const formatMetalType = (metalType, metalPurity) => {
    if (!metalType) return '';
    
    const formattedMetal = metalType.replace('_', ' ').toUpperCase();
    if (metalPurity) {
      return `${formattedMetal} (${metalPurity})`;
    }
    return formattedMetal;
  };

  // Helper function to format gemstones
  const formatGemstones = (gemstones) => {
    if (!gemstones || gemstones.length === 0) return '';
    
    const gemstoneTypes = gemstones.map(gem => gem.type.toUpperCase());
    return gemstoneTypes.join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading {currentCategory.plural}...</div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Navbar/>
      {/* Header Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
            {currentCategory.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {currentCategory.description}
          </p>
        </div>

        {/* Jewelry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jewelryData && jewelryData.length > 0 ? (
            jewelryData.map((item) => {
              // Get the first image from the images array or fallback to old image field
              const getImageUrl = () => {
                try {
                  if (item.images && item.images.length > 0 && item.images[0] && item.images[0].url) {
                    return item.images[0].url;
                  }
                  // Fallback to old image field
                  if (item.image) {
                    return item.image;
                  }
                  // Final fallback
                  return 'https://via.placeholder.com/400x300/FFA500/FFFFFF?text=No+Image';
                } catch (error) {
                  console.error(`Error getting ${currentCategory.singular} image:`, error);
                  return 'https://via.placeholder.com/400x300/FFA500/FFFFFF?text=Error+Loading+Image';
                }
              };

              const averageRating = reviewsData[item._id] || 0;
              const metalText = formatMetalType(item.metalType, item.metalPurity);
              const gemstoneText = formatGemstones(item.gemstones);

              return (
                <div
                  key={item._id}
                  onClick={() => handleJewelryClick(item._id)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={getImageUrl()}
                      alt={item.title || currentCategory.singular}
                      className="w-full h-[300px] object-cover transition-transform duration-300 hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        console.error(`Error loading ${currentCategory.singular} image:`, e.target.src);
                        e.target.src = 'https://via.placeholder.com/400x300/FFA500/FFFFFF?text=Error+Loading+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-lg font-bold text-gray-800 mb-2 hover:text-orange-400 transition-colors duration-200">
                      {item.title || `Untitled ${currentCategory.singular}`}
                    </h3>
                    
                    {/* Rating Section */}
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={averageRating} readOnly size={16} />
                      <span className="text-gray-600 text-sm">{averageRating.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-gray-800">
                          ₹ {(item.price || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJewelryClick(item._id);
                        }}
                        className="bg-orange-300 text-white px-3 py-1.5 rounded-full hover:bg-orange-400 hover:scale-105 transition-all duration-200 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </div>
                    
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-xl text-gray-600">No {currentCategory.plural} found</p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-orange-300 text-white px-8 py-3 rounded-full hover:bg-orange-400 hover:scale-105 transition-all duration-200 font-medium text-lg shadow-lg">
            Load More {currentCategory.plural}
          </button>
        </div>
      </div>
      <Footbar/>
    </div>
  );
}

export default ListPage; 