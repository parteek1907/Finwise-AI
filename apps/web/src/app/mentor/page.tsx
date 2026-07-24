"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Send, Sparkles, MessageSquare, Plus, Clock, BrainCircuit, ChevronRight } from 'lucide-react';
import styles from './Mentor.module.css';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function MentorPage() {
  const { chats, activeChatId, addMessage, createNewChat, setActiveChat, updateChatTitle, user, goals, updateGoal } = useAppStore();
  
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const history = activeChat ? activeChat.messages : [];
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [appliedActions, setAppliedActions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    console.log("Mentor page initialized with live Groq AI");
  }, [history, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    const currentChatId = activeChatId;
    const isFirstMessage = history.length === 0;

    // Add User Message
    addMessage(currentChatId, { sender: 'user', text: userMessage });
    setInputValue('');
    setIsTyping(true);

    try {
      if (isFirstMessage) {
        // Generate title in background
        fetch('http://localhost:8000/api/chat-title', {
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

      const response = await fetch('http://localhost:8000/api/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages, goals }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from API');
      }

      const data = await response.json();
      
      setIsTyping(false);
      addMessage(currentChatId, { 
        sender: 'ai', 
        text: data.content || "I'm having trouble thinking right now."
      });
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsTyping(false);
      addMessage(currentChatId, { 
        sender: 'ai', 
        text: "Sorry, I'm having trouble connecting right now. Please try again later." 
      });
    }
  };

  const handleApplyChange = (msgId: string) => {
    // Hardcoded logic for the specific mock message
    updateGoal('g2', 200);
    setAppliedActions(prev => [...prev, msgId]);
    addMessage(activeChatId, {
      sender: 'ai',
      text: "✅ I've successfully reallocated $200 towards your Credit Card Debt. Your goals have been updated!"
    });
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
            <button className={styles.newChatBtn} onClick={() => createNewChat('New Chat')}>
              <Plus size={16} /> New Chat
            </button>
            <div className={styles.historyList}>
              <span className={styles.historyLabel}>Recent Chats</span>
              {chats.map(chat => (
                <button 
                  key={chat.id}
                  className={styles.historyItem}
                  onClick={() => setActiveChat(chat.id)}
                  style={chat.id === activeChatId ? { backgroundColor: 'var(--color-surface-bg)', color: 'var(--color-text-primary)' } : {}}
                >
                  <MessageSquare size={14} /> {chat.title}
                </button>
              ))}
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
                          <button 
                            onClick={() => handleApplyChange(msg.id)}
                            disabled={appliedActions.includes(msg.id)}
                          >
                            {appliedActions.includes(msg.id) ? 'Applied ✅' : 'Apply Changes'}
                          </button>
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
                  <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
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
