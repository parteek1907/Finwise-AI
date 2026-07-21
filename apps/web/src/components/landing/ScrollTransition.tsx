"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollTransitionProps {
  heroContent: ReactNode;
  darkContent: ReactNode;
}

/**
 * Premium scroll transition:
 * - Hero is pinned / sticky at the top
 * - As user scrolls, the dark content panel slides UP over the hero
 * - The hero subtly compresses as the dark panel covers it
 * - Smooth quintic ease-out for buttery feel
 */
export function ScrollTransition({ heroContent, darkContent }: ScrollTransitionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(100);
  const [heroScale, setHeroScale] = useState(1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const SCROLL_ZONE = window.innerHeight * 1.1;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const raw = Math.max(0, Math.min(1, scrollY / SCROLL_ZONE));

        // Quintic ease-out for premium smoothness
        const eased = 1 - Math.pow(1 - raw, 5);

        // Dark panel rises from 100vh below to 0
        setTranslateY((1 - eased) * 100);

        // Hero subtly scales down as it gets covered
        setHeroScale(1 - eased * 0.04);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>

      {/* ── HERO (sticky) ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <div
          ref={heroRef}
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${heroScale})`,
            transformOrigin: "center center",
            transition: "transform 80ms linear",
            willChange: "transform",
          }}
        >
          {heroContent}
        </div>
      </div>

      {/* ── Scroll spacer creates scroll distance for the transition ── */}
      <div style={{ height: "110vh", position: "relative", zIndex: 0 }} />

      {/* ── Dark content panel rises from below over the hero ── */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          marginTop: `-110vh`,
          transform: `translateY(${translateY}vh)`,
          transition: "transform 100ms linear",
          willChange: "transform",
          borderRadius: "48px 48px 0 0",
          overflow: "hidden",
        }}
      >
        {darkContent}
      </div>
    </div>
  );
}


