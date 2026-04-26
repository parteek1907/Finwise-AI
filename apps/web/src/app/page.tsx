import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { ArrowRight, Lock, BrainCircuit, LineChart, MessageSquare } from 'lucide-react';
import styles from '@/components/landing/Landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.pageWrapper}>
      <Hero />
      
      {/* Light Section: The Problem */}
      <section id="problem" className={`${styles.section} ${styles.lightSection}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <Pill label="The Challenge" />
            <h2 className="display-text">Built for the Modern Economy.</h2>
            <p className={styles.sectionLead}>
              Traditional financial advice ignores behavioral psychology. We focus on why you make decisions, not just what decisions to make.
            </p>
          </div>
          
          <div className={styles.grid3}>
            <div className={styles.featureCard}>
              <BrainCircuit size={32} className={styles.featureIcon} />
              <h3>Behavioral Psychology</h3>
              <p>Understand your money triggers, emotional spending, and lifestyle creep before they become problems.</p>
            </div>
            <div className={styles.featureCard}>
              <Lock size={32} className={styles.featureIcon} />
              <h3>Scam Detection</h3>
              <p>Protect your assets with real-time AI analysis of suspicious messages and investment opportunities.</p>
            </div>
            <div className={styles.featureCard}>
              <LineChart size={32} className={styles.featureIcon} />
              <h3>Goal Tracking</h3>
              <p>Stop using generic progress bars. We build dynamic milestones that adapt to your real life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Section: AI Mentor */}
      <section id="demo" className={`${styles.section} dark-section`}>
        <div className={styles.container}>
          <div className={styles.splitLayout}>
            <div className={styles.splitContent}>
              <Pill label="AI Mentor" />
              <h2 className="display-text">Trade Smarter.<br/>Grow Faster.</h2>
              <p className={styles.sectionLead}>
                Access a personalized financial advisor available 24/7. Your mentor understands your archetype, your goals, and your past lessons.
              </p>
              
              <ul className={styles.benefitList}>
                <li><ArrowRight size={16}/> Personalized financial insights</li>
                <li><ArrowRight size={16}/> Judgment-free environment</li>
                <li><ArrowRight size={16}/> Instant strategy adjustments</li>
              </ul>
              
              <Button size="lg" variant="primary" style={{marginTop: '2rem'}}>Meet Your Mentor</Button>
            </div>
            <div className={styles.splitVisual}>
              <div className={styles.visualPlaceholder}>
                <MessageSquare size={64} opacity={0.2} />
                <span>Interactive Mentor UI Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Light Section: Final CTA */}
      <section className={`${styles.section} ${styles.lightSection} ${styles.centeredSection}`}>
        <div className={styles.container}>
          <h2 className="display-text">A Solid Choice for Confident Growth</h2>
          <p className={styles.sectionLead}>
            Reliability and value embedded in everything we build.
          </p>
          <div className={styles.ctaActions}>
            <Button size="lg" variant="primary">Open Account</Button>
            <Button size="lg" variant="outline">Learn More About Us <ArrowRight size={16}/></Button>
          </div>
        </div>
      </section>
      
      {/* Minimal Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}></span>
              FinWise
            </div>
            <div className={styles.footerLinks}>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 FinWise AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
