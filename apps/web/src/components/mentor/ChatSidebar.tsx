import React from 'react';
import { Plus, MessageSquare, MoreHorizontal, Inbox } from 'lucide-react';
import styles from '../../app/mentor/Mentor.module.css';
import { useAppStore } from '@/store/useAppStore';

export function ChatSidebar() {
  const { chats, activeChatId, setActiveChat, createNewChat } = useAppStore();

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
                <span className={styles.chatTitle}>{chat.title}</span>
              </div>
              <div className={styles.hoverMenu}>
                <button 
                  title="More options"
                  onClick={(e) => {
                    e.stopPropagation();
                    // more options logic
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>
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
