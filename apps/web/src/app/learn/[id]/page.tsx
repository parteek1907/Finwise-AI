"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Award, BookOpen, CheckCircle2, MessageSquare, Zap, ChevronRight } from 'lucide-react';
import styles from './Lesson.module.css';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

const CONTENT_BLOCKS = [
  {
    type: 'text',
    content: "When it comes to managing money, your brain is often your worst enemy. It is wired for immediate survival, not long-term wealth accumulation."
  },
  {
    type: 'alert',
    content: "The 'Delay Discounting' trap occurs when you value a smaller, immediate reward over a larger, delayed reward. It's why we buy coffee today instead of saving for retirement in 30 years."
  },
  {
    type: 'heading',
    content: "How to Hack Your Psychology"
  },
  {
    type: 'text',
    content: "1. Automate Everything: If you don't see the money, you won't spend it. Set up automatic transfers to your savings account on payday."
  },
  {
    type: 'text',
    content: "2. The 48-Hour Rule: For any non-essential purchase over $50, wait 48 hours before buying. This kills the dopamine rush of impulse buying."
  },
  {
    type: 'quiz',
    question: "Which of the following is an example of the Delay Discounting trap?",
    options: [
      "Setting up an automatic 401k contribution.",
      "Buying a new video game today instead of saving that $60 for a car downpayment.",
      "Waiting 48 hours before making a large purchase."
    ],
    answerIndex: 1
  }
];

export default function LessonPage() {
  const router = useRouter();
  const { id } = useParams();
  const completeLesson = useAppStore(state => state.completeLesson);
  const lessons = useAppStore(state => state.lessons);
  
  const lesson = lessons.find(l => l.id === id) || lessons[0]; // Fallback if invalid
  
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(lesson.status === 'Completed');

  const handleComplete = () => {
    completeLesson(lesson.id);
    setIsCompleted(true);
    // Add XP animation logic here if desired
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
            <header className={styles.lessonHeader}>
              <div className={styles.meta}>
                <span className={styles.category}>{lesson.category}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.duration}><Clock size={14} /> {lesson.duration}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.xp}><Award size={14} /> {lesson.xp} XP</span>
              </div>
              <h1 className={styles.title}>{lesson.title}</h1>
              <p className={styles.objectives}>By the end of this lesson, you will understand how to identify cognitive biases that lead to poor financial decisions.</p>
            </header>

            <article className={styles.article}>
              {CONTENT_BLOCKS.map((block, i) => {
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
                if (block.type === 'quiz') {
                  return (
                    <div key={i} className={styles.quizBox}>
                      <h3>Mini Quiz</h3>
                      <p>{block.question}</p>
                      <div className={styles.options}>
                        {block.options?.map((opt, optIdx) => {
                          const isCorrect = optIdx === block.answerIndex;
                          const isSelected = quizAnswered === optIdx;
                          let stateClass = '';
                          if (quizAnswered !== null) {
                            if (isCorrect) stateClass = styles.optCorrect;
                            else if (isSelected) stateClass = styles.optWrong;
                            else stateClass = styles.optDisabled;
                          }

                          return (
                            <button 
                              key={optIdx} 
                              className={`${styles.quizOption} ${stateClass}`}
                              onClick={() => setQuizAnswered(optIdx)}
                              disabled={quizAnswered !== null}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizAnswered !== null && quizAnswered === block.answerIndex && (
                        <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className={styles.quizSuccess}>
                          <CheckCircle2 size={16} /> Correct! You understand the concept.
                        </motion.div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </article>

            <footer className={styles.lessonFooter}>
              {!isCompleted ? (
                <button className={styles.completeBtn} onClick={handleComplete}>
                  Mark as Completed (+{lesson.xp} XP)
                </button>
              ) : (
                <div className={styles.completedBadge}>
                  <CheckCircle2 size={20} /> Lesson Completed
                </div>
              )}
            </footer>
          </main>

          {/* Right Sidebar - AI Tools */}
          <aside className={styles.sidebar}>
            <div className={styles.aiCard}>
              <div className={styles.aiHeader}>
                <MessageSquare size={18} />
                <h3>AI Mentor</h3>
              </div>
              <p>Confused by a concept? Your AI mentor is here to explain it in simple terms.</p>
              
              <div className={styles.quickPrompts}>
                <button onClick={() => router.push('/mentor')} className={styles.promptBtn}>
                  Explain this to me like I'm 5 <ChevronRight size={14} />
                </button>
                <button onClick={() => router.push('/mentor')} className={styles.promptBtn}>
                  Give me a real-world example <ChevronRight size={14} />
                </button>
                <button onClick={() => router.push('/mentor')} className={styles.promptBtn}>
                  How does this apply to my goals? <ChevronRight size={14} />
                </button>
              </div>

              <button className={styles.chatBtn} onClick={() => router.push('/mentor')}>
                Open Chat
              </button>
            </div>

            <div className={styles.nextLessonCard}>
              <h3>Up Next</h3>
              <div className={styles.nextLesson}>
                <div className={styles.nextIcon}><BookOpen size={16} /></div>
                <div>
                  <h4>Lifestyle Creep</h4>
                  <span>10 mins • 100 XP</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
