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

export function RichMessage({ content }: RichMessageProps) {
  // A simple parser to make the AI responses look like structured premium blocks.
  // We'll split by common markdown headers (## or ###) or bold patterns.
  
  // If the content is just plain text without much structure, we just return it nicely.
  if (!content.includes('##') && !content.includes('**')) {
    return <div className={styles.richText}>{content}</div>;
  }

  // Simple heuristic parsing for demonstration
  // Split by double newline to get blocks
  const blocks = content.split('\n\n');

  return (
    <div>
      {blocks.map((block, idx) => {
        const lowerBlock = block.toLowerCase();
        let icon = <FileText size={16} />;
        let title = '';
        let textContent = block;

        // Extract title if block starts with ## or ###
        const match = block.match(/^(?:###|##)\s*(.+)$/m);
        if (match) {
          title = match[1];
          textContent = block.replace(/^(?:###|##)\s*(.+)$/m, '').trim();
        } else if (block.startsWith('**') && block.includes('**:')) {
          // Alternative format: **Summary**: text
          const splitPoint = block.indexOf('**:');
          title = block.substring(2, splitPoint).trim();
          textContent = block.substring(splitPoint + 3).trim();
        }

        if (title) {
          const lowerTitle = title.toLowerCase();
          if (lowerTitle.includes('summary')) icon = <FileText size={16} />;
          if (lowerTitle.includes('recommendation') || lowerTitle.includes('action')) icon = <CheckCircle size={16} />;
          if (lowerTitle.includes('risk')) icon = <AlertTriangle size={16} />;
          if (lowerTitle.includes('why this matters') || lowerTitle.includes('takeaway')) icon = <Lightbulb size={16} />;
          if (lowerTitle.includes('lesson')) icon = <BookOpen size={16} />;
          if (lowerTitle.includes('market') || lowerTitle.includes('trend')) icon = <TrendingUp size={16} />;
          if (lowerTitle.includes('goal')) icon = <Target size={16} />;
        }

        return (
          <div key={idx} className={styles.richBlock}>
            {title && (
              <div className={styles.richHeader}>
                {icon}
                <span>{title}</span>
              </div>
            )}
            <div className={styles.richText} dangerouslySetInnerHTML={{ __html: textContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      })}
    </div>
  );
}
