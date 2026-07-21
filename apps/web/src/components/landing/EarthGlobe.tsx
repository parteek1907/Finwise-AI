"use client";

import React, { useEffect, useRef, useCallback } from "react";

/*
 * EarthGlobe — renders a world map silhouette using tiny financial characters
 * Continents = bright green chars | Oceans = ultra-dim dots
 * Technique: sample a pixel-map of the Earth, draw chars at each sample point
 */

// Simplified world land-mass pixel map (320×160 grid, 0 = ocean, 1 = land)
// Generated from a well-known simplified mercator land mask
const LAND_MASK_W = 320;
const LAND_MASK_H = 160;

function isLand(nx: number, ny: number): boolean {
  // nx, ny in [0,1]. Returns true if the point is approximately land.
  const lon = nx * 360 - 180; // -180 to 180
  const lat = ny * 180 - 90;  // -90 to 90 (0=top = North pole)
  const adjustedLat = 90 - lat * (180 / Math.PI) * (Math.PI / 180); // remap
  
  // Simplified land polygons (major continents approximated as regions)
  // Returns true if coordinate falls on land

  // North America
  if (lon >= -168 && lon <= -52 && lat >= 25 && lat <= 72) {
    if (lon >= -168 && lon <= -140 && lat >= 55 && lat <= 72) return true; // Alaska
    if (lon >= -130 && lon <= -52 && lat >= 25 && lat <= 72) return true;
    if (lon >= -110 && lon <= -82 && lat >= 15 && lat <= 32) return true; // Mexico/Central
  }
  // Caribbean / Central America extra
  if (lon >= -92 && lon <= -60 && lat >= 7 && lat <= 22) return true;
  // Greenland
  if (lon >= -58 && lon <= -15 && lat >= 59 && lat <= 84) return true;

  // South America
  if (lon >= -82 && lon <= -34 && lat >= -56 && lat <= 12) return true;

  // Europe
  if (lon >= -10 && lon <= 32 && lat >= 36 && lat <= 70) return true;
  // Scandinavia
  if (lon >= 5 && lon <= 30 && lat >= 57 && lat <= 71) return true;
  // British Isles
  if (lon >= -8 && lon <= 2 && lat >= 50 && lat <= 59) return true;
  // Iberian peninsula
  if (lon >= -9 && lon <= 3 && lat >= 36 && lat <= 43) return true;

  // Africa
  if (lon >= -18 && lon <= 51 && lat >= -35 && lat <= 37) return true;

  // Middle East / Arabian Peninsula
  if (lon >= 35 && lon <= 60 && lat >= 12 && lat <= 38) return true;

  // Asia main
  if (lon >= 26 && lon <= 145 && lat >= 0 && lat <= 72) {
    // Exclude large ocean bodies
    if (lon >= 26 && lon <= 145 && lat >= 15 && lat <= 72) return true;
    if (lon >= 95 && lon <= 145 && lat >= 0 && lat <= 22) return true;
    if (lon >= 72 && lon <= 100 && lat >= 8 && lat <= 25) return true; // India+SE Asia
  }
  // Japan
  if (lon >= 130 && lon <= 145 && lat >= 30 && lat <= 45) return true;
  // Sri Lanka / Indonesia
  if (lon >= 95 && lon <= 142 && lat >= -10 && lat <= 8) return true;

  // Russia / Siberia
  if (lon >= 30 && lon <= 180 && lat >= 50 && lat <= 75) return true;
  if (lon >= -180 && lon <= -160 && lat >= 55 && lat <= 72) return true; // Far East Russia

  // Australia
  if (lon >= 113 && lon <= 154 && lat >= -40 && lat <= -10) return true;
  // New Zealand
  if (lon >= 165 && lon <= 178 && lat >= -47 && lat <= -34) return true;

  return false;
}

export function EarthGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const CHARS = ["$", "₹", "€", "£", "¥", "%", "0", "1", "∑", "∞", "►", "◆", "·", "·", "·"];
  const FINANCIAL_CHARS = ["$", "₹", "€", "£", "%", "+", "−", "×", "0", "1", "8", "∑"];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const t = timeRef.current;

    ctx.clearRect(0, 0, W, H);

    // === Earth Globe ===
    const FONT_SIZE = 10;
    const COL_STEP = 10;  // px between columns
    const ROW_STEP = 12;  // px between rows

    const globeR = Math.max(W, H) * 0.65; // wider globe
    const globeCX = W * 0.5;
    const globeCY = H * 0.95; // pushed down so only top half is visible

    // Draw globe character grid
    for (let py = globeCY - globeR; py <= globeCY + globeR; py += ROW_STEP) {
      for (let px = globeCX - globeR; px <= globeCX + globeR; px += COL_STEP) {
        const dx = px - globeCX;
        const dy = py - globeCY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > globeR) continue; // outside sphere

        // Map canvas position to globe lon/lat using sphere projection
        const sinLat = dy / globeR;
        const lat = Math.asin(Math.max(-1, Math.min(1, sinLat))) * (180 / Math.PI);
        const cosLat = Math.cos(lat * Math.PI / 180);
        const normalizedX = cosLat === 0 ? 0 : dx / (globeR * cosLat);
        const lon = Math.asin(Math.max(-1, Math.min(1, normalizedX))) * (180 / Math.PI);

        // Rotate: add time offset for subtle drift feel
        const rotLon = lon + (Math.sin(t * 0.0003) * 5);

        const nx = (rotLon + 180) / 360;
        const ny = (90 - lat) / 180;

        const land = isLand(nx, ny);

        // Edge fade factor (chars near edge of sphere are dimmer)
        const edgeFactor = 1 - Math.pow(dist / globeR, 2.2);

        // Wave shimmer across the globe
        const wave = Math.sin(px * 0.04 + py * 0.03 + t * 0.0008) * 0.5 + 0.5;
        const wave2 = Math.sin(px * 0.02 - py * 0.025 + t * 0.0005) * 0.5 + 0.5;

        if (land) {
          // Continent characters — white/silver for premium dark theme
          const charIdx = Math.floor((px * 3.7 + py * 2.3 + t * 0.001) % FINANCIAL_CHARS.length);
          const char = FINANCIAL_CHARS[Math.abs(Math.floor(charIdx))];

          const brightness = 0.4 + wave * 0.4 + wave2 * 0.2;
          const alpha = edgeFactor * brightness;

          // White/silver text with slight green/gold tint on waves
          const r = Math.floor(200 + wave2 * 55);
          const g = Math.floor(220 + wave * 35);
          const b = Math.floor(210 + wave2 * 45);
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
          ctx.font = `${FONT_SIZE}px monospace`;
          ctx.fillText(char, px, py);
        } else {
          // Ocean — tiny dots, very dim grey
          if (Math.floor((px / COL_STEP + py / ROW_STEP)) % 3 === 0) {
            const alpha = edgeFactor * 0.05;
            ctx.fillStyle = `rgba(200, 220, 210, ${alpha.toFixed(2)})`;
            ctx.font = `${FONT_SIZE - 4}px monospace`;
            ctx.fillText("·", px, py);
          }
        }
      }
    }

    // === Atmosphere glow (radial gradient ring) ===
    const atmoGrad = ctx.createRadialGradient(globeCX, globeCY, globeR * 0.85, globeCX, globeCY, globeR * 1.15);
    atmoGrad.addColorStop(0, "rgba(255, 255, 255, 0.0)");
    atmoGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.03)");
    atmoGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    ctx.beginPath();
    ctx.arc(globeCX, globeCY, globeR * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = atmoGrad;
    ctx.fill();

    // === Latitude lines (very subtle) ===
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 0.5;
    for (let latLine = -60; latLine <= 60; latLine += 30) {
      const yLine = globeCY + (latLine / 90) * globeR;
      const halfW = Math.sqrt(Math.max(0, globeR * globeR - (yLine - globeCY) * (yLine - globeCY)));
      ctx.beginPath();
      ctx.ellipse(globeCX, yLine, halfW, halfW * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // === Vertical scan line shimmer ===
    const scanX = globeCX - globeR + ((t * 0.05) % (globeR * 2));
    if (scanX > globeCX - globeR && scanX < globeCX + globeR) {
      const scanGrad = ctx.createLinearGradient(scanX - 20, 0, scanX + 20, 0);
      scanGrad.addColorStop(0, "rgba(255,255,255,0)");
      scanGrad.addColorStop(0.5, "rgba(255,255,255,0.03)");
      scanGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 20, globeCY - globeR, 40, globeR * 2);
    }

    timeRef.current += 1;
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    setSize();
    const ro = new ResizeObserver(setSize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
      aria-hidden
    />
  );
}
