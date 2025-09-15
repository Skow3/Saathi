// src/components/Playground.jsx
import React, { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react"; // New imports
import { loadSlim } from "@tsparticles/slim"; // New slim bundle
import { useTheme } from '../contexts/ThemeContext';

const Playground = () => {
  const { theme } = useTheme();
  const [init, setInit] = useState(false);

  // This useEffect will run only once to initialize the engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // Load the slim preset, you can load others too
      await loadSlim(engine);
    }).then(() => {
      setInit(true); // Mark the engine as initialized
    });
  }, []);

  // Memoize the options to prevent unnecessary re-renders
  const particlesLoaded = (container) => {
    console.log("Particles container loaded", container);
  };
  
  const options = useMemo(() => ({
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: true, mode: "repulse" },
      },
      modes: { push: { quantity: 4 }, repulse: { distance: 150, duration: 0.4 } },
    },
    particles: {
      color: { value: theme === 'light' ? "#333333" : "#AEC6CF" },
      links: {
        color: { value: theme === 'light' ? "#AEC6CF" : "#B2E2B2" },
        distance: 150, enable: true, opacity: 0.5, width: 1
      },
      move: { enable: true, speed: 2 },
      number: { density: { enable: true, area: 800 }, value: 80 },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 5 } },
    },
    detectRetina: true,
  }), [theme]); // Re-create options only when the theme changes

  if (init) {
    return (
      <section id="playground" className="relative h-[60vh] bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-center">
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={options}
        />
        <div className="relative z-10 p-4 text-dark-gray dark:text-white">
          <h2 className="text-4xl font-heading font-bold">Take a Moment to Breathe</h2>
          <p className="mt-2 text-lg max-w-2xl mx-auto">
            No goals, no tasks. Just a quiet space to clear your mind.
          </p>
        </div>
      </section>
    );
  }

  return <></>; // Render nothing until the engine is initialized
};

export default Playground;