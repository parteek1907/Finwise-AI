"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { Search, Filter, Play, CheckCircle2, Lock, Bookmark, Clock, Award, BookOpen, X, ChevronRight, GraduationCap } from 'lucide-react';
import styles from './Learn.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Lesson } from '@/store/useAppStore';
import { Certificate } from '@/components/learn/Certificate';
import { Tabs } from '@/components/ui/vercel-tabs';

const getLessonImage = (lessonId: string) => {
  // We now map by lesson ID to ensure every single course has a unique, beautifully generated 3D vector image!
  return `/courses/course_${lessonId}.png`;
};

const CATEGORIES = ['All', 'Behavior', 'Saving', 'Investing', 'Credit', 'Taxes', 'Retirement'];

export default function LearnPage() {
  const router = useRouter();
  const lessons = useAppStore(state => state.lessons);
  const user = useAppStore(state => state.user);
  const courseProgressMap = useAppStore(state => state.courseProgress);
  const finalExamState = useAppStore(state => state.finalExamState);
  
  const [viewMode, setViewMode] = useState<'lessons' | 'certificates'>('lessons');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  
  // State for viewing a specific certificate
  const [selectedCertLesson, setSelectedCertLesson] = useState<Lesson | null>(null);

  const filteredLessons = lessons.filter(l => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' 
                       || l.status === filterStatus 
                       || l.difficulty === filterStatus;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const completedLessons = lessons.filter(l => l.status === 'Completed');
  const progressPercent = Math.round((completedLessons.length / lessons.length) * 100) || 0;
  const allLessonsCompleted = completedLessons.length === lessons.length && lessons.length > 0;
  const examStatus = allLessonsCompleted 
    ? (finalExamState.status === 'Locked' ? 'Available' : finalExamState.status) 
    : 'Locked';

  // Find the most recently accessed lesson that is "In Progress"
  const recentProgress = Object.values(courseProgressMap)
    .filter(p => p.status === 'In Progress')
    .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())[0];

  const recentLesson = recentProgress ? lessons.find(l => l.id === recentProgress.lessonId) : null;

  const tabOptions = [
    ...CATEGORIES.map(cat => ({ id: cat, label: cat })),
    { id: 'Certificates', label: 'My Certificates' }
  ];

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Header Section */}
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerTop}>
            <div className={styles.titleWrap}>
              <div className={styles.iconBox}>
                <BookOpen size={28} color="#19533B" />
              </div>
              <div>
                <h1 className={styles.title}>Financial Education Library</h1>
                <p className={styles.subtitle}>Master your money through bite-sized behavioral lessons.</p>
              </div>
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
            <div className={styles.categories} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2px' }}>
              <Tabs 
                tabs={tabOptions}
                activeTab={viewMode === 'certificates' ? 'Certificates' : activeCategory}
                onTabChange={(tab) => {
                  if (tab === 'Certificates') {
                    setViewMode('certificates');
                  } else {
                    setViewMode('lessons');
                    setActiveCategory(tab);
                  }
                }}
              />
            </div>

            {viewMode === 'lessons' && (
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
                <div style={{ position: 'relative' }}>
                  <button 
                    className={styles.filterBtn} 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <Filter size={16} /> Filters
                  </button>
                  {showFilterDropdown && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', zIndex: 10, minWidth: '150px', overflow: 'hidden' }}>
                      {['All', 'Completed', 'In Progress', 'Locked', 'Easy', 'Medium', 'Hard'].map(status => (
                        <button 
                          key={status}
                          style={{ display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left', background: filterStatus === status ? '#F3F4F6' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: filterStatus === status ? '#19533B' : '#4B5563', fontWeight: filterStatus === status ? 500 : 400 }}
                          onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.header>

        {/* Content Section */}
        {viewMode === 'lessons' ? (
          <>
            <motion.div 
              className={styles.grid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {filteredLessons.map((lesson, idx) => (
                <motion.div 
                  key={lesson.id} 
                  className={styles.lessonCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + (idx * 0.05), ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={styles.cardThumbnail}>
                    <div className={styles.thumbnailOverlay}>
                      {lesson.status === 'Completed' && <CheckCircle2 className={styles.statusIcon} color="#22c55e" />}
                      {lesson.status === 'Locked' && <Lock className={styles.statusIcon} color="#9ca3af" />}
                      {lesson.status !== 'Completed' && lesson.status !== 'Locked' && <Play className={styles.statusIcon} color="#3b82f6" fill="#3b82f6" style={{ marginLeft: '2px', width: '16px', height: '16px' }} />}
                    </div>
                    <img 
                      src={getLessonImage(lesson.id)} 
                      alt={lesson.title}
                      style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                    />
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
                        {lesson.status === 'Completed' ? 'Review Lesson' : lesson.status === 'Locked' ? 'Locked - Complete previous to unlock' : 'Start Lesson'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* FINAL ASSESSMENT CARD */}
              {(activeCategory === 'All' || activeCategory === 'Assessment') && (
                <motion.div 
                  className={styles.lessonCard} 
                  style={{ opacity: finalExamState.status === 'Locked' ? 0.7 : 1, border: finalExamState.status !== 'Locked' ? '2px solid #10b981' : undefined }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + (filteredLessons.length * 0.05) }}
                >
                  <div className={styles.cardThumbnail}>
                     <img 
                       src="/courses/course_exam.png" 
                       alt="Final Assessment"
                       style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                     />
                     {examStatus === 'Locked' && <div className={styles.thumbnailOverlay}><Lock color="#fff" /></div>}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <span className={styles.categoryBadge} style={{ background: '#fef3c7', color: '#d97706' }}>Final Assessment</span>
                    </div>
                    <h3 className={styles.lessonTitle}>FinWise Master Exam</h3>
                    <div className={styles.lessonStats}>
                      <div className={styles.stat}><Clock size={14} /> 20 Questions</div>
                      <div className={styles.stat}><Award size={14} /> Pass: 70%</div>
                    </div>
                    <div className={styles.cardActions}>
                      <button 
                        className={`${styles.actionBtn} ${examStatus === 'Locked' ? styles.btnDisabled : styles.btnPrimary}`}
                        onClick={() => examStatus !== 'Locked' && router.push(`/learn/exam`)}
                        disabled={examStatus === 'Locked'}
                        style={examStatus !== 'Locked' ? { background: '#10b981', color: 'white', border: 'none' } : {}}
                      >
                        {examStatus === 'Locked' ? 'Complete all lessons to unlock' : (examStatus === 'Passed' ? 'Review Exam' : 'Start Final Exam')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
            
            {filteredLessons.length === 0 && (
              <div className={styles.emptyState}>
                <Search size={48} opacity={0.2} />
                <h3>No lessons found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}
          >
            {completedLessons.length > 0 ? (
              completedLessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  onClick={() => setSelectedCertLesson(lesson)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px' }}>
                      <Award size={28} color="#16a34a" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>{lesson.title}</h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Certificate of Completion</p>
                    </div>
                  </div>
                  <ChevronRight size={20} color="#9ca3af" />
                </div>
              ))
            ) : (
              <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                <Award size={48} opacity={0.2} />
                <h3>No Certificates Yet</h3>
                <p>Complete your first lesson to earn a certificate!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Certificate Modal Overlay */}
      <AnimatePresence>
        {selectedCertLesson && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }}
            onClick={() => setSelectedCertLesson(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#f9fafb', padding: '40px', borderRadius: '24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', width: '100%', maxWidth: '880px' }}
            >
              <button 
                onClick={() => setSelectedCertLesson(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'white', border: '1px solid #e5e7eb', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <X size={18} color="#4b5563" />
              </button>
              
              <Certificate 
                userName={user.name || 'FinWise Student'}
                courseTitle={selectedCertLesson.title}
                date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                variant="full"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
