import React, { useState } from 'react';
import { Lightbulb, Info, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './EducationalInsights.module.css';

interface EducationalInsightsProps {
  symbol: string;
}

export const EducationalInsights: React.FC<EducationalInsightsProps> = ({ symbol }) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const insights = [
    {
      title: 'What is a Market Order?',
      content: 'A market order is a request to buy or sell a stock immediately at the best available current price. While it guarantees the trade will execute, it does not guarantee the exact price you will pay, especially in fast-moving markets.'
    },
    {
      title: 'Why do prices fluctuate?',
      content: 'Prices change based on supply and demand. When more people want to buy a stock (demand) than sell it (supply), the price goes up. Conversely, if more people want to sell, the price goes down. Factors like company earnings, economic news, and global events drive these desires.'
    },
    {
      title: `Trading ${symbol}`,
      content: `Before placing a trade on ${symbol}, consider your overall portfolio diversification. Does this asset class concentrate your risk? It's always best to use the simulator to test your thesis before risking real capital.`
    }
  ];

  return (
    <div className={styles.insightsContainer}>
      <div className={styles.header}>
        <Lightbulb className={styles.icon} size={20} />
        <h3>Learn Before You Trade</h3>
      </div>
      
      <div className={styles.accordion}>
        {insights.map((insight, index) => (
          <div key={index} className={styles.item}>
            <button 
              className={styles.itemHeader}
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
            >
              <div className={styles.itemTitle}>
                <Info size={16} className={styles.infoIcon} />
                <span>{insight.title}</span>
              </div>
              {expandedSection === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSection === index && (
              <div className={styles.itemContent}>
                <p>{insight.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
