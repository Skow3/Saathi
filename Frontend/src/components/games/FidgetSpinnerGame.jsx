import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const FidgetSpinnerGame = () => {
  const [rotation, setRotation] = useState(0);

  // --- Logic adapted from CircularDial.jsx for realistic spin physics ---
  const spinnerRef = useRef(null);
  const animationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const centerRef = useRef({ x: 0, y: 0 });
  const historyRef = useRef([]);
  const prevPointerAngleRef = useRef(0);
  const prevTimeRef = useRef(performance.now());
  
  const friction = 0.985; // A little less friction for a longer spin
  const minVelocity = 0.1;

  // Helper functions
  const normalizeDeg = (deg) => (deg % 360 + 360) % 360;
  const shortestDelta = (to, from) => ((to - from + 180) % 360 - 180);

  const getPointerAngle = (e) => {
    const { x, y } = centerRef.current;
    const angle = (Math.atan2(e.clientY - y, e.clientX - x) * 180) / Math.PI;
    return normalizeDeg(angle);
  };

  const startDrag = (e) => {
    e.preventDefault();
    if (!spinnerRef.current) return;
    cancelAnimationFrame(animationRef.current);
    const rect = spinnerRef.current.getBoundingClientRect();
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    isDraggingRef.current = true;
    historyRef.current = [];
    const angle = getPointerAngle(e);
    prevPointerAngleRef.current = angle;
    historyRef.current.push({ time: performance.now(), angle });
    spinnerRef.current.setPointerCapture(e.pointerId);
  };

  const moveDrag = (e) => {
    if (!isDraggingRef.current) return;
    const angle = getPointerAngle(e);
    const delta = shortestDelta(angle, prevPointerAngleRef.current);
    setRotation((prev) => prev + delta);
    prevPointerAngleRef.current = angle;
    historyRef.current.push({ time: performance.now(), angle });
    if (historyRef.current.length > 5) historyRef.current.shift();
  };
  
  const inertiaAnimate = useCallback(() => {
    const now = performance.now();
    const dt = now - prevTimeRef.current;
    prevTimeRef.current = now;
    const frameRateAdjust = dt / (1000 / 60);
    
    velocityRef.current *= Math.pow(friction, frameRateAdjust);
    setRotation((prev) => prev + velocityRef.current * dt / 1000);

    if (Math.abs(velocityRef.current) > minVelocity) {
      animationRef.current = requestAnimationFrame(inertiaAnimate);
    }
  }, []);

  const endDrag = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    // Compute average velocity from the last few pointer movements
    const arr = historyRef.current;
    if (arr.length >= 2) {
      let sumV = 0;
      let count = 0;
      for (let i = 1; i < arr.length; i++) {
        const da = shortestDelta(arr[i].angle, arr[i-1].angle);
        const dt = (arr[i].time - arr[i-1].time) / 1000;
        if (dt > 0) {
          sumV += da / dt;
          count++;
        }
      }
      velocityRef.current = count > 0 ? sumV / count : 0;
    } else {
      velocityRef.current = 0;
    }

    if (Math.abs(velocityRef.current) > minVelocity) {
      prevTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(inertiaAnimate);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-bold text-white mb-4 py-20">Find Your Spin</h2>
      <p className="text-white/70 mb-8">Drag to spin. The faster you flick, the longer it goes.</p>
      
      <motion.div
        ref={spinnerRef}
        className="relative w-64 h-64 cursor-grab active:cursor-grabbing"
        style={{ rotate: rotation, touchAction: 'none' }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Spinner Arms */}
        {[0, 120, 240].map(angle => (
          <div key={angle} className="absolute w-full h-full" style={{ transform: `rotate(${angle}deg)` }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-32 bg-gradient-to-b from-pink-500 to-yellow-400 rounded-full shadow-lg" />
          </div>
        ))}
        {/* Center Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center shadow-inner">
          <div className="w-8 h-8 bg-gray-700 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default FidgetSpinnerGame;