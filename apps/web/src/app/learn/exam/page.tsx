"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flag, CheckCircle2, XCircle, AlertCircle, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './Exam.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { FINAL_EXAM_QUESTIONS } from '@/mocks/finalExam';
import { Certificate } from '@/components/learn/Certificate';

export default function FinalExamPage() {
  const router = useRouter();
  const user = useAppStore(state => state.user);
  const finalExamState = useAppStore(state => state.finalExamState);
  const updateFinalExamState = useAppStore(state => state.updateFinalExamState);

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(finalExamState.status === 'Passed');
  const [examScore, setExamScore] = useState<number | null>(null);

  const currentQuestion = FINAL_EXAM_QUESTIONS[currentQIdx];
  const totalQuestions = FINAL_EXAM_QUESTIONS.length;
  
  const answers = finalExamState.answers;
  const flagged = finalExamState.flagged;
  const isFlagged = flagged.includes(currentQIdx);
  
  // Calculate answered count
  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === totalQuestions;

  // Handle Answer Selection
  const handleSelectOption = (optIdx: number) => {
    if (isReviewMode) return;
    
    updateFinalExamState({
      answers: { ...answers, [currentQIdx]: optIdx },
      status: 'In Progress'
    });
  };

  // Handle Flagging
  const toggleFlag = () => {
    if (isReviewMode) return;
    
    if (isFlagged) {
      updateFinalExamState({ flagged: flagged.filter(id => id !== currentQIdx) });
    } else {
      updateFinalExamState({ flagged: [...flagged, currentQIdx] });
    }
  };

  // Submit Exam
  const handleSubmit = () => {
    let correctCount = 0;
    FINAL_EXAM_QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.answerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;
    
    setExamScore(score);
    setIsReviewMode(true);
    setCurrentQIdx(0);

    const newAttempt = { score, date: new Date().toISOString(), passed };
    
    updateFinalExamState({
      status: passed ? 'Passed' : 'Available',
      attempts: [...finalExamState.attempts, newAttempt],
      // If they fail, we could theoretically clear answers, but keeping them allows review.
      // The user can hit "Retake Exam" to clear them.
    });
  };

  const handleRetake = () => {
    updateFinalExamState({
      answers: {},
      flagged: [],
      status: 'Available'
    });
    setIsReviewMode(false);
    setCurrentQIdx(0);
    setExamScore(null);
  };

  // Safe guard: Redirect if locked
  useEffect(() => {
    if (finalExamState.status === 'Locked') {
      router.push('/learn');
    }
  }, [finalExamState.status, router]);

  if (finalExamState.status === 'Locked') return null;

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Top Navigation */}
        <button className={styles.backBtn} onClick={() => router.push('/learn')} style={{ marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className={styles.contentLayout}>
          {/* Main Content Area */}
          <main className={styles.mainContent}>
            {isReviewMode && examScore !== null ? (
              <div className={styles.reviewHeader}>
                <Award size={48} color={examScore >= 70 ? "#16a34a" : "#dc2626"} />
                <h1 style={{ margin: '16px 0 8px 0' }}>Exam {examScore >= 70 ? 'Passed!' : 'Failed'}</h1>
                <div className={`${styles.reviewScore} ${examScore >= 70 ? styles.passed : styles.failed}`}>
                  {examScore}%
                </div>
                <p className={styles.reviewSubtitle}>
                  You answered {Math.round((examScore / 100) * totalQuestions)} out of {totalQuestions} questions correctly.
                </p>
                
                {examScore >= 70 && (
                  <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                    <Certificate 
                      userName={user.name}
                      courseTitle="FinWise Master Class"
                      score={examScore}
                      date={new Date().toLocaleDateString()}
                      variant="full"
                    />
                  </div>
                )}
                
                {examScore < 70 && (
                  <button onClick={handleRetake} className={styles.submitBtn} style={{ maxWidth: '300px', margin: '32px auto' }}>
                    Retake Exam
                  </button>
                )}
                
                <hr style={{ margin: '48px 0', borderColor: '#e5e7eb' }} />
                <h2 style={{ textAlign: 'left', marginBottom: '24px' }}>Review Your Answers</h2>
              </div>
            ) : null}

            <div className={styles.questionContainer}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>Question {currentQIdx + 1} of {totalQuestions}</span>
                {!isReviewMode && (
                  <button 
                    className={`${styles.flagBtn} ${isFlagged ? styles.isFlagged : ''}`}
                    onClick={toggleFlag}
                  >
                    <Flag size={14} fill={isFlagged ? "currentColor" : "none"} /> 
                    {isFlagged ? 'Flagged for Review' : 'Flag Question'}
                  </button>
                )}
              </div>

              <h2 className={styles.questionText}>{currentQuestion.question}</h2>

              <div className={isReviewMode ? styles.reviewOptionsList : styles.optionsList}>
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = answers[currentQIdx] === idx;
                  const isCorrectAnswer = currentQuestion.answerIndex === idx;
                  
                  if (!isReviewMode) {
                    return (
                      <button 
                        key={idx}
                        className={`${styles.optionBtn} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleSelectOption(idx)}
                      >
                        <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                        {opt}
                      </button>
                    );
                  } else {
                    let reviewClass = '';
                    if (isSelected && isCorrectAnswer) reviewClass = styles.correct;
                    else if (isSelected && !isCorrectAnswer) reviewClass = styles.incorrect;
                    else if (!isSelected && isCorrectAnswer) reviewClass = styles.missed;
                    
                    return (
                      <div key={idx} className={`${styles.reviewOption} ${reviewClass}`}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <span className={styles.optionLetter} style={{ background: reviewClass === styles.correct ? '#22c55e' : (reviewClass === styles.incorrect ? '#ef4444' : '#f3f4f6'), color: (reviewClass === styles.correct || reviewClass === styles.incorrect) ? 'white' : '#6b7280' }}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <div style={{ flex: 1 }}>{opt}</div>
                          {reviewClass === styles.correct && <CheckCircle2 color="#22c55e" size={20} />}
                          {reviewClass === styles.incorrect && <XCircle color="#ef4444" size={20} />}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {isReviewMode && (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className={styles.explanationBox}>
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </motion.div>
              )}
            </div>

            <div className={styles.navFooter}>
              <button 
                className={styles.navBtn} 
                onClick={() => setCurrentQIdx(prev => prev - 1)}
                disabled={currentQIdx === 0}
              >
                <ChevronLeft size={18} /> Previous
              </button>

              {currentQIdx < totalQuestions - 1 ? (
                <button 
                  className={styles.navBtn} 
                  onClick={() => setCurrentQIdx(prev => prev + 1)}
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                !isReviewMode && (
                  <button 
                    className={`${styles.navBtn} ${styles.primary}`}
                    onClick={handleSubmit}
                  >
                    Submit Exam <CheckCircle2 size={18} />
                  </button>
                )
              )}
            </div>
          </main>

          {/* Right Sidebar - Navigation Grid */}
          <aside className={styles.sidebar}>
            <div className={styles.questionGrid}>
              <h3>Question Navigator</h3>
              <div className={styles.gridSquares}>
                {Array.from({ length: totalQuestions }).map((_, idx) => {
                  const isAnswered = answers[idx] !== undefined;
                  const hasFlag = flagged.includes(idx);
                  const isActive = currentQIdx === idx;
                  
                  let classNames = [styles.gridSquare];
                  if (isActive) classNames.push(styles.active);
                  if (isAnswered && !isReviewMode) classNames.push(styles.answered);
                  if (hasFlag && !isReviewMode) classNames.push(styles.flagged);
                  
                  // In review mode, color grid by correctness
                  if (isReviewMode) {
                    if (answers[idx] === FINAL_EXAM_QUESTIONS[idx].answerIndex) {
                      classNames.push(styles.answered); // Green
                    } else {
                      classNames.push(styles.flagged); // Reusing flagged style for error indicator, or create a new one.
                      // Let's use inline style for red in review mode
                    }
                  }

                  return (
                    <button 
                      key={idx}
                      className={classNames.join(' ')}
                      onClick={() => setCurrentQIdx(idx)}
                      style={isReviewMode && answers[idx] !== FINAL_EXAM_QUESTIONS[idx].answerIndex ? { backgroundColor: '#fef2f2', borderColor: '#f87171', color: '#b91c1c' } : {}}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              
              {!isReviewMode && (
                <div style={{ marginTop: '24px', fontSize: '13px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#f0fdf4', border: '1px solid #86efac' }}></div> Answered
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'white', border: '1px solid #e5e7eb', borderBottom: '3px solid #f59e0b' }}></div> Flagged
                  </div>
                </div>
              )}

              {!isReviewMode && (
                <button 
                  className={styles.submitBtn} 
                  disabled={!isAllAnswered}
                  onClick={handleSubmit}
                >
                  Submit Exam
                </button>
              )}
              
              {!isReviewMode && !isAllAnswered && (
                <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '12px' }}>
                  Answer all questions to submit.
                </p>
              )}
            </div>
            
            {isReviewMode && finalExamState.status === 'Passed' && (
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
                <Award size={32} style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 8px 0' }}>Mastery Achieved</h3>
                <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
                  You have successfully completed the FinWise master curriculum. You are now equipped to make excellent financial decisions!
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
