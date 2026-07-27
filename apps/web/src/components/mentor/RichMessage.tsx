import React from 'react';
import { 
  FileText, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle,
  BookOpen
} from 'lucide-react';
import styles from '../../app/mentor/Mentor.module.css';

interface RichMessageProps {
  content: string;
}

const getIconForTitle = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('summary')) return <FileText size={18} />;
  if (lowerTitle.includes('recommendation') || lowerTitle.includes('action')) return <CheckCircle size={18} />;
  if (lowerTitle.includes('risk') || lowerTitle.includes('warning')) return <AlertTriangle size={18} />;
  if (lowerTitle.includes('why this matters') || lowerTitle.includes('takeaway')) return <Lightbulb size={18} />;
  if (lowerTitle.includes('lesson')) return <BookOpen size={18} />;
  if (lowerTitle.includes('market') || lowerTitle.includes('trend')) return <TrendingUp size={18} />;
  if (lowerTitle.includes('goal')) return <Target size={18} />;
  return <FileText size={18} />;
};

export function RichMessage({ content }: RichMessageProps) {
  // We'll replace headers with a custom marker so we can split them and inject React icons later
  // Custom marker: :::HEADER:::Title:::
  let preProcessed = content
    // Convert ### Header or ## Header to a custom marker
    .replace(/^(?:###|##|#)\s+(.+)$/gm, ':::HEADER:::$1:::')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #111827; font-weight: 600;">$1</strong>')
    // Bullet points
    .replace(/^[\s]*[-*]\s+(.*)$/gm, '<li style="margin-bottom: 0.5rem; color: #374151;">$1</li>')
    // Numbered lists
    .replace(/^[\s]*\d+\.\s+(.*)$/gm, '<li class="ol-item" style="margin-bottom: 0.5rem; color: #374151;">$1</li>')
    // Action Tags
    .replace(/\[ACTION:\s*UPDATE_GOAL,\s*goal_id:\s*"([^"]+)",\s*amount:\s*([-\d]+)\]/gi, (match, gId, amt) => {
       const amount = parseInt(amt, 10);
       const isAdd = amount > 0;
       const displayAmount = Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
       return `<div style="margin: 1rem 0; padding: 1rem; background-color: ${isAdd ? '#f0fdf4' : '#fff1f2'}; border: 1px solid ${isAdd ? '#bbf7d0' : '#fecdd3'}; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: ${isAdd ? '#166534' : '#9f1239'}; font-weight: 600;">✓ Successfully ${isAdd ? 'added' : 'removed'} ${displayAmount} ${isAdd ? 'to' : 'from'} your goal!</div>`;
    });

  // Wrap lists
  preProcessed = preProcessed
    .replace(/(<li style="margin-bottom: 0.5rem; color: #374151;">.*<\/li>(\n<li style="margin-bottom: 0.5rem; color: #374151;">.*<\/li>)*)/g, '<ul style="padding-left: 1.5rem; margin-bottom: 1.5rem; list-style-type: disc;">$1</ul>')
    .replace(/(<li class="ol-item" style="margin-bottom: 0.5rem; color: #374151;">.*<\/li>(\n<li class="ol-item" style="margin-bottom: 0.5rem; color: #374151;">.*<\/li>)*)/g, '<ol style="padding-left: 1.5rem; margin-bottom: 1.5rem; list-style-type: decimal;">$1</ol>')
    .replace(/class="ol-item" /g, '');

  // Split by double newline to handle paragraphs
  const blocks = preProcessed.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);

  return (
    <div className={styles.richTextContainer} style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
      {blocks.map((block, idx) => {
        
        // Check if this block contains our custom header marker
        if (block.includes(':::HEADER:::')) {
          // Split the block to separate the header from any trailing text (like lists)
          const parts = block.split(':::');
          const title = parts[2]?.replace(/<\/?strong[^>]*>/g, '').replace(/\*/g, '');
          const restOfBlock = parts[3]?.trim();

          return (
            <div key={idx} style={{ marginBottom: '1rem', marginTop: idx > 0 ? '1.5rem' : 0 }}>
              <div 
                className={styles.richHeader} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: '#c8a56e', // Premium gold accent
                  marginBottom: '0.75rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid rgba(200, 165, 110, 0.2)'
                }}
              >
                {getIconForTitle(title || '')}
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.02em', color: '#303A3C' }}>{title}</h3>
              </div>
              {restOfBlock && (
                <div dangerouslySetInnerHTML={{ __html: restOfBlock.replace(/\n/g, '<br/>') }} />
              )}
            </div>
          );
        }
        
        if (block.startsWith('<ul') || block.startsWith('<ol')) {
           return <div key={idx} dangerouslySetInnerHTML={{ __html: block }} />;
        }

        return (
          <p key={idx} style={{ marginBottom: '1rem', color: '#4b5563' }} dangerouslySetInnerHTML={{ __html: block.replace(/\n/g, '<br/>') }} />
        );
      })}
    </div>
  );
}
