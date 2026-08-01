import React, { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, MoreHorizontal, Inbox, Pencil, Trash2 } from 'lucide-react';
import styles from '../../app/mentor/Mentor.module.css';
import { useAppStore } from '@/store/useAppStore';

export function ChatSidebar() {
  const { chats, activeChatId, setActiveChat, createNewChat, deleteChat, updateChatTitle } = useAppStore();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRenameSubmit = (chatId: string) => {
    if (editTitle.trim()) {
      updateChatTitle(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isYesterday = (dateString: string) => {
    const d = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();
  };

  const todayChats = chats.filter(c => isToday(c.updatedAt));
  const yesterdayChats = chats.filter(c => isYesterday(c.updatedAt));
  const olderChats = chats.filter(c => !isToday(c.updatedAt) && !isYesterday(c.updatedAt));

  const renderGroup = (label: string, groupChats: typeof chats) => {
    if (groupChats.length === 0) return null;
    return (
      <div className={styles.sidebarGroup}>
        <div className={styles.historyLabel}>{label}</div>
        <div className={styles.historyList}>
          {groupChats.map(chat => (
            <div
              key={chat.id}
              className={`${styles.historyItem} ${chat.id === activeChatId ? styles.historyItemActive : ''}`}
              onClick={() => setActiveChat(chat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveChat(chat.id);
                }
              }}
            >
              <div className={styles.historyItemContent}>
                <MessageSquare size={14} />
                {editingChatId === chat.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    className={styles.chatTitleInput}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(chat.id);
                      if (e.key === 'Escape') setEditingChatId(null);
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className={styles.chatTitle}>{chat.title}</span>
                )}
              </div>
              <div className={`${styles.hoverMenu} ${activeDropdown === chat.id ? styles.hoverMenuActive : ''}`} ref={activeDropdown === chat.id ? dropdownRef : null}>
                <button 
                  title="More options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === chat.id ? null : chat.id);
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>
                
                {activeDropdown === chat.id && (
                  <div className={styles.dropdownMenu}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTitle(chat.title);
                        setEditingChatId(chat.id);
                        setActiveDropdown(null);
                      }}
                    >
                      <Pencil size={12} /> Rename
                    </button>
                    <button 
                      className={styles.deleteOption}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                        setActiveDropdown(null);
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside className={styles.historySidebar}>
      <button className={styles.newChatBtn} onClick={() => createNewChat('New Conversation')}>
        <Plus size={16} /> New Chat
      </button>

      {chats.length === 0 ? (
        <div className={styles.emptySidebar}>
          <Inbox size={32} />
          <p>No conversations yet</p>
        </div>
      ) : (
        <>
          {renderGroup('Today', todayChats)}
          {renderGroup('Yesterday', yesterdayChats)}
          {renderGroup('Earlier', olderChats)}
        </>
      )}
    </aside>
  );
}
