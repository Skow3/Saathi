// src/components/AnimatedEmoji.jsx

import React from 'react';
import Lottie from 'lottie-react';
import happyAnimation from '../animations/happy.json';
import calmAnimation from '../animations/calm.json';
import neutralAnimation from '../animations/neutral.json';
import sadAnimation from '../animations/sad.json';
import celebrateAnimation from '../animations/celebrate.json';

const animationMap = {
  happy: happyAnimation,
  calm: calmAnimation,
  neutral: neutralAnimation,
  sad: sadAnimation,
  celebrate: celebrateAnimation,
};

const AnimatedEmoji = ({ mood, className = 'w-10 h-10' }) => {
  const animationData = animationMap[mood] || neutralAnimation;
  return <Lottie animationData={animationData} loop={true} className={className} />;
};

export default AnimatedEmoji;