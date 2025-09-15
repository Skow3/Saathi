import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import CircularDial from '../components/CircularDial';
import MainContent from '../components/MainContent';
import MusicPlayer from '../components/MusicPlayer';
import MoodChart from '../components/MoodChart';
import WaterIntake from '../components/WaterIntake';
import SleepTracker from '../components/SleepTracker';
import { FaCommentDots, FaPaintBrush, FaBook, FaGamepad, FaSmile, FaYinYang } from 'react-icons/fa';

const menuItems = [
  { icon: <FaCommentDots />, name: 'Chat' }, { icon: <FaPaintBrush />, name: 'Draw' },
  { icon: <FaBook />, name: 'Diary' }, { icon: <FaGamepad />, name: 'Games' },
  { icon: <FaSmile />, name: 'Mood' }, { icon: <FaYinYang />, name: 'Yoga' },
];
const menuIcons = menuItems.map(item => item.icon);

const Dashboard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = menuItems[activeIndex].name;
  
  // State for Water Tracker
  const [waterData, setWaterData] = useState({ intake: 0, goal: 2000, unit: 'litres' });
  const [isFetchingWater, setIsFetchingWater] = useState(true);

  // State for Mood Tracker
  const [moods, setMoods] = useState([]);
  const [isFetchingMoods, setIsFetchingMoods] = useState(true);

  // This one effect fetches all necessary data when the component loads
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch Water Data
      try {
        const waterRes = await axios.get('http://127.0.0.1:8000/api/water', { withCredentials: true });
        setWaterData(prev => ({ ...prev, intake: waterRes.data.intake, goal: waterRes.data.goal }));
      } catch (error) {
        console.error("Failed to fetch water data:", error);
      } finally {
        setIsFetchingWater(false);
      }
      
      // Fetch Mood Data
      try {
        const moodRes = await axios.get('http://127.0.0.1:8000/api/moods', { withCredentials: true });
        setMoods(moodRes.data);
      } catch (error) {
        console.error("Failed to fetch mood data:", error);
      } finally {
        setIsFetchingMoods(false);
      }
    };
    fetchInitialData();
  }, []); // Empty array ensures this runs only once on mount

  // Function to update water data in state and the backend
  const updateWaterData = async (newData) => {
    const oldData = { ...waterData };
    setWaterData(prev => ({ ...prev, ...newData })); // Optimistic UI update
    try {
      await axios.post('http://127.0.0.1:8000/api/water', newData, { withCredentials: true });
    } catch (error) {
      console.error("Failed to update water data:", error);
      setWaterData(oldData); // Revert on failure
    }
  };

  // Function to update today's mood in state and the backend
  const updateTodaysMood = async (newMoodData) => {
    const todayIndex = moods.length - 1;
    if (todayIndex < 0) return;
    
    const oldMoods = [...moods];
    const updatedMoods = [...moods];
    updatedMoods[todayIndex] = { ...updatedMoods[todayIndex], ...newMoodData, logged: true };
    setMoods(updatedMoods);

    try {
      await axios.post('http://127.0.0.1:8000/api/moods', newMoodData, { withCredentials: true });
    } catch (error) {
      console.error("Failed to save mood:", error);
      setMoods(oldMoods); // Revert on failure
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#1a3a69] text-white overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-4 sm:p-6 md:p-8 pointer-events-none">
        <div className="flex justify-start items-start pointer-events-auto py-8">
          {!isFetchingWater && (
            <WaterIntake
              waterData={waterData}
              updateWaterData={updateWaterData}
              setWaterUnit={(unit) => setWaterData(prev => ({ ...prev, unit }))}
            />
          )}
        </div>
        <div className="flex justify-end items-start pointer-events-auto py-8">
          {!isFetchingMoods && <MoodChart moods={moods} updateTodaysMood={updateTodaysMood} />}
        </div>
        <div className="flex justify-start items-end pointer-events-auto"><SleepTracker /></div>
        <div className="flex justify-end items-end pointer-events-auto"><MusicPlayer /></div>
      </div>
      <div className="w-full flex flex-col items-center mt-[40px] space-y-0 pointer-events-none">
        <div className="relative w-full h-[100px] overflow-visible z-20">
          <div className="absolute top-[-140px] left-1/2 -translate-x-1/2 pointer-events-auto">
            <CircularDial
              radiusPx={140}
              icons={menuIcons}
              activeIndex={activeIndex}
              onSelect={(idx) => setActiveIndex(idx)}
            />
          </div>
        </div>
        <motion.div
          className="w-full max-w-5xl h-200 bg-black/20 backdrop-blur-sm rounded-3xl shadow-2xl z-10 pointer-events-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <MainContent 
            activeItem={activeItem} 
            moods={moods} 
            updateTodaysMood={updateTodaysMood} 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;