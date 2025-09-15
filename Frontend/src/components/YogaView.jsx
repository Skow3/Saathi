import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaPlayCircle } from 'react-icons/fa';
import { yogaSessions } from '../data/yoga';

const YogaView = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <div className="h-full w-full p-4 md:p-8">
      <AnimatePresence mode="wait">
        {selectedSession ? (
          // Session Detail View
          <motion.div
            key="session-detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col"
          >
            <button 
              onClick={() => setSelectedSession(null)}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-4"
            >
              <FaArrowLeft /> Back to Sessions
            </button>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-black rounded-2xl flex items-center justify-center">
                <FaPlayCircle className="text-white/30 text-8xl" />
                {/* Video player would go here */}
              </div>
              <div className="bg-gray-900/50 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedSession.title}</h2>
                <p className="text-white/70 mb-4">{selectedSession.description}</p>
                <h3 className="font-bold text-white mb-2">Poses in this session:</h3>
                <ul className="list-disc list-inside text-white/80 space-y-1">
                  {selectedSession.poses.map(pose => <li key={pose}>{pose}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          // Session Selection View
          <motion.div
            key="session-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6 text-center py-20">Yoga & Meditation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {yogaSessions.map(session => (
                <motion.div
                  key={session.id}
                  className="bg-gray-900/50 rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                >
                  <img src={session.thumbnail} alt={session.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-white">{session.title}</h3>
                    <p className="text-sm text-white/60 mt-1">{session.description}</p>
                    <p className="text-xs text-blue-400 mt-2 font-semibold">{session.duration}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YogaView;