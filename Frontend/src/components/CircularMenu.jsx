import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaCommentDots, FaPaintBrush, FaBook, FaGamepad, FaSmile, FaYinYang } from 'react-icons/fa';

const icons = [
  { icon: <FaCommentDots />, name: 'Chat' },
  { icon: <FaPaintBrush />, name: 'Draw' },
  { icon: <FaBook />, name: 'Diary' },
  { icon: <FaGamepad />, name: 'Games' },
  { icon: <FaSmile />, name: 'Mood' },
  { icon: <FaYinYang />, name: 'Yoga' },
];

const CircularMenu = ({ onSelect }) => {
  const rotation = useMotionValue(0);
  const radius = 120; // in pixels

  return (
    <div className="relative w-full h-40 flex items-center justify-center">
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{ rotate: rotation }}
        drag="x"
        dragConstraints={{ left: -360, right: 360 }}
        dragElastic={0.1}
        onDrag={(event, info) => {
          rotation.set(rotation.get() + info.delta.x);
        }}
      >
        {icons.map((item, index) => {
          const angle = (index / icons.length) * 360 + 180;
          const itemRotation = useTransform(rotation, (r) => r + angle);
          const x = useTransform(itemRotation, (r) => radius * Math.sin((r * Math.PI) / 180));
          const y = useTransform(itemRotation, (r) => radius * Math.cos((r * Math.PI) / 180));
          const counterRotate = useTransform(rotation, (r) => -r);

          return (
            <motion.div
              key={item.name}
              className="absolute top-1/2 left-1/2"
              style={{ x, y }}
            >
              <motion.button
                onClick={() => onSelect(item.name)}
                className="w-16 h-16 bg-gradient-to-br from-pink-500 to-yellow-400 text-white rounded-full flex flex-col items-center justify-center text-2xl shadow-lg"
                style={{ rotate: counterRotate }}
                whileHover={{ scale: 1.2, boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)" }}
                whileTap={{ scale: 0.9 }}
              >
                {item.icon}
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CircularMenu;