import React from 'react';

export function HeroPattern() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="2" height="6" fill="rgba(255, 255, 255, 0.15)" rx="1"/>
        </pattern>
        <radialGradient id="mountainMask" cx="50%" cy="100%" r="50%" fx="50%" fy="100%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="60%" stopColor="white" stopOpacity="0.8" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Base patterned rect covering everything */}
      <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" mask="url(#mountainMask)" />
      
      {/* 
        To make it look like a "mountain" of data as in the image, we use the mask above.
        The radial gradient creates a semi-circular / triangular mountain shape growing from the bottom center.
      */}
    </svg>
  );
}
