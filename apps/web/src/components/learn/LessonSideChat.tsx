"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAppStore } from '@/store/useAppStore';
import { RichMessage } from '../mentor/RichMessage';
import styles from './LessonSideChat.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonSideChatProps {
  lessonId: string;
  lessonContext: { 
    lessonTitle: string; 
    chapterTitle: string;
    content: string; 
    specificContext?: string 
  };
  contextMode?: 'reading' | 'quiz' | 'summary';
  initialPrompt?: string | null;
  onInitialPromptSent?: () => void;
  onStateChange?: (isExpanded: boolean) => void;
}

const LOADING_MESSAGES = [
  "Reviewing the current topic...",
  "Preparing a real-world example...",
  "Finding a simpler way to explain this...",
  "Connecting concepts...",
  "Analyzing the quiz question..."
];

export const LessonSideChat: React.FC<LessonSideChatProps> = ({ 
  lessonId,
  lessonContext, 
  contextMode = 'reading',
  initialPrompt,
  onInitialPromptSent,
  onStateChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const user = useAppStore(state => state.user);
  const goals = useAppStore(state => state.goals);
  
  const lessonChats = useAppStore(state => state.lessonChats);
  const updateLessonChat = useAppStore(state => state.updateLessonChat);
  const messages = lessonChats[lessonId] || [];

  const processedPrompt = useRef<string | null>(null);

  // Auto-send initial prompt if provided
  useEffect(() => {
    if (initialPrompt && processedPrompt.current !== initialPrompt) {
      processedPrompt.current = initialPrompt;
      setIsExpanded(true);
      handleSend(initialPrompt);
      if (onInitialPromptSent) {
        onInitialPromptSent();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // Sync state to parent
  useEffect(() => {
    if (onStateChange) {
      onStateChange(isExpanded);
    }
  }, [isExpanded, onStateChange]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Scroll to bottom
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isExpanded]);

  // Cycle loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTyping) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  const getSuggestions = () => {
    if (contextMode === 'quiz') {
      return [
        "Give me a hint",
        "Explain the concept being tested",
        "Break this into smaller steps",
        "What should I think about?"
      ];
    }
    return [
      "Explain this lesson in simpler words",
      "Give me a real-life example",
      "How does this affect my finances?",
      "What mistakes do beginners make?",
      "Summarize this chapter"
    ];
  };

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { id: Date.now().toString(), sender: 'user' as const, text }];
    updateLessonChat(lessonId, newMessages);
    
    if (text === inputValue) setInputValue('');
    setIsTyping(true);
    setLoadingMsgIdx(0);

    try {
      const aiSettings = useSettingsStore.getState().aiMentor;

      const apiMessages = newMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: apiMessages, 
          goals, 
          aiSettings, 
          userName: user.name,
          isTutorMode: true,
          tutorContext: lessonContext
        }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      setIsTyping(false);
      
      updateLessonChat(lessonId, [...newMessages, { 
        id: (Date.now() + 1).toString(),
        sender: 'ai', 
        text: data.content || "I couldn't process that right now."
      }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsTyping(false);
      updateLessonChat(lessonId, [...newMessages, { 
        id: (Date.now() + 1).toString(),
        sender: 'ai', 
        text: "I'm having trouble connecting right now. Please try again later."
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Parse Follow-ups from AI text
  const renderMessageContent = (text: string) => {
    // Look for FOLLOWUPS: ["q1", "q2", "q3"] at the end of the text
    const followUpsRegex = /FOLLOWUPS:\s*(\[.*\])/;
    const match = text.match(followUpsRegex);
    
    let cleanText = text;
    let followUps: string[] = [];
    
    if (match) {
      cleanText = text.replace(match[0], '').trim();
      try {
        followUps = JSON.parse(match[1]);
      } catch (e) {
        console.error("Failed to parse followups", e);
      }
    }

    return (
      <>
        <RichMessage content={cleanText} />
        {followUps.length > 0 && (
          <div className={styles.followUpContainer}>
            {followUps.map((q, i) => (
              <button key={i} className={styles.followUpChip} onClick={() => handleSend(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.chatWrapper}>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div 
            className={styles.collapsedPill}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
          >
            <Sparkles className={styles.pillIcon} size={20} />
            <span className={styles.pillText}>AI Mentor</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className={styles.chatPanel}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <Sparkles size={16} /> Learning Companion
              </div>
              <button className={styles.closeBtn} onClick={() => setIsExpanded(false)} title="Collapse Chat">
                <X size={18} />
              </button>
            </div>

            <div className={styles.messagesArea}>
              {messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <Sparkles size={32} className={styles.emptyStateIcon} />
                  <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>I'm your Learning Companion.</h3>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                    I know you're currently studying <strong>{lessonContext.chapterTitle}</strong>. 
                    I won't give away answers, but I'll help you understand every concept deeply. Ask me anything!
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.wrapperUser : styles.wrapperAi}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className={styles.aiAvatar}>
                        <Sparkles size={14} />
                      </div>
                    )}
                    <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                      {msg.sender === 'user' ? msg.text : renderMessageContent(msg.text)}
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
                  <div className={styles.aiAvatar}><Loader2 size={14} className="animate-spin" /></div>
                  <div>
                    <div className={`${styles.messageBubble} ${styles.bubbleAi}`}>
                      <div className={styles.typingIndicator}>
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                    <div className={styles.loadingContext}>{LOADING_MESSAGES[loadingMsgIdx]}</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {!isTyping && messages.length === 0 && (
              <div className={styles.suggestionsArea}>
                <p className={styles.suggestionsTitle}>Examples of queries:</p>
                {getSuggestions().map((suggestion, idx) => (
                  <button 
                    key={idx} 
                    className={styles.suggestionChip}
                    onClick={() => handleSend(suggestion)}
                  >
                    <span>{suggestion}</span>
                    <ChevronRight size={14} className={styles.suggestionArrow} />
                  </button>
                ))}
              </div>
            )}

            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <textarea 
                  ref={textareaRef}
                  placeholder="Ask a question..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button 
                  className={styles.sendBtn} 
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
