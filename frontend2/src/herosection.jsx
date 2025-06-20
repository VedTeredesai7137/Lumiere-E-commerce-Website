import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative h-150 w-full overflow-hidden">
      {/* Background Image with Picture Element for Responsiveness */}
      <picture className="absolute inset-0 w-full h-150">
        {/* Mobile Image */}
        <source 
          media="(max-width: 768px)" 
          srcSet="https://res.cloudinary.com/dqfchdmar/image/upload/v1750353030/WhatsApp_Image_2025-06-19_at_22.39.58_azui1g.jpg" 
        />
        {/* Desktop Image */}
        <img 
          src="https://res.cloudinary.com/dqfchdmar/image/upload/v1750342317/hero_z9nsx4.jpg"
          alt="Elegant jewelry collection showcase"
          className="w-450 h-150"
        />
      </picture>

      {/* Content Container */}
      <div className="relative z-10 flex items-center h-150">
        <div className="container mx-auto px-3 lg:px-10 pe-50 pb-30 lg:pt-20">
          <div className="max-w-2xl">
            {/* Main Heading */}
            <h1 className="font-serif text-2xl md:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
              Timeless Elegance
              <span className="block  text-black  mt-2">Crafted for You</span>
            </h1>

            {/* Subtext */}
            <p className="text-base md:text-xl  text-black mb-4 leading-relaxed max-w-lg">
              Discover our exquisite collection of handcrafted jewelry, where every piece tells a story of sophistication and grace.
            </p>

            {/* Secondary Text */}
            <p className="text-sm md:text-lg  text-black mb-8 max-w-md">
              From statement rings to delicate necklaces, find the perfect piece to celebrate life's precious moments.
            </p>


            <Link to="/rings">
            {/* CTA Button */}
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-10 md:py-4 border-none rounded-full font-semibold md:text-lg shadow-lg transition-all duration-300 ease-in-out bg-orange-400 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 hover:bg-orange-500 hover:scale-105">
              Explore Rings
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;