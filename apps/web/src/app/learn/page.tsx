"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { Search, Filter, Play, CheckCircle2, Lock, Bookmark, Clock, Award, BookOpen } from 'lucide-react';
import styles from './Learn.module.css';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

const CATEGORIES = ['All', 'Behavior', 'Saving', 'Investing', 'Credit', 'Taxes', 'Retirement'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function LearnPage() {
  const router = useRouter();
  const lessons = useAppStore(state => state.lessons);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLessons = lessons.filter(l => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Progress
  const completedCount = lessons.filter(l => l.status === 'Completed').length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100) || 0;

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Financial Education Library</h1>
              <p className={styles.subtitle}>Master your money through bite-sized behavioral lessons.</p>
            </div>
            
            <div className={styles.progressCard}>
              <div className={styles.progressTop}>
                <span>Overall Mastery</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className={styles.controlsBar}>
            <div className={styles.categories}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  className={`${styles.categoryBtn} ${activeCategory === cat ? styles.activeCategory : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.searchActions}>
              <div className={styles.searchBox}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search lessons..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className={styles.filterBtn}>
                <Filter size={16} /> Filters
              </button>
            </div>
          </div>
        </header>

        {/* Lessons Grid */}
        <motion.div className={styles.grid} variants={containerVariants} initial="hidden" animate="show">
          {filteredLessons.map(lesson => (
            <motion.div key={lesson.id} variants={itemVariants} className={styles.lessonCard}>
              <div className={styles.cardThumbnail}>
                <div className={styles.thumbnailOverlay}>
                  {lesson.status === 'Completed' && <CheckCircle2 className={styles.statusIcon} color="#22c55e" />}
                  {lesson.status === 'Locked' && <Lock className={styles.statusIcon} color="#9ca3af" />}
                </div>
                {/* Simulated image gradient based on category */}
                <div className={styles.thumbnailBg} style={{
                  background: lesson.category === 'Behavior' ? 'linear-gradient(135deg, #1e1b4b, #4338ca)' :
                             lesson.category === 'Saving' ? 'linear-gradient(135deg, #14532d, #16a34a)' :
                             'linear-gradient(135deg, #451a03, #d97706)'
                }}>
                  <BookOpen size={48} opacity={0.2} color="white" />
                </div>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardMeta}>
                  <span className={styles.categoryBadge}>{lesson.category}</span>
                  <span className={`${styles.difficultyBadge} ${styles[lesson.difficulty]}`}>{lesson.difficulty}</span>
                </div>
                
                <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                
                <div className={styles.lessonStats}>
                  <div className={styles.stat}><Clock size={14} /> {lesson.duration}</div>
                  <div className={styles.stat}><Award size={14} /> {lesson.xp} XP</div>
                </div>

                <div className={styles.cardActions}>
                  <button 
                    className={`${styles.actionBtn} ${lesson.status === 'Completed' ? styles.btnSecondary : lesson.status === 'Locked' ? styles.btnDisabled : styles.btnPrimary}`}
                    onClick={() => lesson.status !== 'Locked' && router.push(`/learn/${lesson.id}`)}
                    disabled={lesson.status === 'Locked'}
                  >
                    {lesson.status === 'Completed' ? 'Review Lesson' : lesson.status === 'Locked' ? 'Locked' : 'Start Lesson'}
                  </button>
                  <button className={styles.bookmarkBtn} title="Bookmark">
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredLessons.length === 0 && (
          <div className={styles.emptyState}>
            <Search size={48} opacity={0.2} />
            <h3>No lessons found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
