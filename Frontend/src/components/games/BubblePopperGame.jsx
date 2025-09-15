import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BubblePopperGame = () => {
  const createGrid = () => Array.from({ length: 9 * 5 }, (_, i) => ({ id: i, popped: false }));
  const [bubbles, setBubbles] = useState(createGrid());
  const popSound = useMemo(() => new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3'), []);

  const popBubble = (id) => {
    popSound.currentTime = 0;
    popSound.play();
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
  };
  
  const allPopped = bubbles.every(b => b.popped);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-bold text-white mb-2 py-20">Bubble Popper</h2>
      <p className="text-white/70 mb-6">A moment of satisfying calm.</p>

      <div className="grid grid-cols-9 gap-4">
        <AnimatePresence>
          {bubbles.map(bubble => !bubble.popped && (
            <motion.button
              key={bubble.id}
              onClick={() => popBubble(bubble.id)}
              className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, transition: { duration: 0.2 } }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </AnimatePresence>
      </div>

      {allPopped && (
        <motion.button 
          onClick={() => setBubbles(createGrid())}
          className="mt-8 bg-pink-500 text-white font-bold py-2 px-6 rounded-full"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          Reset
        </motion.button>
      )}
    </div>
  );
};

export default BubblePopperGame;