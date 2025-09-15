import React from 'react';
import { motion } from 'framer-motion';
import { FaMoon } from 'react-icons/fa';

const SleepTracker = () => {
  return (
    <motion.div 
      className="p-4 rounded-2xl bg-black/30 backdrop-blur-md flex items-center space-x-4"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
    >
      <FaMoon className="text-yellow-300 text-2xl" />
      <div>
        <h3 className="font-bold text-white text-sm">Last Night's Sleep</h3>
        <p className="text-white/80 text-lg font-medium">7h 45m</p>
      </div>
    </motion.div>
  );
};

export default SleepTracker;