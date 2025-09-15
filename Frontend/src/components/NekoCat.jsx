// NekoCat.jsx
import React, { useEffect, useRef } from "react";
import { Neko, NekoSizeVariations } from "neko-ts";

const NekoCat = () => {
  const nekoRef = useRef(null);

  useEffect(() => {
    if (!nekoRef.current) {
      nekoRef.current = new Neko({
        nekoSize: NekoSizeVariations.LARGE, // SMALL, MEDIUM, LARGE
        speed: 10,
        origin: { x: 100, y: 100 }, // initial position
        parent: document.body,       // attach cat to body
      });
    }

    // Cleanup on unmount
    return () => {
      if (nekoRef.current) {
        nekoRef.current.destroy();
        nekoRef.current = null;
      }
    };
  }, []);

  return null; // No JSX needed; Neko appends directly to DOM
};

export default NekoCat;
