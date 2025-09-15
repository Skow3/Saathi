import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const thoughts = [
  "What's on your mind?",
  "It's okay to rest.",
  "You know cats are good for mind ?",
  "How are you feeling?",
  "You are enough.",
  "You're the bestt",
  "What made you smile today?",
  "Be kind to yourself.",
];

const ThoughtClouds = () => {
  const [index, setIndex] = useState(0);

  // This effect will cycle to the next thought every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % thoughts.length);
    }, 6000); // 6 seconds per thought

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-1/2 flex items-center justify-center z-0 pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={index}
          // This div will appear, stay for a bit, then disappear
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 1.5, ease: "easeOut" } }}
          exit={{ opacity: 0, y: -20, scale: 0.8, transition: { duration: 1.5, ease: "easeIn" } }}
          // Light and Dark mode styles
          className="absolute p-3 px-5 rounded-full bg-gray-200/80 text-gray-700 dark:bg-white/10 dark:text-white/70 text-sm whitespace-nowrap shadow-lg"
        >
          {thoughts[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ThoughtClouds;