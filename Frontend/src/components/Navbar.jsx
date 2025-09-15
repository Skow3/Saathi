import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // 1. State to manage dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setIsDropdownOpen(false); // Close dropdown on logout
    await logout();
    navigate('/');
  };

  // 2. Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-heading font-bold text-dark-gray dark:text-gray-100">Saathi</Link>
        <div className="hidden md:flex items-center space-x-6 text-dark-gray dark:text-gray-200">
          <Link to="/dashboard" className="hover:text-calm-blue transition-colors">Dashboard</Link>
          {/* Note: In a real SPA, these hash links might need a library like 'react-scroll' */}
          <a href="/#features" className="hover:text-calm-blue transition-colors">Features</a>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {!isLoading && (
            isAuthenticated ? (
              // 3. If user is logged in, show the profile dropdown
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(prev => !prev)} className="text-2xl text-dark-gray dark:text-gray-200">
                  <FaUserCircle />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border dark:border-gray-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <ul>
                        <li>
                          <Link to="/aboutyou" onClick={() => setIsDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-dark-gray dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            About You
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // If user is logged out:
              <>
                <Link to="/login" className="font-bold text-dark-gray dark:text-gray-200 hover:text-calm-blue transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="bg-calm-blue text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-all">
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;