"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Award, BookOpen, CheckCircle2, MessageSquare, Zap, ChevronRight, ChevronLeft, XCircle } from 'lucide-react';
import styles from './Lesson.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { LessonSideChat } from '@/components/learn/LessonSideChat';
import { LESSON_CONTENTS, LESSON_QUIZZES } from '@/mocks/lessons';
import { Certificate } from '@/components/learn/Certificate';
import { Sparkles } from 'lucide-react';

export default function LessonPage() {
  const router = useRouter();
  const { id } = useParams();
  const lessonId = id as string;

  const completeLesson = useAppStore(state => state.completeLesson);
  const updateCourseProgress = useAppStore(state => state.updateCourseProgress);
  const lessons = useAppStore(state => state.lessons);
  const user = useAppStore(state => state.user);
  const courseProgressMap = useAppStore(state => state.courseProgress);
  
  const lesson = lessons.find(l => l.id === lessonId) || lessons[0];
  const courseChapters = LESSON_CONTENTS[lesson.id] || LESSON_CONTENTS['l2'];
  const quizQuestions = LESSON_QUIZZES[lesson.id] || [];
  
  const currentIndex = lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  
  const progress = courseProgressMap[lessonId];

  // Initialize state from deep progress tracking if available
  const initialIdx = progress?.currentChapterIdx !== undefined 
    ? Math.min(progress.currentChapterIdx, Math.max(0, courseChapters.length - 1)) 
    : 0;
  const [currentChapterIdx, setCurrentChapterIdx] = useState(initialIdx);
  const [miniQuizAnswers, setMiniQuizAnswers] = useState<Record<number, number>>(progress?.miniQuizAnswers || {});
  
  const [isCompleted, setIsCompleted] = useState(lesson.status === 'Completed');
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [isRevisiting, setIsRevisiting] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Selection state
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null);

  // Sync current chapter to global store
  useEffect(() => {
    updateCourseProgress(lessonId, { currentChapterIdx });
  }, [currentChapterIdx, lessonId, updateCourseProgress]);

  // Handle text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelection({
          text: sel.toString().trim(),
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      } else {
        // Need a slight timeout so if they clicked the tooltip it doesn't disappear before click registers
        setTimeout(() => setSelection(null), 100);
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const currentChapter = courseChapters[currentChapterIdx];
  const answeredIdx = miniQuizAnswers[currentChapterIdx];
  const hasMiniQuiz = !!currentChapter?.miniQuiz;
  const isCorrect = answeredIdx === currentChapter?.miniQuiz?.answerIndex;

  const handleMiniQuizAnswer = (optIdx: number) => {
    const newAnswers = { ...miniQuizAnswers, [currentChapterIdx]: optIdx };
    setMiniQuizAnswers(newAnswers);
    updateCourseProgress(lessonId, { miniQuizAnswers: newAnswers });
  };

  const retryQuestion = () => {
    const newAnswers = { ...miniQuizAnswers };
    delete newAnswers[currentChapterIdx];
    setMiniQuizAnswers(newAnswers);
    updateCourseProgress(lessonId, { miniQuizAnswers: newAnswers });
  };

  const handleResetCourse = () => {
    // Reset course progress completely
    useAppStore.setState(state => {
      const newLessons = [...state.lessons];
      const idx = newLessons.findIndex(l => l.id === lessonId);
      if (idx !== -1) {
        newLessons[idx] = { ...newLessons[idx], status: 'In Progress' };
      }
      const newProgress = { ...state.courseProgress };
      delete newProgress[lessonId];
      return { lessons: newLessons, courseProgress: newProgress };
    });
    
    // Also reset exam state
    useAppStore.getState().updateFinalExamState({
      activeExamId: null,
      answers: {},
      flagged: [],
      visited: [],
      timeRemaining: null,
      warnings: 0,
      attempts: [],
      status: 'Available'
    });
    
    // Reload the page to reflect all reset state cleanly
    window.location.reload();
  };

  const handleNext = () => {
    if (currentChapterIdx < courseChapters.length - 1) {
      setCurrentChapterIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (isRevisiting) {
        setIsRevisiting(false);
        setCurrentChapterIdx(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        useAppStore.getState().updateFinalExamState({ 
          activeExamId: lessonId,
          answers: {},
          flagged: [],
          visited: [],
          timeRemaining: 1800,
          warnings: 0,
          status: 'Available'
        });
        router.push(`/learn/exam?lessonId=${lessonId}`);
      }
    }
  };

  const handlePrevious = () => {
    if (currentChapterIdx > 0) {
      setCurrentChapterIdx(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExplainSelection = () => {
    if (selection) {
      setInitialPrompt(`Explain this section from the lesson: "${selection.text}"`);
      setSelection(null);
    }
  };



  let specificContext = "Reading the chapter.";
  let contextMode: 'reading' | 'quiz' | 'summary' = 'reading';
  
  if (isCompleted && !isRevisiting) {
    contextMode = 'summary';
    specificContext = "Viewing course summary/certificate.";
  } else if (hasMiniQuiz && answeredIdx === undefined) {
    contextMode = 'quiz';
    specificContext = `Currently looking at the mini-quiz: "${currentChapter.miniQuiz?.question}". They have not answered yet.`;
  } else if (hasMiniQuiz && answeredIdx !== undefined) {
    specificContext = `Currently looking at the mini-quiz: "${currentChapter.miniQuiz?.question}". They selected option ${answeredIdx + 1}, which is ${isCorrect ? 'correct' : 'incorrect'}.`;
  }

  const lessonContextForAi = {
    lessonTitle: lesson.title,
    chapterTitle: currentChapter.title,
    content: currentChapter.content.map((b: any) => b.content).join('\n\n'),
    specificContext
  };

  const percentComplete = Math.round((currentChapterIdx / courseChapters.length) * 100);

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Top Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className={styles.backBtn} onClick={() => router.push('/learn')}>
            <ArrowLeft size={16} /> Course Overview
          </button>
          
          {(!isCompleted || isRevisiting) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                {percentComplete}% Complete
              </div>
              <div style={{ width: '150px', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${percentComplete}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>

        <div className={`${styles.contentLayout} ${isChatExpanded ? styles.chatExpanded : ''}`}>
          {/* Main Reading Area */}
          <main className={styles.mainContent}>
            {(!isCompleted || isRevisiting) ? (
              <>
                <header className={styles.lessonHeader}>
                  <div className={styles.meta}>
                    <span className={styles.category}>{lesson.category}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.duration}><Clock size={14} /> {lesson.duration}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.xp}><Award size={14} /> {lesson.xp} XP</span>
                  </div>
                  <h1 className={styles.title}>{lesson.title}</h1>
                  <p className={styles.objectives}>Chapter {currentChapterIdx + 1} of {courseChapters.length}: {currentChapter.title}</p>
                </header>

                <article className={styles.article}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentChapterIdx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentChapter.content.map((block: any, i: number) => {
                        if (block.type === 'text') {
                          return <p key={i} className={styles.paragraph}>{block.content}</p>;
                        }
                        if (block.type === 'heading') {
                          return <h2 key={i} className={styles.heading}>{block.content}</h2>;
                        }
                        if (block.type === 'alert') {
                          return (
                            <div key={i} className={styles.alertBox}>
                              <Zap size={20} className={styles.alertIcon} />
                              <p>{block.content}</p>
                            </div>
                          );
                        }
                        return null;
                      })}

                      {hasMiniQuiz && (
                        <div className={styles.quizBox} style={{ marginTop: '40px', padding: '24px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px' }}>
                          <h3 style={{ marginBottom: '16px' }}>Mini-Quiz: Check your understanding</h3>
                          <p style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 500 }}>{currentChapter.miniQuiz.question}</p>
                          <div className={styles.options} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {currentChapter.miniQuiz.options.map((opt: string, optIdx: number) => {
                              const isThisCorrect = optIdx === currentChapter.miniQuiz.answerIndex;
                              const isSelected = answeredIdx === optIdx;
                              let stateStyle = { background: 'transparent', border: '1px solid var(--color-border)', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' as const, fontSize: '15px', transition: 'all 0.2s' };
                              
                              if (answeredIdx !== undefined) {
                                if (isThisCorrect) {
                                  stateStyle.background = '#dcfce7';
                                  stateStyle.border = '1px solid #22c55e';
                                } else if (isSelected) {
                                  stateStyle.background = '#fee2e2';
                                  stateStyle.border = '1px solid #ef4444';
                                } else {
                                  stateStyle.background = '#f9fafb';
                                  stateStyle.border = '1px solid #e5e7eb';
                                }
                              }
                              
                              return (
                                <button 
                                  key={optIdx} 
                                  style={stateStyle}
                                  onClick={() => handleMiniQuizAnswer(optIdx)}
                                  disabled={answeredIdx !== undefined}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {answeredIdx !== undefined && (
                            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} style={{ marginTop: '24px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}` }}>
                                {isCorrect ? <CheckCircle2 size={24} color="#16a34a" /> : <XCircle size={24} color="#dc2626" />}
                                <div>
                                  <h4 style={{ margin: '0 0 4px 0', color: isCorrect ? '#166534' : '#991b1b', fontSize: '16px' }}>
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                  </h4>
                                  <p style={{ margin: 0, color: isCorrect ? '#166534' : '#991b1b', fontSize: '14px', lineHeight: 1.5 }}>
                                    {currentChapter.miniQuiz.explanation || (isCorrect ? "Great job! That's exactly right." : "That's not quite right. Review the chapter or ask the AI Mentor for help.")}
                                  </p>
                                </div>
                              </div>
                              
                              {!isCorrect && (
                                <button onClick={retryQuestion} style={{ marginTop: '16px', background: 'white', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                  Retry Question
                                </button>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </article>

                <footer className={styles.lessonFooter} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                  <button 
                    onClick={handlePrevious} 
                    disabled={currentChapterIdx === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', border: '1px solid #e5e7eb', background: currentChapterIdx === 0 ? '#f9fafb' : 'white', cursor: currentChapterIdx === 0 ? 'not-allowed' : 'pointer', color: currentChapterIdx === 0 ? '#9ca3af' : '#374151', fontWeight: 600, opacity: currentChapterIdx === 0 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={18} /> Previous
                  </button>

                  <button 
                    onClick={handleNext}
                    disabled={hasMiniQuiz && !isCorrect}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', border: 'none', background: (hasMiniQuiz && !isCorrect) ? '#e5e7eb' : '#111827', color: (hasMiniQuiz && !isCorrect) ? '#9ca3af' : 'white', cursor: (hasMiniQuiz && !isCorrect) ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                  >
                    {currentChapterIdx < courseChapters.length - 1 ? 'Next Chapter' : (isRevisiting ? 'Finish Revisiting' : 'Take Lesson Quiz')}
                    <ChevronRight size={18} />
                  </button>
                </footer>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', width: '100%', marginTop: '40px' }}>
                <div className={styles.completedBadge} style={{ marginBottom: '1rem' }}>
                  <CheckCircle2 size={24} /> 
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Lesson Completed</span>
                </div>
                
                {showCertificate ? (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Certificate 
                      userName={user.name}
                      courseTitle={lesson.title}
                      score={100}
                      date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', width: '100%', maxWidth: '600px' }}>
                    <Award size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
                    <h2 style={{ fontSize: '24px', margin: '0 0 16px' }}>Congratulations!</h2>
                    <p style={{ color: '#4b5563', marginBottom: '32px' }}>You have successfully completed {lesson.title}.</p>
                    <button 
                      onClick={() => setShowCertificate(true)}
                      style={{ padding: '16px 32px', background: '#111827', color: 'white', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    >
                      View Certificate
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '800px' }}>
                  <button 
                    className={styles.completeBtn} 
                    onClick={handleResetCourse}
                    style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                  >
                    Reset Course
                  </button>
                  <button 
                    className={styles.completeBtn} 
                    onClick={() => {
                      setIsRevisiting(true);
                      setCurrentChapterIdx(0);
                    }}
                    style={{ backgroundColor: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb' }}
                  >
                    Review Lesson
                  </button>
                  {nextLesson ? (
                    <button 
                      className={styles.completeBtn} 
                      onClick={() => router.push(`/learn/${nextLesson.id}`)}
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                    >
                      Next Lesson <ChevronRight size={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                    </button>
                  ) : (
                    <button 
                      className={styles.completeBtn} 
                      onClick={() => router.push(`/learn`)}
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                    >
                      Course Overview <ChevronRight size={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Render the side chat overlay only when learning for the first time */}
      {(!isCompleted && !isRevisiting) && (
        <LessonSideChat 
          lessonId={lessonId}
          lessonContext={lessonContextForAi}
          contextMode={contextMode}
          initialPrompt={initialPrompt}
          onInitialPromptSent={() => setInitialPrompt(null)}
          onStateChange={setIsChatExpanded}
        />
      )}

      {/* Render Text Selection Tooltip */}
      <AnimatePresence>
        {selection && (
          <motion.div 
            className={styles.selectionTooltip}
            style={{ left: selection.x, top: selection.y }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleExplainSelection();
            }}
          >
            <Sparkles size={14} color="#10b981" /> Explain Selection
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
