import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedEmoji from './AnimatedEmoji';
import MoodLoggingModal from './MoodLoggingModal';

const MoodChart = ({ moods, updateTodaysMood }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  const openModalForDay = (index) => {
    setSelectedDayIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveMood = (newMood) => {
    updateTodaysMood(newMood);
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div
        className="p-4 rounded-2xl bg-black/30 backdrop-blur-md"
        initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="font-bold text-white mb-4 text-sm">Mood Trends</h3>
        <div className="flex justify-between items-end h-32 space-x-2">
          {moods.map((item, index) => {
            const isToday = index === moods.length - 1;

            return (
              <motion.div
                key={index}
                className={`relative flex flex-col items-center flex-1 group ${isToday ? 'cursor-pointer' : 'opacity-60'}`}
                onClick={isToday ? () => openModalForDay(index) : undefined}
                whileHover={isToday ? "hover" : ""}
              >
                <motion.div
                  className="absolute -top-8 p-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap"
                  variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 5 } }}
                  initial="initial"
                  transition={{ duration: 0.2 }}
                >
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </motion.div>

                <AnimatedEmoji mood={item.name} />
                
                <motion.div
                  className="w-full bg-gradient-to-t from-yellow-400 via-pink-500 to-blue-500 rounded-full mt-1"
                  initial={{ height: 0 }}
                  animate={{ height: `${item.level * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                />
                <span className="text-white/70 text-xs mt-1">{item.day}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
      
      <MoodLoggingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMood}
        day={selectedDayIndex !== null && moods[selectedDayIndex] ? moods[selectedDayIndex].day : ''}
      />
    </>
  );
};

export default MoodChart;