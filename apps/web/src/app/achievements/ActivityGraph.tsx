import React, { useMemo } from 'react';
import { formatDate, getLocalISODate } from '@/utils/formatters';
import styles from './Progression.module.css';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ActivityGraphProps {
  activityData: Record<string, { xp: number; types: string[] }>;
}

export const ActivityGraph: React.FC<ActivityGraphProps> = ({ activityData }) => {
  const { weeks, monthLabels } = useMemo(() => {
    const w = [];
    const mLabels: { label: string; weekIndex: number }[] = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start from Sunday 52 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    while (start.getDay() !== 0) {
      start.setDate(start.getDate() - 1);
    }
    
    let currentWeek = [];
    let currentDay = new Date(start);
    let lastMonth = -1;
    let weekIndex = 0;
    
    while (currentDay <= today) {
      const dateStr = getLocalISODate(currentDay);
      const data = activityData[dateStr] || { xp: 0, types: [] };
      
      let intensity = 0;
      if (data.xp > 0) intensity = 1;
      if (data.xp > 50) intensity = 2;
      if (data.xp > 150) intensity = 3;
      if (data.xp > 400) intensity = 4;

      currentWeek.push({
        date: dateStr,
        xp: data.xp,
        intensity
      });
      
      if (currentWeek.length === 1 && currentDay.getDate() <= 7) {
         // rough way to add month label if it's the first week of the month
         const month = currentDay.getMonth();
         if (month !== lastMonth) {
            mLabels.push({
               label: SHORT_MONTHS[month],
               weekIndex: weekIndex
            });
            lastMonth = month;
         }
      }

      if (currentWeek.length === 7) {
        // Also check if the month changed in the middle of the week for the first week we're logging
        if (weekIndex === 0 && mLabels.length === 0) {
             const m = currentDay.getMonth();
             mLabels.push({
               label: SHORT_MONTHS[m],
               weekIndex: weekIndex
             });
             lastMonth = m;
        }

        w.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      w.push(currentWeek);
    }
    
    return { weeks: w, monthLabels: mLabels };
  }, [activityData]);

  const getIntensityClass = (level: number) => {
    switch (level) {
      case 1: return styles.graphLevel1;
      case 2: return styles.graphLevel2;
      case 3: return styles.graphLevel3;
      case 4: return styles.graphLevel4;
      default: return styles.graphLevel0;
    }
  };

  const [tooltip, setTooltip] = React.useState<{ visible: boolean; x: number; y: number; content: string }>({ visible: false, x: 0, y: 0, content: '' });
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks]);

  return (
    <div className={styles.graphCard} style={{ position: 'relative' }}>
      <div className={styles.graphHeader}>
        <h3>Activity Graph</h3>
        <p>Keep your graph green by earning XP every day.</p>
      </div>
      
      <div className={styles.graphContainer}>
        <div className={styles.graphLabelsY}>
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        
        <div className={styles.graphScrollArea} ref={scrollRef}>
          <div className={styles.graphLabelsX}>
            {monthLabels.map((m, i) => (
              <span key={i} style={{ left: `${m.weekIndex * (14 + 3)}px` }}>
                {m.label}
              </span>
            ))}
          </div>
          
          <div className={styles.graphGrid}>
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className={styles.graphColumn}>
                {week.map((day, dIdx) => (
                  <div 
                    key={day.date} 
                    className={`${styles.graphCell} ${getIntensityClass(day.intensity)}`}
                    onMouseEnter={(e) => {
                      const cellRect = e.currentTarget.getBoundingClientRect();
                      const card = e.currentTarget.closest(`.${styles.graphCard}`);
                      if (card) {
                        const cardRect = card.getBoundingClientRect();
                        setTooltip({
                          visible: true,
                          x: (cellRect.left - cardRect.left) + (cellRect.width / 2),
                          y: (cellRect.top - cardRect.top) - 6,
                          content: `${formatDate(day.date)}: ${day.xp} XP`
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className={styles.graphLegend}>
        <span>Less</span>
        <div className={`${styles.graphCell} ${styles.graphLevel0}`} />
        <div className={`${styles.graphCell} ${styles.graphLevel1}`} />
        <div className={`${styles.graphCell} ${styles.graphLevel2}`} />
        <div className={`${styles.graphCell} ${styles.graphLevel3}`} />
        <div className={`${styles.graphCell} ${styles.graphLevel4}`} />
        <span>More</span>
      </div>

      {tooltip.visible && (
        <div 
          style={{
            position: 'absolute',
            top: tooltip.y,
            left: tooltip.x,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(15, 23, 42, 0.95)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
        >
          {tooltip.content}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '6px 6px 0',
            borderStyle: 'solid',
            borderColor: 'rgba(15, 23, 42, 0.95) transparent transparent transparent',
          }} />
        </div>
      )}
    </div>
  );
};
