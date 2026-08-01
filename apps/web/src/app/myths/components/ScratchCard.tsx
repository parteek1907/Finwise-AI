import React, { useRef, useEffect, useState } from 'react';
import styles from './ScratchCard.module.css';

interface ScratchCardProps {
  children: React.ReactNode;
  onComplete?: () => void;
  isComplete: boolean;
  onScratchStart?: () => void;
  myth: string;
}

export function ScratchCard({ children, onComplete, isComplete, onScratchStart, myth }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [fading, setFading] = useState(false);
  const [isDone, setIsDone] = useState(isComplete);
  const startedScratching = useRef(false);

  useEffect(() => {
    setIsDone(isComplete);
    setFading(false);
    startedScratching.current = false;
  }, [isComplete]);

  useEffect(() => {
    if (isDone || fading) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.offsetWidth * dpr;
      canvas.height = container.offsetHeight * dpr;
      canvas.style.width = `${container.offsetWidth}px`;
      canvas.style.height = `${container.offsetHeight}px`;
      
      ctx.scale(dpr, dpr);
      fillCanvas(ctx, container.offsetWidth, container.offsetHeight);
    };

    const fillCanvas = (context: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw background
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, width, height);

      // Add a subtle pattern/gradient
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f9fafb');
      gradient.addColorStop(1, '#f3f4f6');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      // Draw border
      context.strokeStyle = '#E5E7EB';
      context.lineWidth = 2;
      context.strokeRect(0, 0, width, height);

      // Draw Badge
      context.fillStyle = '#fefce8';
      context.beginPath();
      context.roundRect(32, 32, 120, 28, 14);
      context.fill();
      context.strokeStyle = 'rgba(202, 138, 4, 0.2)';
      context.stroke();

      context.fillStyle = '#854d0e';
      context.font = 'bold 11px Inter, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('MYTH TO BUST', 92, 46);

      // Draw Myth Text (Word Wrap)
      context.fillStyle = '#111827';
      context.font = '600 32px Inter, serif';
      context.textAlign = 'left';
      context.textBaseline = 'top';
      
      const words = `"${myth}"`.split(' ');
      let line = '';
      let y = 100;
      const maxWidth = width - 64;
      const lineHeight = 42;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, 32, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, 32, y);

      // Draw Helper Text
      context.fillStyle = '#6B7280';
      context.font = '500 14px Inter, sans-serif';
      context.textAlign = 'left';
      context.fillText('👈 Scratch card with mouse/finger to reveal reality', 32, height - 48);
    };

    resizeCanvas();
    // window.addEventListener('resize', resizeCanvas);

    return () => {
      // window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDone, fading]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!startedScratching.current) {
      startedScratching.current = true;
      if (onScratchStart) onScratchStart();
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // Increase brush radius from 40 to 60
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    checkPercentageErased(ctx, canvas);
  };

  const checkPercentageErased = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const totalPixels = data.length / 4;
    let transparentPixels = 0;

    // Check every 32nd pixel for performance
    const step = 32;
    for (let i = 3; i < data.length; i += 4 * step) {
      if (data[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (totalPixels / step)) * 100;

    // Lower threshold from 35 to 15
    if (percentage > 15) {
      setFading(true);
      setTimeout(() => {
        setIsDone(true);
        if (onComplete) onComplete();
      }, 500); // Wait for fade out animation
    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDone || fading) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const pos = getPointerPos(e, canvas);
      scratch(pos.x, pos.y);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isDone || fading) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const pos = getPointerPos(e, canvas);
      scratch(pos.x, pos.y);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {children}
      {!isDone && (
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${fading ? styles.fadeOut : ''}`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      )}
    </div>
  );
}
