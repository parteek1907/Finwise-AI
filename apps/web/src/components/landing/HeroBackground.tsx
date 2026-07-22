"use client";
import React, { useState, useEffect } from 'react';
import styles from './Landing.module.css';

interface Point {
  x: number;
  y: number;
}

export function HeroBackground() {
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to range [-1, 1]
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax offsets (max movement in pixels)
  const curveParallax = `translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`;
  const meshParallax = `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`;
  
  return (
    <div className={styles.heroBackground}>
      {/* Layer 1: Paper Texture */}
      <div className={`${styles.parallaxLayer} ${styles.paperTexture}`} />

      {/* Layer 2: Thin Financial Grid */}
      <div className={`${styles.parallaxLayer} ${styles.financialGrid}`} />

      {/* Layer 4: Floating Candlesticks (Sides Only) */}
      {/* Left Candlesticks */}
      <div 
        className={styles.parallaxLayer}
        style={{
          opacity: 0.15,
          left: '5%',
          width: '200px',
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
          transform: `translate3d(${mousePos.x * -4}px, ${mousePos.y * -4}px, 0)`
        }}
      >
        <svg width="20" height="100" viewBox="0 0 20 100">
          <rect x="9" y="10" width="2" height="70" fill="#8A9080" />
          <rect className={`${styles.candleBody} ${styles.animBody1}`} x="5" y="35" width="10" height="15" fill="#8A9080" />
        </svg>
        <svg width="20" height="120" viewBox="0 0 20 120" style={{ marginTop: '40px' }}>
          <rect x="9" y="15" width="2" height="90" fill="#8A9080" />
          <rect className={`${styles.candleBody} ${styles.animBody2}`} x="5" y="45" width="10" height="20" fill="#8A9080" />
        </svg>
        <svg width="20" height="80" viewBox="0 0 20 80" style={{ marginTop: '-30px' }}>
          <rect x="9" y="5" width="2" height="60" fill="#8A9080" />
          <rect className={`${styles.candleBody} ${styles.animBody3}`} x="5" y="25" width="10" height="12" fill="#8A9080" />
        </svg>
      </div>

      {/* Right Candlesticks */}
      <div 
        className={styles.parallaxLayer}
        style={{
          opacity: 0.15,
          left: 'auto',
          right: '5%',
          width: '200px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '30px',
          alignItems: 'center',
          transform: `translate3d(${mousePos.x * 5}px, ${mousePos.y * 5}px, 0)`
        }}
      >
        <svg width="20" height="90" viewBox="0 0 20 90" style={{ marginTop: '-20px' }}>
          <rect x="9" y="10" width="2" height="70" fill="#8A9080" />
          <rect className={`${styles.candleBody} ${styles.animBody4}`} x="5" y="40" width="10" height="15" fill="#8A9080" />
        </svg>
        <svg width="20" height="130" viewBox="0 0 20 130" style={{ marginTop: '30px' }}>
          <rect x="9" y="20" width="2" height="100" fill="#8A9080" />
          <rect className={`${styles.candleBody} ${styles.animBody5}`} x="5" y="60" width="10" height="18" fill="#8A9080" />
        </svg>
        <svg width="20" height="70" viewBox="0 0 20 70">
          <rect x="9" y="5" width="2" height="50" fill="#8A9080" />
          <rect className={`${styles.candleBody} ${styles.animBody6}`} x="5" y="25" width="10" height="10" fill="#8A9080" />
        </svg>
      </div>

      {/* Layer 5: Data Mesh */}
      <div 
        className={`${styles.parallaxLayer} ${styles.dataMesh}`} 
        style={{ transform: meshParallax }}
      />

      {/* Layer 3: Faded Portfolio Curve */}
      <div 
        className={styles.parallaxLayer}
        style={{ transform: curveParallax, zIndex: 0 }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 1000 300" 
          preserveAspectRatio="none"
          style={{ opacity: 0.12 }}
        >
          <path 
            d="M0,250 C150,230 250,280 400,200 C500,150 600,220 750,100 C850,20 950,80 1000,0" 
            fill="none" 
            stroke="#8A9080" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        </svg>
      </div>

    </div>
  );
}
