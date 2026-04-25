"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { TreeOfWealth } from '@/components/3d/TreeOfWealth';
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { ArrowRight, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import styles from './Landing.module.css';

export function Hero() {
  return (
    <section className={`${styles.section} ${styles.heroSection} dark-section`}>
      <div className={styles.container}>
        
        {/* Navigation - Built into Hero for seamless Dark theme blending */}
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}></span>
            FinWise
          </div>
          <div className={styles.navLinks}>
            <Link href="#problem">The Problem</Link>
            <Link href="#demo">How it Works</Link>
            <Link href="#pricing">Pricing</Link>
          </div>
          <div className={styles.navActions}>
            <Link href="/auth">Log In</Link>
            <Link href="/dashboard">
              <Button size="sm" variant="primary">Start Learning</Button>
            </Link>
          </div>
        </nav>

        <div className={styles.heroContent}>
          {/* Left: Copy */}
          <div className={styles.heroLeft}>
            <Pill label="The Future of Financial Literacy" />
            <h1 className={styles.heroTitle}>
              Your Gateway to Financial Independence
            </h1>
            <p className={styles.heroSubtitle}>
              Master your money with AI-driven insights, behavioral psychology, and institutional-grade financial education.
            </p>
            <div className={styles.heroActions}>
              <Link href="/dashboard">
                <Button size="lg" variant="primary">Start Your Journey</Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="secondary" icon={<ArrowRight size={18} />}>Explore the Platform</Button>
              </Link>
            </div>
            
            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <ShieldCheck size={20} />
                <span>Bank-level Security</span>
              </div>
              <div className={styles.trustItem}>
                <Target size={20} />
                <span>Personalized Paths</span>
              </div>
            </div>
          </div>

          {/* Right: UI Preview & 3D */}
          <div className={styles.heroRight}>
            <div className={styles.mockupContainer}>
              {/* Product UI Mockup */}
              <div className={styles.mockupCard}>
                <div className={styles.mockupHeader}>
                  <div className={styles.mockupDots}>
                    <span></span><span></span><span></span>
                  </div>
                  <span className={styles.mockupTitle}>Dashboard</span>
                </div>
                <div className={styles.mockupBody}>
                  <div className={styles.mockupStatRow}>
                    <div className={styles.mockupStat}>
                      <span className={styles.mockupLabel}>Health Score</span>
                      <span className={styles.mockupValue}>85</span>
                    </div>
                    <div className={styles.mockupStat}>
                      <span className={styles.mockupLabel}>Net Worth</span>
                      <span className={styles.mockupValue}>$42k</span>
                    </div>
                  </div>
                  <div className={styles.mockupChart}>
                    <div className={styles.mockupLine}></div>
                    <TrendingUp size={24} className={styles.mockupTrend} />
                  </div>
                </div>
              </div>
              
              {/* 3D Element overlapping */}
              <div className={styles.hero3D}>
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Environment preset="city" />
                  <ambientLight intensity={0.5} />
                  <TreeOfWealth growthStage={100} />
                </Canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Curved separation (abstracted with CSS pseudo-element in module) */}
      <div className={styles.heroBottomCurve}></div>
    </section>
  );
}
