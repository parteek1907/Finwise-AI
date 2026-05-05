"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Send, Sparkles, MessageSquare, Plus, Clock, BrainCircuit, ChevronRight } from 'lucide-react';
import styles from './Mentor.module.css';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function MentorPage() {
  const history = useAppStore(state => state.mentorHistory);
  const addMessage = useAppStore(state => state.addMessage);
  const user = useAppStore(state => state.user);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add User Message
    addMessage({ sender: 'user', text: inputValue });
    setInputValue('');
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ 
        sender: 'ai', 
        text: "That's a great question. Based on your financial archetype (The Guardian), I recommend prioritizing stability. Let's look at how we can adjust your emergency fund goal to reach it 2 months faster." 
      });
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QUICK_PROMPTS = [
    "Explain SIPs to me",
    "How do I start budgeting?",
    "Review my active goals",
    "What is inflation?"
  ];

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Mentor 3-Column Layout */}
        <div className={styles.mentorLayout}>
          
          {/* Left: Chat History */}
          <aside className={styles.historySidebar}>
            <button className={styles.newChatBtn}>
              <Plus size={16} /> New Chat
            </button>
            <div className={styles.historyList}>
              <span className={styles.historyLabel}>Previous 7 Days</span>
              <button className={styles.historyItem}>
                <MessageSquare size={14} /> Discussing Emergency Fund
              </button>
              <button className={styles.historyItem}>
                <MessageSquare size={14} /> Psychology of Debt Lesson
              </button>
              <button className={styles.historyItem}>
                <MessageSquare size={14} /> Weekend Budget Review
              </button>
              
              <span className={styles.historyLabel} style={{marginTop: '1rem'}}>Previous 30 Days</span>
              <button className={styles.historyItem}>
                <MessageSquare size={14} /> Setting up first goals
              </button>
              <button className={styles.historyItem}>
                <MessageSquare size={14} /> Onboarding results
              </button>
            </div>
          </aside>

          {/* Center: Chat Window */}
          <main className={styles.chatArea}>
            <div className={styles.messagesContainer}>
              <AnimatePresence initial={false}>
                {history.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.wrapperUser : styles.wrapperAi}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className={styles.aiAvatar}>
                        <Sparkles size={16} />
                      </div>
                    )}
                    
                    <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                      {msg.text}
                      {msg.actionRequired && (
                        <div className={styles.actionCard}>
                          <strong>Action Recommended</strong>
                          <p>Reallocate $200 from checking to Credit Card Debt.</p>
                          <button>Apply Changes</button>
                        </div>
                      )}
                    </div>
                    
                    {msg.sender === 'user' && (
                      <div className={styles.userAvatar}>
                        <img src={user.avatar} alt="User" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
                    <div className={styles.aiAvatar}><Sparkles size={16} /></div>
                    <div className={`${styles.messageBubble} ${styles.bubbleAi}`}>
                      <div className={styles.typingIndicator}>
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>

            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <textarea 
                  placeholder="Ask your AI mentor anything..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button 
                  className={styles.sendBtn} 
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
              <p className={styles.disclaimer}>FinWise AI can make mistakes. Consider verifying important financial decisions.</p>
            </div>
          </main>

          {/* Right: Suggested Topics & Memory */}
          <aside className={styles.suggestionsSidebar}>
            
            <div className={styles.infoCard}>
              <div className={styles.infoHeader}>
                <BrainCircuit size={16} />
                <h3>Mentor Memory</h3>
              </div>
              <p>The AI is currently considering your active goals, your "Guardian" archetype, and your recent lesson completion.</p>
            </div>

            <div className={styles.promptsSection}>
              <h3>Suggested Prompts</h3>
              <div className={styles.promptsList}>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button 
                    key={i} 
                    className={styles.promptBtn}
                    onClick={() => {
                      setInputValue(prompt);
                      // handleSend(); // Could auto-send, but let user see it first
                    }}
                  >
                    {prompt} <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
