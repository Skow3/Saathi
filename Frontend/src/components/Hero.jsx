// src/components/Hero.jsx
import React from 'react';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Changed for dark mode: Different gradient for dark theme */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-calm-blue via-calm-green to-calm-peach dark:from-gray-800 dark:via-blue-900 dark:to-purple-900 animate-bg-pan"
        style={{ backgroundSize: '400% 400%' }}
      ></div>

      {/* Content */}
      <div className="relative z-10 p-4">
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white drop-shadow-lg drop-shadow-black">
          Feeling overwhelmed? You're not alone.
        </h1>
        <p className="mt-4 text-lg md:text-xl dark:text-white/90 max-w-2xl mx-auto text-black drop-shadow-lg drop-shadow-black">
          Meet Saathi, your personal wellness companion. A private, judgment-free space to understand your feelings and find your calm.
        </p>
        <button className="mt-8 px-8 py-3 bg-white text-calm-blue font-bold rounded-full text-lg shadow-xl hover:scale-105 transition-transform">
          Begin Your Journey
        </button>
      </div>
    </div>
  );
};

export default Hero;