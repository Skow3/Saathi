import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaForward, FaBackward, FaTimes } from 'react-icons/fa';

const MusicPlayerModal = ({
  isOpen,
  onClose,
  isPlaying,
  togglePlayPause,
  nextTrack,
  prevTrack,
  currentTrack
}) => {
  if (!isOpen || !currentTrack) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></motion.div>
        
        <motion.div
          className="relative w-full max-w-sm p-6 bg-gray-900/70 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="absolute inset-[-200px] -z-10 bg-gradient-to-br from-pink-500 via-blue-500 to-yellow-400 animate-spin-slow opacity-30" />
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"><FaTimes /></button>

          <div className="flex flex-col items-center text-white">
            <motion.img 
              key={currentTrack.art}
              src={currentTrack.art} alt="Album Art" 
              className="w-56 h-56 rounded-lg shadow-lg mb-6" 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            />
            <h2 className="text-2xl font-bold">{currentTrack.title}</h2>
            <p className="text-white/70">{currentTrack.artist}</p>

            {/* Controls now call functions from props */}
            <div className="flex items-center space-x-8 mt-8">
              <button onClick={prevTrack} className="text-2xl text-white/70 hover:text-white"><FaBackward /></button>
              <button onClick={togglePlayPause} className="w-16 h-16 flex items-center justify-center bg-white/20 rounded-full text-3xl">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={nextTrack} className="text-2xl text-white/70 hover:text-white"><FaForward /></button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.getElementById('modal-root')
  );
};

export default MusicPlayerModal;