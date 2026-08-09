"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Send, Mic, Sparkles, PanelLeft, PanelLeftClose, ChevronRight, Home, LineChart, ShieldCheck, BookOpen, Paperclip, X } from 'lucide-react';
import styles from './Mentor.module.css';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSidebar } from '@/components/mentor/ChatSidebar';
import { RichMessage } from '@/components/mentor/RichMessage';
import { triggerProgression } from '@/services/progressionEngine';

export default function MentorPage() {
  const { chats, activeChatId, addMessage, createNewChat, user, goals, updateGoal, addGoal, updateChatTitle } = useAppStore();
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency) || 'USD';
  const profileName = useSettingsStore(state => state.profile?.name) || user.name || 'User';
  
  const activeChat = chats.find(c => c.id === activeChatId);
  const history = activeChat ? activeChat.messages : [];
  
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      if (textarea.value === '') {
        textarea.style.height = 'auto';
        return;
      }
      textarea.style.height = '0px';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatId]);

  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping]);

  useEffect(() => {
    const draft = sessionStorage.getItem('mentorDraft');
    const hiddenContext = sessionStorage.getItem('mentor_hidden_context');
    if (draft) {
      setInputValue(draft);
      sessionStorage.removeItem('mentorDraft');
    }
    if (hiddenContext) {
      handleSendHiddenContext(hiddenContext);
      sessionStorage.removeItem('mentor_hidden_context');
    }
  }, []);

  const SUGGESTED_PROMPTS = [
    { label: "Explain compound interest simply", icon: Sparkles },
    { label: "AI financial advice vs index funds", icon: Sparkles },
    { label: "Generate a step-by-step plan to buy a house", icon: Home },
    { label: "Analyze my current portfolio for improvements", icon: LineChart },
    { label: "How to build a $10k emergency fund", icon: ShieldCheck },
    { label: "How does tax loss harvesting work?", icon: BookOpen },
    { label: "What is dollar-cost averaging?", icon: LineChart },
    { label: "Help me create a monthly budget", icon: BookOpen }
  ];

  const [randomPrompts, setRandomPrompts] = useState<typeof SUGGESTED_PROMPTS>([]);

  useEffect(() => {
    const shuffled = [...SUGGESTED_PROMPTS].sort(() => 0.5 - Math.random());
    setRandomPrompts(shuffled.slice(0, 3));
  }, []);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const img = new Image();
        img.src = result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setSelectedImage(compressed);
        };
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedImage) return;
    
    let currentChatId = activeChatId;
    const userMessage = inputValue;
    const currentImage = selectedImage;
    
    setInputValue('');
    setSelectedImage(null);

    const newTitle = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '') || 'Image Upload';

    // If there is no active chat (empty state), create one
    if (!currentChatId || !activeChat) {
      currentChatId = createNewChat(newTitle);
    } else if (history.length === 0) {
      updateChatTitle(currentChatId, newTitle);
    }

    addMessage(currentChatId, { sender: 'user', text: userMessage, imageBase64: currentImage || undefined });
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

      const aiSettings = useSettingsStore.getState().aiMentor;
      
      // Prepare messages payload for backend
      const apiMessages = aiSettings.rememberChatHistory ? history.map(msg => ({
        role: (msg.sender === 'user' || msg.sender === 'system') ? 'user' : 'assistant',
        content: msg.text,
        image_base64: msg.imageBase64
      })) : [];
      
      apiMessages.push({ role: 'user', content: userMessage, image_base64: currentImage || undefined });

      const apiUrl = '/api';
      const response = await fetch(`${apiUrl}/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, goals, aiSettings, userName: user.name }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      
      setIsTyping(false);
      
      let aiResponseText = data.content || "I'm having trouble thinking right now.";
      
      // Intercept UPDATE_GOAL tool calls
      const updateGoalMatch = aiResponseText.match(/\[ACTION:\s*UPDATE_GOAL,\s*goal_id:\s*"([^"]+)",\s*amount:\s*([-\d]+)\]/i);
      if (updateGoalMatch) {
         const gId = updateGoalMatch[1];
         const amount = parseInt(updateGoalMatch[2], 10);
         updateGoal(gId, amount);
      }

      // Intercept CREATE_GOAL tool calls
      const createGoalMatch = aiResponseText.match(/\[ACTION:\s*CREATE_GOAL,\s*name:\s*"([^"]+)",\s*target:\s*(\d+),\s*deadline:\s*"([^"]+)",\s*category:\s*"([^"]+)"\]/i);
      if (createGoalMatch) {
        addGoal({
          name: createGoalMatch[1],
          target: parseInt(createGoalMatch[2], 10),
          deadline: createGoalMatch[3],
          category: createGoalMatch[4] as any,
          currency: preferredCurrency,
        });
      }
      
      addMessage(currentChatId, { 
        sender: 'ai', 
        text: aiResponseText
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

  const handleSendHiddenContext = async (hiddenText: string) => {
    let currentChatId = activeChatId;
    if (!currentChatId || !activeChat) {
      currentChatId = createNewChat("Trade Discussion");
    }

    addMessage(currentChatId, { sender: 'system', text: hiddenText, isHiddenContext: true });
    setIsTyping(true);

    try {
      const aiSettings = useSettingsStore.getState().aiMentor;
      // Get history up to this point
      const currentHistory = useAppStore.getState().chats.find(c => c.id === currentChatId)?.messages || [];
      
      const apiMessages = currentHistory.map(msg => ({
        role: (msg.sender === 'user' || msg.sender === 'system') ? 'user' : 'assistant',
        content: msg.text
      }));

      const apiUrl = '/api';
      const response = await fetch(`${apiUrl}/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, goals, aiSettings, userName: user.name }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      
      triggerProgression('MENTOR_QUESTION', 'learning');
      
      setIsTyping(false);
      
      const aiResponseText = data.content || "I'm having trouble thinking right now.";
      addMessage(currentChatId, { sender: 'ai', text: aiResponseText });
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsTyping(false);
      addMessage(currentChatId, { sender: 'ai', text: "I'm here to discuss your trade. What specifically would you like to explore?" });
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

  const visibleHistory = history.filter(msg => !msg.isHiddenContext);
  const isEmptyState = visibleHistory.length === 0;

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
              {isSidebarOpen ? <PanelLeftClose size={26} /> : <PanelLeft size={26} />}
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
                <motion.h1>{getGreeting()}, {profileName.split(' ')[0]}</motion.h1>
                <motion.p>
                  Your personal AI financial mentor. <br />
                  Ask questions, review your portfolio, understand markets, or learn investing with personalized guidance.
                </motion.p>
              </motion.div>
            ) : (
              <div className={styles.messagesContainer}>
                <AnimatePresence initial={false}>
                  {visibleHistory.map((msg, index) => (
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
                          <>
                            {msg.imageBase64 && (
                              <img 
                                src={msg.imageBase64} 
                                alt="User upload" 
                                style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '8px', maxHeight: '300px', objectFit: 'contain' }} 
                              />
                            )}
                            {msg.text}
                          </>
                        ) : (
                          <>
                            {/* Occasional Context Note */}
                            {index === 1 && (
                              <div className={styles.contextNote}>
                                <Sparkles size={12} /> AI remembers your Guardian investor profile.
                              </div>
                            )}
                            <RichMessage content={msg.text} onActionClick={handleSendHiddenContext} />
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
                      {randomPrompts.map((prompt, i) => {
                        return (
                          <motion.button 
                            key={i} 
                            className={styles.exampleBtn}
                            onClick={() => setInputValue(prompt.label)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: 0.05 + (i * 0.05),
                              type: "spring",
                              stiffness: 300,
                              damping: 24
                            }}
                          >
                            <div className={styles.exampleBtnLeft}>
                              <span>{prompt.label}</span>
                            </div>
                            <ChevronRight size={14} className={styles.exampleArrow} />
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedImage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    style={{ marginBottom: '12px', position: 'relative', display: 'inline-block' }}
                  >
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      style={{ height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} 
                    />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'white', borderRadius: '50%', padding: '4px', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} color="#8c9091" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={styles.inputWrapper}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', paddingBottom: '4px' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload} 
                  />
                  <button 
                    className={styles.inputIconBtn} 
                    title="Attach Image"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip size={20} />
                  </button>
                  <button 
                    className={`${styles.inputIconBtn} ${isListening ? styles.listening : ''}`} 
                    title="Voice Input"
                    onClick={handleVoiceInput}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <textarea 
                  ref={textareaRef}
                  placeholder="Ask about investing, budgeting, scams, savings..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  rows={1}
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                />
                <button 
                  className={styles.sendBtn} 
                  onClick={handleSend}
                  disabled={!inputValue.trim() && !selectedImage}
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
