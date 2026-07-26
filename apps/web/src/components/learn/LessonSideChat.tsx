"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAppStore } from '@/store/useAppStore';
import { RichMessage } from '../mentor/RichMessage';
import styles from './LessonSideChat.module.css';

interface LessonSideChatProps {
  lessonContext: { title: string; content: string };
  onClose: () => void;
  initialPrompt?: string | null;
  onInitialPromptSent?: () => void;
}

export const LessonSideChat: React.FC<LessonSideChatProps> = ({ 
  lessonContext, 
  onClose, 
  initialPrompt,
  onInitialPromptSent 
}) => {
  const [messages, setMessages] = useState<{ id: string; sender: 'user' | 'ai'; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [width, setWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAppStore(state => state.user);
  const goals = useAppStore(state => state.goals);

  const processedPrompt = useRef<string | null>(null);

  // Auto-send initial prompt if provided
  useEffect(() => {
    if (initialPrompt && processedPrompt.current !== initialPrompt) {
      processedPrompt.current = initialPrompt;
      handleSend(initialPrompt);
      if (onInitialPromptSent) {
        onInitialPromptSent();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Resizing logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      // Calculate new width based on mouse position relative to the right edge of the screen
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 600) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now().toString(), sender: 'user' as const, text };
    if (isMounted.current) setMessages(prev => [...prev, userMessage]);
    if (text === inputValue && isMounted.current) setInputValue('');
    if (isMounted.current) setIsTyping(true);

    try {
      const aiSettings = useSettingsStore.getState().aiMentor;

      // Prepare messages for backend
      // We inject a system prompt so the AI knows the context of the lesson
      const systemContext = `You are FinWise AI. The user is currently reading a lesson titled "${lessonContext.title}". Here is the content of the lesson: "${lessonContext.content.substring(0, 2000)}...". Please answer their questions in the context of this lesson. Keep answers concise as this is a side panel.`;

      const apiMessages = [
        { role: 'system', content: systemContext },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: text }
      ];

      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, goals, aiSettings, userName: user.name }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      
      if (!isMounted.current) return;
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        sender: 'ai', 
        text: data.content || "I couldn't process that right now."
      }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      if (!isMounted.current) return;
      setIsTyping(false);
      setMessages(prev => [...prev, { 
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

  return (
    <div 
      className={`${styles.chatPanel} ${isDragging ? styles.isDragging : ''}`} 
      style={{ width: `${width}px` }}
    >
      <div 
        className={styles.resizeHandle} 
        onMouseDown={() => setIsDragging(true)}
      />
      
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Sparkles size={16} /> AI Mentor
        </div>
        <button className={styles.closeBtn} onClick={onClose} title="Close Chat">
          <X size={18} />
        </button>
      </div>

      <div className={styles.messagesArea}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <Sparkles size={24} className={styles.emptyStateIcon} />
            <p>Ask me anything about <strong>{lessonContext.title}</strong></p>
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
                {msg.sender === 'user' ? msg.text : <RichMessage content={msg.text} />}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
            <div className={styles.aiAvatar}><Sparkles size={14} /></div>
            <div className={`${styles.messageBubble} ${styles.bubbleAi}`}>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

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
        <p className={styles.disclaimer}>AI can make mistakes.</p>
      </div>
    </div>
  );
};
