// src/components/Impact.jsx

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// A few example experiences or affirmations
const experiences = [
  { quote: "I finally feel understood. It's like having a friend who's always there.", author: "Jessica L." },
  { quote: "The daily check-ins have made a huge difference in my routine and mood.", author: "Kavyaa P." },
  { quote: "A safe space to just be myself without any judgment. Truly grateful.", author: "Shivam K." },
  { quote: "Saathi helped me realize I'm not alone in my feelings.", author: "Alex R." },
];

const Impact = () => {
  const [index, setIndex] = useState(0);

  // This useEffect will cycle through the experiences every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % experiences.length);
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, []);

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: The Animated Counter */}
        <div className="text-center lg:text-left">
          <FaHeart className="text-calm-peach text-5xl mb-4 inline-block" />
          <h2 className="text-4xl font-heading font-bold text-dark-gray dark:text-gray-100 mb-2">
            Uplifting minds and spreading smiles.
          </h2>
          <p className="text-lg text-dark-gray/80 dark:text-gray-300">
            Join our growing community. Today, we've helped uplift
          </p>
          <div className="text-7xl font-bold text-calm-blue my-4">
            <CountUp end={1284} duration={3} separator="," />+
          </div>
          <p className="text-lg text-dark-gray/80 dark:text-gray-300">
            minds and counting!
          </p>
        </div>

        {/* Right Side: Animated Experiences */}
        <div className="relative h-48 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center absolute"
            >
              <p className="text-xl italic text-dark-gray dark:text-gray-200">
                "{experiences[index].quote}"
              </p>
              <p className="mt-4 font-bold text-calm-blue">- {experiences[index].author}</p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default Impact;