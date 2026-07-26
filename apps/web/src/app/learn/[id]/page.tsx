"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Award, BookOpen, CheckCircle2, MessageSquare, Zap, ChevronRight } from 'lucide-react';
import styles from './Lesson.module.css';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { LessonSideChat } from '@/components/learn/LessonSideChat';
import { LESSON_CONTENTS, LESSON_QUIZZES } from '@/mocks/lessons';
import { LessonQuizModal } from '@/components/learn/LessonQuizModal';
import { Certificate } from '@/components/learn/Certificate';


export default function LessonPage() {
  const router = useRouter();
  const { id } = useParams();
  const completeLesson = useAppStore(state => state.completeLesson);
  const lessons = useAppStore(state => state.lessons);
  const user = useAppStore(state => state.user);
  
  const lesson = lessons.find(l => l.id === id) || lessons[0]; // Fallback if invalid
  const courseChapters = LESSON_CONTENTS[lesson.id] || LESSON_CONTENTS['l2'];
  const quizQuestions = LESSON_QUIZZES[lesson.id] || [];
  
  const currentIndex = lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  
  const [isCompleted, setIsCompleted] = useState(lesson.status === 'Completed');
  const [showQuiz, setShowQuiz] = useState(false);
  
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [miniQuizAnswered, setMiniQuizAnswered] = useState<number | null>(null);
  
  const currentChapter = courseChapters[currentChapterIdx];
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [isRevisiting, setIsRevisiting] = useState(false);

  const handleOpenChat = (prompt?: string) => {
    if (prompt) setInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setInitialPrompt(null);
  };

  const lessonContext = {
    title: lesson.title,
    content: currentChapter.content.map((b: any) => b.content).join('\n\n')
  };

  const handleQuizSuccess = () => {
    completeLesson(lesson.id);
    setIsCompleted(true);
  };

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Top Navigation */}
        <button className={styles.backBtn} onClick={() => router.push('/learn')}>
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className={styles.contentLayout}>
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

                  {(!isCompleted || isRevisiting) && currentChapter.miniQuiz && (
                    <div className={styles.quizBox} style={{ marginTop: '40px', padding: '24px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '16px' }}>
                      <h3 style={{ marginBottom: '16px' }}>Mini-Quiz: Check your understanding</h3>
                      <p style={{ marginBottom: '16px' }}>{currentChapter.miniQuiz.question}</p>
                      <div className={styles.options} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {currentChapter.miniQuiz.options.map((opt: string, optIdx: number) => {
                          const isCorrect = optIdx === currentChapter.miniQuiz.answerIndex;
                          const isSelected = miniQuizAnswered === optIdx;
                          let stateStyle = { background: 'transparent', border: '1px solid var(--color-border)', padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' as const };
                          
                          if (miniQuizAnswered !== null) {
                            if (isCorrect) {
                              stateStyle.background = '#dcfce7';
                              stateStyle.border = '1px solid #22c55e';
                            } else if (isSelected) {
                              stateStyle.background = '#fee2e2';
                              stateStyle.border = '1px solid #ef4444';
                            } else {
                              stateStyle.background = '#f3f4f6';
                              stateStyle.border = '1px solid #e5e7eb';
                            }
                          }
                          
                          return (
                            <button 
                              key={optIdx} 
                              style={stateStyle}
                              onClick={() => setMiniQuizAnswered(optIdx)}
                              disabled={miniQuizAnswered !== null}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {miniQuizAnswered !== null && miniQuizAnswered === currentChapter.miniQuiz.answerIndex && (
                        <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} style={{ marginTop: '16px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={16} /> Correct! You can proceed.
                        </motion.div>
                      )}
                    </div>
                  )}
                </article>

                <footer className={styles.lessonFooter} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  {(miniQuizAnswered === currentChapter.miniQuiz.answerIndex || !currentChapter.miniQuiz) && (
                    currentChapterIdx < courseChapters.length - 1 ? (
                      <button 
                        className={styles.completeBtn} 
                        onClick={() => {
                          setCurrentChapterIdx(prev => prev + 1);
                          setMiniQuizAnswered(null);
                          window.scrollTo(0, 0);
                        }}
                      >
                        Proceed to Next Chapter <ChevronRight size={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                      </button>
                    ) : (
                      <button className={styles.completeBtn} onClick={() => {
                        if (isRevisiting) {
                          setIsRevisiting(false);
                          setCurrentChapterIdx(0);
                          window.scrollTo(0, 0);
                        } else {
                          setShowQuiz(true);
                        }
                      }}>
                        {isRevisiting ? 'Finish Revisiting' : `Take Final Quiz (+${lesson.xp} XP)`}
                      </button>
                    )
                  )}
                </footer>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', width: '100%', marginTop: '40px' }}>
                <div className={styles.completedBadge} style={{ marginBottom: '1rem' }}>
                  <CheckCircle2 size={24} /> 
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Course Completed</span>
                </div>
                
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <Certificate 
                    userName={user.name}
                    courseTitle={lesson.title}
                    score={100}
                    date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    className={styles.completeBtn} 
                    onClick={() => {
                      setIsRevisiting(true);
                      setCurrentChapterIdx(0);
                      setMiniQuizAnswered(null);
                    }}
                    style={{ backgroundColor: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb' }}
                  >
                    Revisit Course
                  </button>
                  {nextLesson ? (
                    <button 
                      className={styles.completeBtn} 
                      onClick={() => router.push(`/learn/${nextLesson.id}`)}
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                    >
                      Next Course <ChevronRight size={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                    </button>
                  ) : (
                    <button 
                      className={styles.completeBtn} 
                      onClick={() => router.push(`/learn`)}
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                    >
                      Back to Courses <ChevronRight size={18} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - AI Tools */}
          {isChatOpen ? (
            <LessonSideChat 
              lessonContext={lessonContext}
              onClose={handleCloseChat}
              initialPrompt={initialPrompt}
              onInitialPromptSent={() => setInitialPrompt(null)}
            />
          ) : (
            <aside className={styles.sidebar}>
              <div className={styles.aiCard}>
                <div className={styles.aiHeader}>
                  <MessageSquare size={18} />
                  <h3>AI Mentor</h3>
                </div>
                <p>Confused by a concept? Your AI mentor is here to explain it in simple terms.</p>
                
                <div className={styles.quickPrompts}>
                  <button onClick={() => handleOpenChat("Explain this to me like I'm 5")} className={styles.promptBtn}>
                    Explain this to me like I'm 5 <ChevronRight size={14} />
                  </button>
                  <button onClick={() => handleOpenChat("Give me a real-world example")} className={styles.promptBtn}>
                    Give me a real-world example <ChevronRight size={14} />
                  </button>
                  <button onClick={() => handleOpenChat("How does this apply to my goals?")} className={styles.promptBtn}>
                    How does this apply to my goals? <ChevronRight size={14} />
                  </button>
                </div>

                <button className={styles.chatBtn} onClick={() => handleOpenChat()}>
                  Open Chat
                </button>
              </div>

              {nextLesson && (
                <div 
                  className={styles.nextLessonCard} 
                  onClick={() => router.push(`/learn/${nextLesson.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>Up Next</h3>
                  <div className={styles.nextLesson}>
                    <div className={styles.nextIcon}><BookOpen size={16} /></div>
                    <div>
                      <h4>{nextLesson.title}</h4>
                      <span>{nextLesson.duration} • {nextLesson.xp} XP</span>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* Render the Quiz Modal if active */}
      {showQuiz && (
        <LessonQuizModal 
          questions={quizQuestions}
          lessonTitle={lesson.title}
          userName={user.name}
          onClose={() => setShowQuiz(false)}
          onSuccess={handleQuizSuccess}
        />
      )}
    </AppLayout>
  );
}
