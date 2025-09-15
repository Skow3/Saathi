import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaPaintBrush, FaBook, FaGamepad, FaSmile, FaYinYang } from 'react-icons/fa';

// Default icons and names for the Saathi app
const defaultMenuItems = [
  { icon: <FaCommentDots key="chat" />, name: 'Chat' },
  { icon: <FaPaintBrush key="draw" />, name: 'Draw' },
  { icon: <FaBook key="diary" />, name: 'Diary' },
  { icon: <FaGamepad key="games" />, name: 'Games' },
  { icon: <FaSmile key="mood" />, name: 'Mood' },
  { icon: <FaYinYang key="yoga" />, name: 'Yoga' },
];

const CircularDial = ({
  radiusPx = 140,
  icons: propIcons,
  onSelect,
  snapToNearest = true,
  inertia = true,
  friction = 0.95,
  minVelocity = 0.1,
  onAngleChange,
}) => {
  const icons = propIcons || defaultMenuItems.map(item => item.icon);
  const iconNames = defaultMenuItems.map(item => item.name);
  const numIcons = icons.length;
  const slotAngle = 360 / numIcons;

  // Refs
  const dialRef = useRef(null);
  const animationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isSnappingRef = useRef(false);
  const centerRef = useRef({ x: 0, y: 0 });
  const historyRef = useRef([]);
  const prevPointerAngleRef = useRef(0);
  const prevTimeRef = useRef(performance.now());
  const startSnapTimeRef = useRef(0);
  const startSnapRotRef = useRef(0);
  const targetSnapRotRef = useRef(0);

  const dragStartTimeRef = useRef(0);
  const dragStartRotationRef = useRef(0);

  const [rotation, setRotation] = useState(0);

  // Helpers
  const toRad = (deg) => (deg * Math.PI) / 180;
  const normalizeDeg = (deg) => ((deg % 360) + 360) % 360;
  const shortestDelta = (to, from) => ((to - from + 180) % 360) - 180;

  useEffect(() => {
    onAngleChange?.(normalizeDeg(rotation));
  }, [rotation, onAngleChange]);

  const getPointerAngle = (e) => {
    const { x, y } = centerRef.current;
    const angle = (Math.atan2(e.clientY - y, e.clientX - x) * 180) / Math.PI;
    return normalizeDeg(angle);
  };

  const startDrag = (e) => {
    e.preventDefault();
    if (!dialRef.current || isSnappingRef.current) return;
    cancelAnimationFrame(animationRef.current);
    const rect = dialRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    isDraggingRef.current = true;
    historyRef.current = [];
    const angle = getPointerAngle(e);
    prevPointerAngleRef.current = angle;
    historyRef.current.push({ time: performance.now(), angle });
    dialRef.current.setPointerCapture(e.pointerId);

    dragStartTimeRef.current = performance.now();
    dragStartRotationRef.current = rotation;
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

  const endDrag = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const dragDuration = performance.now() - dragStartTimeRef.current;
    const rotationDelta = Math.abs(rotation - dragStartRotationRef.current);

    if (dragDuration < 200 && rotationDelta < 3) {
      // CLICK detected
      const nearestIconIndex =
        Math.round((normalizeDeg(-rotation) - 180) / slotAngle) % numIcons;
      const idx = (nearestIconIndex + numIcons) % numIcons;
      onSelect?.(idx);
      snapToNearestIcon();
      return;
    }

    const velocity = computeVelocity();
    velocityRef.current = velocity;
    if (inertia && Math.abs(velocity) > minVelocity) {
      prevTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(inertiaAnimate);
    } else if (snapToNearest) {
      snapToNearestIcon();
    }
  };

  const computeVelocity = () => {
    const arr = historyRef.current;
    if (arr.length < 2) return 0;
    let sumV = 0;
    let count = 0;
    for (let i = 1; i < arr.length; i++) {
      const da = shortestDelta(arr[i].angle, arr[i - 1].angle);
      const dt = (arr[i].time - arr[i - 1].time) / 1000;
      if (dt > 0) {
        sumV += da / dt;
        count++;
      }
    }
    return count > 0 ? sumV / count : 0;
  };

  const inertiaAnimate = (now) => {
    const dt = now - prevTimeRef.current;
    prevTimeRef.current = now;
    const frameRateAdjust = dt / (1000 / 60);
    velocityRef.current *= Math.pow(friction, frameRateAdjust);
    setRotation((prev) => prev + (velocityRef.current * dt) / 1000);
    if (Math.abs(velocityRef.current) > minVelocity) {
      animationRef.current = requestAnimationFrame(inertiaAnimate);
    } else if (snapToNearest) {
      snapToNearestIcon();
    }
  };

  const snapToNearestIcon = () => {
    const current = rotation;
    // Snap so that an icon lands at 180° (south pole)
    let target =
      Math.round((current - 180) / slotAngle) * slotAngle + 180;

    const delta = shortestDelta(target, current);
    target = current + delta;
    if (Math.abs(delta) < 0.01) return;
    startSnapTimeRef.current = performance.now();
    startSnapRotRef.current = current;
    targetSnapRotRef.current = target;
    isSnappingRef.current = true;
    animationRef.current = requestAnimationFrame(snapAnimate);
  };

  const easeOutCubic = (t) => 1 - (1 - t) ** 3;

  const snapAnimate = (now) => {
    const elapsed = now - startSnapTimeRef.current;
    let t = elapsed / 300;
    if (t > 1) t = 1;
    const eased = easeOutCubic(t);
    const newRot =
      startSnapRotRef.current +
      (targetSnapRotRef.current - startSnapRotRef.current) * eased;
    setRotation(newRot);
    if (t < 1) {
      animationRef.current = requestAnimationFrame(snapAnimate);
    } else {
      isSnappingRef.current = false;
      // Trigger selection for south pole
      const idx =
        Math.round((normalizeDeg(-newRot) - 180) / slotAngle) % numIcons;
      onSelect?.((idx + numIcons) % numIcons);
    }
  };

  const diameter = radiusPx * 2;

  return (
    <div
      ref={dialRef}
      className="relative cursor-grab active:cursor-grabbing"
      style={{
        width: `${diameter}px`,
        height: `${diameter}px`,
        touchAction: 'none',
      }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {icons.map((icon, i) => {
        const angDeg = rotation + i * slotAngle;
        const angRad = toRad(angDeg);
        const left = 50 + (radiusPx / diameter) * 100 * Math.sin(angRad);
        const top = 50 - (radiusPx / diameter) * 100 * Math.cos(angRad);

        return (
          <div
            key={i}
            className="absolute z-10 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 text-white text-2xl shadow-lg hover:scale-110 transition-transform duration-150 group"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
            }}
            aria-label={`Select ${iconNames[i]}`}
          >
            <div style={{ transform: `rotate(${rotation}deg)` }}>
              {React.cloneElement(icon, { size: 32 })}
            </div>
            <span className="absolute -bottom-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
              {iconNames[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CircularDial;
