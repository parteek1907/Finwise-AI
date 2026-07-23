"use client";
import React from 'react';
import { BookOpen, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal } from './ScrollAnimations';

export function Resources() {
  return (
    <section className={styles.resourcesSection} id="resources">
      <ScrollReveal>
        <div className={styles.resourcesContainer}>
          {/* Featured Article */}
          <div className={styles.featuredArticle}>
            <div style={{
              width: '100%',
              height: '280px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img 
                src="/featured-guide-cover.png" 
                alt="Minimizing Risk in Personal Finance"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className={styles.featuredArticleContent}>
              <span className={styles.featuredArticleTag}>Financial Literacy</span>
              <h3 className={styles.featuredArticleTitle}>
                Minimizing Risk in Personal Finance: Essential Strategies for Beginners
              </h3>
              <p className={styles.featuredArticleDesc}>
                Personal finance can be volatile, but with the right risk management strategies, you can
                protect your savings and build wealth steadily. From setting clear goals to
                diversifying your portfolio, these essential strategies can help you
                navigate financial decisions with confidence.
              </p>
            </div>
          </div>

          {/* Sidebar Articles */}
          <div className={styles.articlesSidebar}>
            <div className={styles.articleSidebarCard}>
              <div className={styles.articleSidebarIcon}>
                <GraduationCap size={20} />
              </div>
              <div className={styles.articleSidebarContent}>
                <span className={styles.articleSidebarTag}>Tutorial</span>
                <h4 className={styles.articleSidebarTitle}>Understanding Your Money Personality</h4>
                <p className={styles.articleSidebarDesc}>
                  Learn how your financial archetype shapes every money decision you make.
                </p>
                <span className={styles.seeAllLink}>Read More <ArrowRight size={12} /></span>
              </div>
            </div>

            <div className={styles.articleSidebarCard}>
              <div className={styles.articleSidebarIcon}>
                <ShieldCheck size={20} />
              </div>
              <div className={styles.articleSidebarContent}>
                <span className={styles.articleSidebarTag}>Safety Guide</span>
                <h4 className={styles.articleSidebarTitle}>How to Spot Financial Scams</h4>
                <p className={styles.articleSidebarDesc}>
                  Our AI-powered scam detector breaks down the anatomy of modern financial fraud.
                </p>
                <span className={styles.seeAllLink}>Read More <ArrowRight size={12} /></span>
              </div>
            </div>

            <div className={styles.articleSidebarCard}>
              <div className={styles.articleSidebarIcon}>
                <BookOpen size={20} />
              </div>
              <div className={styles.articleSidebarContent}>
                <span className={styles.articleSidebarTag}>Articles</span>
                <h4 className={styles.articleSidebarTitle}>Mastering Budgeting with AI</h4>
                <p className={styles.articleSidebarDesc}>
                  Step-by-step guide to budgeting, saving, and investing with AI-powered tools.
                </p>
                <span className={styles.seeAllLink}>See All <ArrowRight size={12} /></span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
