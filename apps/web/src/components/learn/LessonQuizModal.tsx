import React, { useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import styles from './LessonQuizModal.module.css';
import { Certificate } from './Certificate';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonQuizModalProps {
  questions: any[];
  lessonTitle: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const LessonQuizModal: React.FC<LessonQuizModalProps> = ({ 
  questions, 
  lessonTitle, 
  userName, 
  onClose, 
  onSuccess 
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: optIdx }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answerIndex) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);

    if (finalScore >= 70) {
      onSuccess(); // Mark as completed in store
    }
  };

  const currentQ = questions[currentQuestionIdx];
  const isPassed = score >= 70;

  return (
    <div className={styles.modalOverlay}>
      <motion.div 
        className={styles.modalContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <div className={styles.quizInner}>
            <h2>Final Quiz: {lessonTitle}</h2>
            <p className={styles.subtitle}>Answer all {questions.length} questions. You need 70% to pass.</p>
            
            <div className={styles.progressTracker}>
              {questions.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.dot} ${idx === currentQuestionIdx ? styles.dotActive : ''} ${answers[idx] !== undefined ? styles.dotAnswered : ''}`}
                />
              ))}
            </div>

            <div className={styles.questionContainer}>
              <h3>{currentQuestionIdx + 1}. {currentQ.question}</h3>
              <div className={styles.optionsList}>
                {currentQ.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[currentQuestionIdx] === optIdx;
                  return (
                    <button 
                      key={optIdx}
                      className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ''}`}
                      onClick={() => handleSelectOption(optIdx)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.navRow}>
              <button 
                className={styles.navBtn} 
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0}
              >
                Previous
              </button>

              {currentQuestionIdx === questions.length - 1 ? (
                <button 
                  className={styles.submitBtn} 
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                >
                  Submit Quiz
                </button>
              ) : (
                <button 
                  className={styles.navBtn} 
                  onClick={handleNext}
                  disabled={answers[currentQuestionIdx] === undefined}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.resultContainer}>
            {isPassed ? (
              <div className={styles.passState}>
                <Certificate 
                  userName={userName}
                  courseTitle={lessonTitle}
                  score={score}
                  date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                />
                <div className={styles.actionRow}>
                  <button className={styles.continueBtn} onClick={onClose}>
                    Continue Learning
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.failState}>
                <XCircle size={64} className={styles.failIcon} />
                <h2>You scored {score}%</h2>
                <p>You need at least 70% to earn your certificate and unlock the next tier.</p>
                <div className={styles.actionRow}>
                  <button className={styles.retryBtn} onClick={() => {
                    setIsSubmitted(false);
                    setCurrentQuestionIdx(0);
                    setAnswers({});
                  }}>
                    Retry Quiz
                  </button>
                  <button className={styles.navBtn} onClick={onClose}>
                    Back to Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
