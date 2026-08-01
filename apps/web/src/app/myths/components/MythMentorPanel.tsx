import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, ExternalLink } from 'lucide-react';
import styles from './MythMentorPanel.module.css';
import { RichMessage } from '@/components/mentor/RichMessage';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

interface MythMentorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialMyth: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function MythMentorPanel({ isOpen, onClose, initialMyth }: MythMentorPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMyth = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && initialMyth && processedMyth.current !== initialMyth) {
      processedMyth.current = initialMyth;
      handleSend(initialMyth);
    }
  }, [isOpen, initialMyth]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: text }
    ];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          isTutorMode: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([
          ...newMessages,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: data.content }
        ]);
      } else {
        setMessages([
          ...newMessages,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "I'm having trouble connecting to my brain right now." }
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: "Network error occurred." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const goToMentor = () => {
    useAppStore.getState().createNewChat('Deep Dive: Myth vs Fact');
    sessionStorage.setItem('mentorDraft', `Please verify this financial myth/fact: "${initialMyth}"`);
    router.push(`/mentor`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.panel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}>
                  <Bot size={20} color="#fff" />
                </div>
                <div>
                  <h3>AI Mentor</h3>
                  <p>Fact-checking your financial myths</p>
                </div>
              </div>
              <button className={styles.closeButton} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.ecosystemBanner}>
              <button className={styles.ecosystemBtn} onClick={goToMentor}>
                Continue in Full AI Mentor <ExternalLink size={14} />
              </button>
            </div>

            <div className={styles.messagesContainer}>
              {messages.length === 0 && !isTyping && (
                <div className={styles.emptyState}>
                  <Sparkles size={32} color="#29A367" />
                  <p>Submit a myth to see the truth!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}>
                  {msg.role === 'assistant' && (
                    <div className={styles.messageAvatar}>
                      <Bot size={16} color="#fff" />
                    </div>
                  )}
                  <div className={styles.messageBubble}>
                    {msg.role === 'user' ? msg.content : <RichMessage content={msg.content} />}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.message} ${styles.messageAssistant}`}>
                  <div className={styles.messageAvatar}>
                    <Bot size={16} color="#fff" />
                  </div>
                  <div className={styles.typingIndicator}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <input 
                type="text" 
                placeholder="Ask a follow up question..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                className={styles.sendButton}
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
