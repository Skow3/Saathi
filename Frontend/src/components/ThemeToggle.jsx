import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, cycleTheme } = useTheme();

  // Define the icons for each theme
  const icons = {
    light: <FaMoon key="moon" />,
    dark: <FaDesktop key="desktop" />,
    system: <FaSun key="sun" />,
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative w-8 h-8 flex items-center justify-center rounded-full text-calm-blue bg-gray-200 dark:bg-gray-700 dark:text-calm-peach hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {icons[theme]}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;