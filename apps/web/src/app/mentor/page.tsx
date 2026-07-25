"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Send, Mic, Sparkles, PanelLeft, PanelLeftClose, ChevronRight } from 'lucide-react';
import styles from './Mentor.module.css';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSidebar } from '@/components/mentor/ChatSidebar';
import { RichMessage } from '@/components/mentor/RichMessage';

export default function MentorPage() {
  const { chats, activeChatId, addMessage, createNewChat, user, goals, updateGoal, updateChatTitle } = useAppStore();
  
  const activeChat = chats.find(c => c.id === activeChatId);
  const history = activeChat ? activeChat.messages : [];
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isTyping]);

  const SUGGESTED_PROMPTS = [
    { label: "Explain compound interest simply" },
    { label: "Generate a step-by-step plan to buy a house" },
    { label: "Analyze my current portfolio for improvements" }
  ];

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in your browser. Please use Chrome.");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setInputValue(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    let currentChatId = activeChatId;
    const userMessage = inputValue;
    setInputValue('');

    const newTitle = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');

    // If there is no active chat (empty state), create one
    if (!currentChatId || !activeChat) {
      currentChatId = createNewChat(newTitle);
    } else if (history.length === 0) {
      updateChatTitle(currentChatId, newTitle);
    }

    addMessage(currentChatId, { sender: 'user', text: userMessage });
    setIsTyping(true);

    try {
      const isFirstMessage = history.length === 0;

      if (isFirstMessage) {
        // Generate title in background
        const apiUrl = '/api';
        fetch(`${apiUrl}/chat-title`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage }),
        }).then(res => res.json()).then(data => {
          if (data.title) {
            updateChatTitle(currentChatId, data.title);
          }
        }).catch(e => console.error("Title generation error", e));
      }

      // Prepare messages payload for backend
      const apiMessages = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      apiMessages.push({ role: 'user', content: userMessage });

      const apiUrl = '/api';
      const aiSettings = useSettingsStore.getState().aiMentor;
      const response = await fetch(`${apiUrl}/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, goals, aiSettings }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      
      setIsTyping(false);
      addMessage(currentChatId, { 
        sender: 'ai', 
        text: data.content || "I'm having trouble thinking right now."
      });
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsTyping(false);
      // Fallback mock rich response if API fails
      addMessage(currentChatId, { 
        sender: 'ai', 
        text: "## Summary\nBased on your profile, you should focus on your Emergency Fund first.\n\n## Action Recommendation\nAllocate an extra $200 this month to hit your milestone faster.\n\n## Why this matters\nAn emergency fund prevents high-interest debt accumulation during unexpected events." 
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAvatarUrl = () => {
    return user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=303A3C&color=fff`;
  };

  const isEmptyState = history.length === 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className={styles.workspace}>
        <div className={styles.mentorLayout} style={{ display: 'flex', width: '100%' }}>
          
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0, x: -20 }}
                animate={{ width: 260, opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden', flexShrink: 0 }}
              >
                <div style={{ width: 260, height: '100%' }}>
                  <ChatSidebar />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className={styles.chatArea} style={{ flex: 1, position: 'relative' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={styles.sidebarToggleBtn}
              title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
            {/* Subtle trading animation at top */}
            <div className={styles.marketTicker}>
              <div className={styles.marketPulse}></div>
            </div>

            {isEmptyState ? (
              <motion.div 
                className={styles.emptyState}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
              >
                <motion.div className={styles.welcomeIcon} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <Sparkles size={32} />
                </motion.div>
                <motion.h1>{getGreeting()}, {user.name.split(' ')[0]}.</motion.h1>
                <motion.p>
                  Your personal AI financial mentor. <br />
                  Ask questions, review your portfolio, understand markets, or learn investing with personalized guidance.
                </motion.p>
              </motion.div>
            ) : (
              <div className={styles.messagesContainer}>
                <AnimatePresence initial={false}>
                  {history.map((msg, index) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.wrapperUser : styles.wrapperAi}`}
                    >
                      {msg.sender === 'ai' && (
                        <div className={styles.aiAvatar}>
                          <Sparkles size={18} />
                        </div>
                      )}
                      
                      <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                        {msg.sender === 'user' ? (
                          msg.text
                        ) : (
                          <>
                            {/* Occasional Context Note */}
                            {index === 1 && (
                              <div className={styles.contextNote}>
                                <Sparkles size={12} /> AI remembers your Guardian investor profile.
                              </div>
                            )}
                            <RichMessage content={msg.text} />
                          </>
                        )}
                      </div>
                      
                      {msg.sender === 'user' && (
                        <div className={styles.userAvatar}>
                          <img src={getAvatarUrl()} alt="User" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
                      <div className={styles.aiAvatar}><Sparkles size={18} /></div>
                      <div className={`${styles.messageBubble} ${styles.bubbleAi}`}>
                        <div className={styles.typingIndicator}>
                          <span></span><span></span><span></span><span></span><span></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </AnimatePresence>
              </div>
            )}

            <div className={styles.inputArea}>
              <AnimatePresence>
                {isEmptyState && (
                  <motion.div 
                    className={styles.examplesContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={styles.examplesTitle}>Examples of queries:</p>
                    <div className={styles.examplesList}>
                      {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, i) => (
                        <motion.button 
                          key={i} 
                          className={styles.exampleBtn}
                          onClick={() => setInputValue(prompt.label)}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: 0.1 + (i * 0.1),
                            type: "spring",
                            stiffness: 300,
                            damping: 24
                          }}
                        >
                          <span>{prompt.label}</span>
                          <ChevronRight size={14} className={styles.exampleArrow} />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={styles.inputWrapper}>
                <button 
                  className={`${styles.inputIconBtn} ${isListening ? styles.listening : ''}`} 
                  title="Voice Input"
                  onClick={handleVoiceInput}
                >
                  <Mic size={20} />
                </button>
                <textarea 
                  placeholder="Ask about investing, budgeting, scams, savings..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  rows={1}
                />
                <button 
                  className={styles.sendBtn} 
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className={styles.disclaimer}>FinWise AI can make mistakes. Consider verifying important financial decisions.</p>
            </div>
            
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
