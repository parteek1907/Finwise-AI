import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useSymbolSearch } from '../../hooks/useMarket';
import styles from './Market.module.css';

interface SearchBarProps {
  onSelect: (symbol: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const { results, loading } = useSymbolSearch(query);

  const handleSelect = (symbol: string) => {
    setQuery('');
    onSelect(symbol);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search symbols or companies..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
        {loading && <Loader2 size={16} className={styles.spinner} />}
      </div>
      
      {query && results.length > 0 && (
        <div className={styles.searchResults}>
          {Object.entries(
            results.reduce((acc, result) => {
              let group = 'General';
              if (['BTC', 'ETH', 'SOL', 'DOGE'].includes(result.symbol)) group = 'Crypto';
              else if (['VOO', 'QQQ', 'SPY', 'GOLD'].includes(result.symbol)) group = 'Indices & ETFs';
              else if (['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'TSLA'].includes(result.symbol)) group = 'Tech';
              
              if (!acc[group]) acc[group] = [];
              acc[group].push(result);
              return acc;
            }, {} as Record<string, typeof results>)
          ).map(([group, groupResults]) => (
            <div key={group} className={styles.searchGroup}>
              <div className={styles.searchGroupHeader}>{group}</div>
              {groupResults.map(result => (
                <div 
                  key={result.symbol} 
                  className={styles.searchResultItem}
                  onClick={() => handleSelect(result.symbol)}
                >
                  <div className={styles.searchResultInfo}>
                    <strong>{result.symbol}</strong>
                    <span>{result.name}</span>
                  </div>
                  <div className={styles.searchResultPrice}>
                    ${result.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      {query && !loading && results.length === 0 && (
        <div className={styles.searchResults}>
          <div className={styles.searchEmpty}>No results found for "{query}"</div>
        </div>
      )}
    </div>
  );
};
