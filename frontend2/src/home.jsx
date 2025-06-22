import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css'
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import HeroSection from './herosection';
import Footbar from './footbar';
import ErrorMessage from './components/ErrorMessage';
import api from './config/api.js';


const Home = () => {
  const [email, setEmail] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/check-auth", {
          withCredentials: true
        });
        if (response.data.status === "ok") {
          const userData = response.data.user;
          sessionStorage.setItem("userData", JSON.stringify(userData));
          setLoggedInUser(userData);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/listings", {
          withCredentials: true
        });
        setListings(response.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchListings();
  }, []);

  const categories = [
    {
      name: 'Rings',
      description: 'Eternal symbols of love',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      price: 'From $2,500',
      feature: 'Engagement Rings'
    },
    {
      name: 'Necklaces',
      description: 'Grace around your neck',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      price: 'From $1,800',
      feature: 'Statement Necklaces'
    },
    {
      name: 'Earrings',
      description: 'Sparkle with every turn',
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      price: 'From $950',
      feature: 'Drop Earrings'
    },
    {
      name: 'Bracelets',
      description: 'Elegant wrist companions',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      price: 'From $1,200',
      feature: 'Tennis Bracelets'
    }
  ];

  const features = [
    {
      icon: '💎',
      title: 'Certified Authentic',
      description: 'Every piece comes with authentication certificates and lifetime warranty'
    },
    {
      icon: '🚚',
      title: 'Free Luxury Shipping',
      description: 'Complimentary insured shipping with elegant packaging worldwide'
    },
    {
      icon: '👑',
      title: 'Bespoke Service',
      description: 'Custom designs and personal consultation with our master jewelers'
    }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing!');
      setEmail('');
    }
  };

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="bg-orange-50 min-h-200">
      <Navbar/>

      {/* Hero Section */}
      <HeroSection/>
      
      {/* Featured Categories */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-800 mb-4">Our Premium Collections</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each piece is meticulously crafted with the finest materials and attention to detail
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/${category.name.toLowerCase()}`}
                className="group cursor-pointer animate-on-scroll block"
                style={{ textDecoration: 'none' }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-xl font-serif font-bold">{category.feature}</h3>
                    <p className="text-sm">{category.price}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-serif font-bold text-gray-800">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 animate-on-scroll">
                <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footbar />

      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
};

export default Home;