import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import AnimatedEmoji from './AnimatedEmoji';

const availableMoods = [
  { name: 'happy', level: 0.9 }, { name: 'calm', level: 0.7 },
  { name: 'neutral', level: 0.5 }, { name: 'sad', level: 0.3 },
  { name: 'celebrate', level: 1.0 },
];

const MoodLoggingModal = ({ isOpen, onClose, onSave, day }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></motion.div>
        <motion.div
          className="relative w-full max-w-md p-6 bg-gray-800/80 rounded-2xl shadow-2xl"
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white font-heading">How are you feeling on {day}?</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><FaTimes /></button>
          </div>
          <div className="flex justify-around items-center p-4">
            {availableMoods.map(mood => (
              <motion.button
                key={mood.name}
                onClick={() => onSave(mood)}
                className="p-2 rounded-full transition-transform"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatedEmoji mood={mood.name} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.getElementById('modal-root')
  );
};

export default MoodLoggingModal;