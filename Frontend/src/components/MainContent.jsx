// src/components/MainContent.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatView from './ChatView';
import YogaView from './YogaView';
import MoodTrackerView from './MoodTrackerView';
import DiaryView from './DiaryView';
import GamesView from './GamesView';

// --- START OF CHANGES ---
// The component now needs to receive the mood update function to pass it down
const MainContent = ({ activeItem, moods, updateTodaysMood }) => {
// --- END OF CHANGES ---

  const content = {
    'Draw': { title: 'Drawing Board', text: 'A canvas to express your thoughts.' },
    'Games': { title: 'Game Center', text: 'Fun, mindful games to help you relax.' },
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Chat':
        return <ChatView />;
      case 'Yoga':
        return <YogaView />;
      case 'Mood':
        // --- START OF CHANGES ---
        // Pass the correct update function down to the MoodTrackerView
        return <MoodTrackerView moods={moods} updateTodaysMood={updateTodaysMood} />;
        // --- END OF CHANGES ---
      case 'Diary':
        return <DiaryView />;
      case 'Games':
        return <GamesView />;
      default:
        return (
          <div className="w-full h-full p-8 flex items-center justify-center text-center">
            <div>
              <h2 className="text-4xl font-bold text-white">{content[activeItem]?.title}</h2>
              <p className="mt-2 text-white/70">{content[activeItem]?.text}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem}
          className="w-full h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MainContent;