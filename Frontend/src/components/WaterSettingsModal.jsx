import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const GLASS_SIZE_ML = 250;

const WaterSettingsModal = ({ isOpen, onClose, waterData, updateWaterData, setWaterUnit }) => {
  const [localUnit, setLocalUnit] = useState(waterData.unit);
  const [localGoal, setLocalGoal] = useState(waterData.unit === 'litres' ? waterData.goal / 1000 : waterData.goal / GLASS_SIZE_ML);

  useEffect(() => {
    setLocalUnit(waterData.unit);
    setLocalGoal(waterData.unit === 'litres' ? waterData.goal / 1000 : waterData.goal / GLASS_SIZE_ML);
  }, [isOpen, waterData]);

  const handleUnitChange = (newUnit) => {
    if (localUnit === newUnit) return;
    if (newUnit === 'glasses') {
      setLocalGoal(prev => Math.round((prev * 1000) / GLASS_SIZE_ML));
    } else {
      setLocalGoal(prev => (prev * GLASS_SIZE_ML) / 1000);
    }
    setLocalUnit(newUnit);
  };

  const handleSave = () => {
    const goalInML = localUnit === 'litres' ? localGoal * 1000 : localGoal * GLASS_SIZE_ML;
    updateWaterData({ goal: goalInML });
    setWaterUnit(localUnit);
    onClose();
  };
  
  const quickAdd = (amountMl) => {
    updateWaterData({ intake: waterData.intake + amountMl });
  }

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></motion.div>
          <motion.div 
            className="relative w-full max-w-lg p-6 bg-gray-800/80 border border-blue-400/50 rounded-2xl shadow-2xl"
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white font-heading">Hydration Settings</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><FaTimes className="text-white/70"/></button>
            </div>
            
            <div className="space-y-6 text-white">
              <div>
                <label className="block mb-2 text-sm font-medium">Measurement Unit</label>
                <div className="flex bg-gray-900/50 rounded-lg p-1">
                  <button onClick={() => handleUnitChange('litres')} className={`w-1/2 py-2 rounded-md transition ${localUnit === 'litres' ? 'bg-blue-500' : ''}`}>Litres</button>
                  <button onClick={() => handleUnitChange('glasses')} className={`w-1/2 py-2 rounded-md transition ${localUnit === 'glasses' ? 'bg-blue-500' : ''}`}>Glasses</button>
                </div>
              </div>
              <div>
                <label htmlFor="goal" className="block mb-2 text-sm font-medium">Your Daily Goal ({localUnit})</label>
                <input
                  id="goal"
                  type="number"
                  step={localUnit === 'litres' ? 0.1 : 1}
                  value={localGoal.toFixed(localUnit === 'litres' ? 1 : 0)}
                  onChange={(e) => setLocalGoal(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-gray-900/50 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Log Your Intake</label>
                <div className="flex space-x-2">
                  <button onClick={() => quickAdd(GLASS_SIZE_ML)} className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20">+1 Glass</button>
                  <button onClick={() => quickAdd(GLASS_SIZE_ML * 2)} className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20">+2 Glasses</button>
                </div>
              </div>
              <button onClick={handleSave} className="w-full py-3 bg-blue-500 rounded-lg font-bold hover:bg-blue-600 transition">Save Settings</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root')
  );
};

export default WaterSettingsModal;