import React, { useState } from "react";
import axios from "axios";
import './App.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Footbar from './footbar';
import ErrorMessage from './components/ErrorMessage';
import api from './config/api.js';

const CreateListing = () => {
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
    
    // Validate file count
    if (files.length > 3) {
      setError("You can only upload up to 3 images");
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError("Please upload only JPEG, JPG, or PNG files");
      return;
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError("Each image must be less than 5MB");
      return;
    }

    setSelectedImages(files);
    setError("");

    // Create preview URLs
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
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", listing.title);
      formData.append("description", listing.description);
      formData.append("price", listing.price);
      formData.append("category", listing.category);
      formData.append("metalType", listing.metalType);

      // Append images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await api.post("/listings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          withCredentials: true
        },
        timeout: 30000
      });

      if (response.status === 201) {
        alert("Listing created successfully!");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      setError(error.response?.data?.error || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8 text-center">Create Jewelry Listing</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              name="title"
              placeholder="Enter jewelry title"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images * (Max 3 images, JPEG/PNG, 5MB each)</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              required
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
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;

