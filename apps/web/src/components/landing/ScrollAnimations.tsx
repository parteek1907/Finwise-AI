"use client";

import React, { useEffect, useRef, ReactNode, useState, useCallback } from "react";
import Lenis from "lenis";

/* ─── Smooth Scroll Provider ─── */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      infinite: false,
    });
    
    // Expose lenis globally for imperative smooth scrolling using a private key to avoid conflicts
    (window as any).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return <>{children}</>;
}

/* ─── Scroll-Linked Parallax ─── */
interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  style?: React.CSSProperties;
}

export function ParallaxSection({ children, className, speed = 0.1, style }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        const center = rect.top + rect.height / 2 - viewH / 2;
        const offset = center * speed * -1;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{
      willChange: "transform",
      transition: "transform 150ms linear",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Scroll Reveal (buttery smooth with CSS transition interpolation) ─── */
interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 60,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const locked = useRef(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el || (once && locked.current)) return;

    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;

    // Start revealing when top enters bottom 92% of viewport
    // Complete reveal over a tall scroll distance for gradual feel
    const start = viewH * 0.92;
    const end = viewH * 0.35;
    const raw = (start - rect.top) / (start - end);
    const clamped = Math.max(0, Math.min(1, raw));

    if (clamped >= 1 && once) locked.current = true;
    setProgress(clamped);
  }, [once]);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(update, 50 + delay);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [update, delay]);

  // Smooth cubic ease-out
  const eased = 1 - Math.pow(1 - progress, 4);

  const getTranslate = () => {
    const remaining = distance * (1 - eased);
    switch (direction) {
      case "up": return `translate3d(0, ${remaining}px, 0)`;
      case "left": return `translate3d(${-remaining}px, 0, 0)`;
      case "right": return `translate3d(${remaining}px, 0, 0)`;
      case "none": return "translate3d(0, 0, 0)";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: eased,
        transform: getTranslate(),
        // THIS is the key to buttery smoothness: CSS transition interpolates
        // between each JS-computed frame, eliminating all jumpiness
        transition: "opacity 180ms ease-out, transform 180ms ease-out",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Stagger Reveal ─── */
interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerReveal({
  children,
  className = "",
  staggerDelay = 80,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const locked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (locked.current) return;
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        const start = viewH * 0.92;
        const end = viewH * 0.3;
        const raw = (start - rect.top) / (start - end);
        const clamped = Math.max(0, Math.min(1, raw));
        if (clamped >= 1) locked.current = true;
        setProgress(clamped);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(onScroll, 50);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const totalChildren = React.Children.count(children);

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => {
        // Each child's progress is offset so they cascade
        const childOffset = (index / totalChildren) * 0.4;
        const childProgress = Math.max(0, Math.min(1, (progress - childOffset) / 0.6));
        const eased = 1 - Math.pow(1 - childProgress, 4);

        return (
          <div
            style={{
              opacity: eased,
              transform: `translate3d(0, ${40 * (1 - eased)}px, 0)`,
              transition: "opacity 200ms ease-out, transform 200ms ease-out",
              willChange: "opacity, transform",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Scroll Scale (elements zoom into focus) ─── */
interface ScrollScaleProps {
  children: ReactNode;
  className?: string;
  scaleFrom?: number;
  style?: React.CSSProperties;
}

export function ScrollScale({ children, className, scaleFrom = 0.92, style }: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const locked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (locked.current) return;
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        const raw = (viewH * 0.9 - rect.top) / (viewH * 0.45);
        const clamped = Math.max(0, Math.min(1, raw));
        if (clamped >= 1) locked.current = true;
        setProgress(clamped);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(onScroll, 50);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const eased = 1 - Math.pow(1 - progress, 4);
  const scale = scaleFrom + (1 - scaleFrom) * eased;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `scale(${scale})`,
        opacity: 0.2 + 0.8 * eased,
        transition: "transform 200ms ease-out, opacity 200ms ease-out",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
