import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [listing, setListing] = useState({
    title: "",
    category: "ring",
    price: "",
    description: "",
    metalType: "gold",
    metalPurity: "18k",
    gemstones: []
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check admin
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    setIsAdmin(userData?.role === 'admin');
    if (!userData || userData.role !== 'admin') {
      alert('Only admins can edit listings.');
      navigate('/');
      return;
    }
    // Fetch product data
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8030/listings/id/${id}`);
        if (res.data) {
          setListing({
            title: res.data.title || '',
            category: res.data.category || 'ring',
            price: res.data.price || '',
            description: res.data.description || '',
            metalType: res.data.metalType || 'gold',
            metalPurity: res.data.metalPurity || '18k',
            gemstones: res.data.gemstones || []
          });
          // Set image previews if available
          if (res.data.images && res.data.images.length > 0) {
            setImagePreview(res.data.images.map(img => img.url));
          }
        }
      } catch (err) {
        setError('Failed to load product data.');
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setListing(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleGemstoneChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => ({ type: opt.value }));
    setListing(prev => ({ ...prev, gemstones: selected }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError("You can only upload up to 3 images");
      return;
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setError("Please upload only JPEG, JPG, or PNG files");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError("Each image must be less than 5MB");
      return;
    }
    setSelectedImages(files);
    setError("");
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!listing.title || !listing.price) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }
    try {
      const gemstones = Array.isArray(listing.gemstones) ? listing.gemstones : [];
      const listingData = {
        title: listing.title,
        category: listing.category,
        price: listing.price,
        description: listing.description || '',
        metalType: listing.metalType,
        metalPurity: listing.metalPurity,
        gemstones: gemstones
      };
      // If new images selected, use FormData, else send JSON
      if (selectedImages.length > 0) {
        const formData = new FormData();
        formData.append("listing", JSON.stringify(listingData));
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });
        await axios.put(`http://localhost:8030/listings/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data", withCredentials: true },
        });
      } else {
        await axios.put(`http://localhost:8030/listings/${id}`, { listing: listingData }, { withCredentials: true });
      }
      alert("Listing updated successfully!");
      navigate(`/product/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Error updating listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8 text-center">Edit Jewelry Listing</h2>
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              name="title"
              value={listing.title}
              placeholder="Enter jewelry title"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images (Max 3 images, JPEG/PNG, 5MB each)</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            />
            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
            <input
              name="price"
              type="number"
              value={listing.price}
              placeholder="Enter price"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={listing.description}
              placeholder="Enter description"
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={listing.category}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              onChange={handleChange}
            >
              <option value="ring">Ring</option>
              <option value="necklace">Necklace</option>
              <option value="earrings">Earrings</option>
              <option value="bracelet">Bracelet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metal Type</label>
            <select
              name="metalType"
              value={listing.metalType}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              onChange={handleChange}
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
              <option value="rose_gold">Rose Gold</option>
              <option value="white_gold">White Gold</option>
              <option value="palladium">Palladium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metal Purity</label>
            <select
              name="metalPurity"
              value={listing.metalPurity}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              onChange={handleChange}
            >
              <option value="18k">18k</option>
              <option value="22k">22k</option>
              <option value="24k">24k</option>
              <option value="925">925</option>
              <option value="950">950</option>
              <option value="999">999</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gemstones (hold Ctrl/Command to select multiple)</label>
            <select
              multiple
              value={listing.gemstones.map(g => g.type)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              onChange={handleGemstoneChange}
            >
              <option value="diamond">Diamond</option>
              <option value="ruby">Ruby</option>
              <option value="sapphire">Sapphire</option>
              <option value="emerald">Emerald</option>
              <option value="amethyst">Amethyst</option>
              <option value="pearl">Pearl</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-300 hover:bg-orange-400 hover:scale-105'
            } transition-all duration-200`}
          >
            {loading ? 'Updating...' : 'Update Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct; 