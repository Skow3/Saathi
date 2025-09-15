import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaCog } from 'react-icons/fa';
import WaterSettingsModal from './WaterSettingsModal';

const WaterIntake = ({ waterData, updateWaterData, setWaterUnit }) => {
  const [bubbles, setBubbles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { intake, goal, unit } = waterData;
  const fillLevel = goal > 0 ? Math.min(intake / goal, 1) : 0;

  const handleAddWater = () => {
    updateWaterData({ intake: intake + 250 }); // Add 250ml
    const newBubble = { id: Date.now(), x: Math.random() * 80 + 10 };
    setBubbles(prev => [...prev, newBubble]);
  };

  const handleRemoveWater = () => {
    updateWaterData({ intake: Math.max(intake - 250, 0) }); // Remove 250ml
  };
  
  const displayGoal = unit === 'litres' ? (goal / 1000).toFixed(2) + 'L' : Math.round(goal / 250) + ' Glasses';
  const displayIntake = unit === 'litres' ? (intake / 1000).toFixed(2) + 'L' : Math.round(intake / 250) + ' Glasses';

  return (
    <>
      <motion.div 
        className="p-4 rounded-2xl bg-black/30 backdrop-blur-md flex flex-col items-center w-48"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="w-full flex justify-between items-center">
          <h3 className="font-bold text-white text-sm">Water Intake</h3>
          <button onClick={() => setIsModalOpen(true)} className="text-white/50 hover:text-white transition">
            <FaCog />
          </button>
        </div>
        <p className="text-white/70 text-xs mb-2 self-start">{displayIntake} / {displayGoal}</p>
        
        <div className="relative w-20 h-32 bg-white/10 rounded-t-2xl rounded-b-lg border-2 border-blue-300/50 mt-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <AnimatePresence>
            {bubbles.map((bubble) => (
              <motion.div
                key={bubble.id} className="absolute bottom-2 w-2 h-2 bg-white/50 rounded-full"
                style={{ left: `${bubble.x}%` }} initial={{ opacity: 0.7, y: 0, scale: 0.5 }}
                animate={{ y: -100, scale: 1.5 }} exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                onAnimationComplete={() => setBubbles(b => b.filter(item => item.id !== bubble.id))}
              />
            ))}
          </AnimatePresence>
          <motion.div 
            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-b-md"
            animate={{ height: `${fillLevel * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-2 bg-blue-300/50 rounded-full"></div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <motion.button onClick={handleRemoveWater} className="p-2 bg-white/10 rounded-full text-white/70" whileTap={{ scale: 0.9 }}><FaMinus /></motion.button>
          <motion.button onClick={handleAddWater} className="p-3 bg-blue-500 rounded-full text-white" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}><FaPlus /></motion.button>
        </div>
      </motion.div>

      <WaterSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        waterData={waterData}
        updateWaterData={updateWaterData}
        setWaterUnit={setWaterUnit}
      />
    </>
  );
};

export default WaterIntake;