"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export function MarketChart() {
  // Generate mock price data (random walk)
  const data = useMemo(() => {
    let currentPrice = 100;
    const points = [];
    for (let i = 0; i < 50; i++) {
      points.push(currentPrice);
      currentPrice += (Math.random() - 0.45) * 5; // Slight upward bias
    }
    return points;
  }, []);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  // Map data to SVG coordinates (0-1000 width, 0-400 height)
  const width = 1000;
  const height = 400;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 40) - 20; // 20px padding top/bottom
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  // For the gradient fill below the line
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = isPositive ? "#2BAE66" : "#D95C5C"; // Success or Danger

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-3xl bg-surface-elevated border border-border p-6 overflow-hidden flex flex-col">
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted font-medium mb-1">FWZ Index</h2>
          <div className="text-4xl font-heading font-medium text-foreground">
            ${data[data.length - 1].toFixed(2)}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${isPositive ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
          {isPositive ? "+" : ""}{((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(2)}%
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-[0_0_15px_rgba(43,174,102,0.2)]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Area Fill */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            d={areaD}
            fill="url(#gradientFill)"
          />
          
          {/* Line Stroke */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Vertical and Horizontal Grid Lines (Decorative) */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full border-t border-b border-foreground flex justify-between">
             <div className="h-full border-r border-foreground w-1/4"></div>
             <div className="h-full border-r border-foreground w-1/4"></div>
             <div className="h-full border-r border-foreground w-1/4"></div>
             <div className="h-full w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
