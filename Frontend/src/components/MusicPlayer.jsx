import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMusic, FaBolt, FaBrain } from 'react-icons/fa';
import MusicPlayerModal from './MusicPlayerModal';
import { playlists } from '../data/music';

const MusicPlayer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState('calm');
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // The audio element is now controlled here
  const audioRef = useRef(null);
  
  const tracklist = playlists[activePlaylist] || [];
  const currentTrack = tracklist[trackIndex];

  // This effect syncs the audio player's state (play/pause) with our isPlaying state
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, trackIndex]);

  const openPlayer = (playlistName) => {
    if (activePlaylist !== playlistName) {
      setActivePlaylist(playlistName);
      setTrackIndex(0); // Start from the first song of the new playlist
      setIsPlaying(true); // Autoplay new playlist
    } else {
      setIsPlaying(true); // If same playlist, just ensure it's playing
    }
    setIsModalOpen(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setTrackIndex((prevIndex) => (prevIndex + 1) % tracklist.length);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    setTrackIndex((prevIndex) => (prevIndex - 1 + tracklist.length) % tracklist.length);
    setIsPlaying(true);
  };

  return (
    <>
      {/* This hidden audio element is the actual player */}
      {currentTrack && <audio ref={audioRef} src={currentTrack.src} onEnded={handleNextTrack} />}

      <motion.div 
        className="p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-pink-500/50 shadow-lg shadow-pink-500/20"
        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex items-center space-x-4">
          <button onClick={() => openPlayer('calm')} className="p-3 bg-pink-500/30 rounded-full text-pink-300 soft-pulse-button ring-2 ring-pink-500/50"><FaMusic /></button>
          <button onClick={() => openPlayer('energetic')} className="p-3 bg-yellow-500/30 rounded-full text-yellow-300 soft-pulse-button"><FaBolt /></button>
          <button onClick={() => openPlayer('focus')} className="p-3 bg-blue-500/30 rounded-full text-blue-300 soft-pulse-button"><FaBrain /></button>
        </div>
      </motion.div>

      {/* The Modal is now just a controller */}
      <MusicPlayerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        nextTrack={handleNextTrack}
        prevTrack={handlePrevTrack}
        currentTrack={currentTrack}
      />
    </>
  );
};

export default MusicPlayer;