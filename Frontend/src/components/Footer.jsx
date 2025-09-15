// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    // Changed for dark mode: Footer background
    <footer className="py-20 text-center bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-heading font-extrabold bg-gradient-to-r from-calm-blue via-calm-green to-calm-peach bg-clip-text text-transparent animate-gradient-text" style={{backgroundSize: '200% 200%'}}>
          Ready to meet your Saathi?
        </h2>
        {/* Changed for dark mode: Text colors */}
        <p className="mt-4 text-lg text-dark-gray/80 dark:text-gray-300">
          Start building a healthier relationship with your mind today.
        </p>
        <button className="mt-8 px-8 py-3 bg-calm-blue text-black dark:text-white font-bold rounded-full text-lg shadow-lg hover:scale-105 transition-transform">
          Sign Up for Free
        </button>
        <div className="mt-12 text-dark-gray/60 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Saathi by BinaryBANDITS. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;