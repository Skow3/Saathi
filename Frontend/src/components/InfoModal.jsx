import React, { useEffect } from 'react';
import ReactDOM from 'react-dom'; // 1. Import ReactDOM
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const InfoModal = ({ isOpen, onClose, title, children }) => {
  // Effect to handle the 'Escape' key press to close the modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  // 2. Wrap the JSX in ReactDOM.createPortal
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          {/* Modal Panel */}
          <motion.div
            className="relative w-full max-w-lg p-6 bg-gray-800/80 border border-blue-400/50 rounded-2xl shadow-2xl shadow-blue-500/20"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white font-heading">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <FaTimes className="text-white/70" />
              </button>
            </div>
            <div className="text-white/80 space-y-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') // 3. Tell the portal where to render
  );
};

export default InfoModal;