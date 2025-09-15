import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedEmoji from './AnimatedEmoji';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';

const availableMoods = [
  { name: 'happy', level: 0.9, text: 'Happy' },
  { name: 'calm', level: 0.7, text: 'Calm' },
  { name: 'neutral', level: 0.5, text: 'Neutral' },
  { name: 'sad', level: 0.3, text: 'Sad' },
  { name: 'celebrate', level: 1.0, text: 'Great' },
];

const MoodTrackerView = ({ moods, updateTodaysMood }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [journalInput, setJournalInput] = useState('');
  const todayIndex = moods.length - 1;

  // This effect syncs the journal input with any remarks already saved for today
  useEffect(() => {
    if (moods[todayIndex]?.remarks) {
      setJournalInput(moods[todayIndex].remarks);
    } else {
      setJournalInput('');
    }
  }, [moods, todayIndex]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    updateTodaysMood(mood);
    setTimeout(() => {
      setShowSelector(false);
      setSelectedMood(null);
    }, 1500);
  };

  const handleSaveNote = () => {
    const todayMoodData = moods[todayIndex];
    // When saving the note, we also send the existing mood data back
    // to ensure the record is updated correctly, not partially created.
    updateTodaysMood({
      name: todayMoodData.name,
      level: todayMoodData.level,
      note: journalInput,
    });
  };

  return (
    <div className="h-full w-full p-4 md:p-8 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-white mb-6 py-20">Your Weekly Mood Journey</h2>
      <div className="w-full grid grid-cols-7 gap-3 mb-6">
        {moods.map((day, index) => {
          const isToday = index === todayIndex;
          return (
            <div key={index} className="flex flex-col items-center text-center">
              <span className="text-white/70 font-semibold">{day.day}</span>
              <motion.div
                onClick={() => isToday && setShowSelector(!showSelector)}
                className={`mt-2 w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${isToday ? 'bg-blue-500/30 cursor-pointer border-2 border-blue-400' : 'bg-gray-900/50'}`}
                whileHover={isToday ? { scale: 1.05 } : {}}
              >
                {day.logged ? <AnimatedEmoji mood={day.name} /> : (isToday && <FaPlus size={24} className="text-white/50" />)}
              </motion.div>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {showSelector && (
          <motion.div
            className="w-full max-w-lg p-6 bg-gray-900/70 rounded-2xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">How are you feeling?</h3>
            <div className="flex justify-center gap-4">
              {availableMoods.map(mood => (
                <motion.div
                  key={mood.name}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => handleMoodSelect(mood)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="p-2 bg-black/20 rounded-full">
                    <AnimatedEmoji mood={mood.name} />
                  </div>
                  <span className={`text-sm transition-opacity duration-300 ${selectedMood?.name === mood.name ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{mood.text}</span>
                </motion.div>
              ))}
            </div>
            {selectedMood && <p className="mt-4 text-green-400 text-center">Thanks for sharing!</p>}
          </motion.div>
        )}
      </AnimatePresence>
      
      {moods[todayIndex]?.logged && (
        <motion.div 
          className="mt-6 w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FaPencilAlt className="text-white/70" />
            <h3 className="text-lg font-bold text-white">Add a note for today</h3>
          </div>
          <textarea
            value={journalInput}
            onChange={(e) => setJournalInput(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-24 p-3 bg-gray-900/50 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 outline-none text-white resize-none"
          />
          <button 
            onClick={handleSaveNote}
            className="w-full mt-2 bg-pink-500 text-white font-bold py-2 px-6 rounded-full hover:bg-pink-600 transition-colors"
          >
            Save Note
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MoodTrackerView;