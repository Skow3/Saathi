import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaDotCircle, FaArrowLeft } from 'react-icons/fa';
import FidgetSpinnerGame from './games/FidgetSpinnerGame';
import BubblePopperGame from './games/BubblePopperGame';

const gameList = [
  { id: 'popper', title: 'Bubble Popper', description: 'For stress relief', icon: <FaDotCircle /> },
  { id: 'spinner', title: 'Fidget Spinner', description: 'To find calm', icon: <FaSpinner /> },
];

const GamesView = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const GameComponent = selectedGame === 'popper' ? BubblePopperGame : FidgetSpinnerGame;

  return (
    <div className="h-full w-full p-4 md:p-8">
      <AnimatePresence mode="wait">
        {selectedGame ? (
          <motion.div key="game-play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setSelectedGame(null)} className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white">
              <FaArrowLeft /> Back to Games
            </button>
            <GameComponent />
          </motion.div>
        ) : (
          <motion.div key="game-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-3xl font-bold text-white mb-6 text-center py-20">Game Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {gameList.map(game => (
                <motion.div
                  key={game.id}
                  className="bg-gray-900/50 p-6 rounded-2xl cursor-pointer text-center"
                  onClick={() => setSelectedGame(game.id)}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)" }}
                >
                  <div className="text-5xl text-pink-400 mb-4 inline-block">{game.icon}</div>
                  <h3 className="font-bold text-white text-xl">{game.title}</h3>
                  <p className="text-sm text-white/60 mt-1">{game.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamesView;