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
          {results.map(result => (
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
      )}
      
      {query && !loading && results.length === 0 && (
        <div className={styles.searchResults}>
          <div className={styles.searchEmpty}>No results found for "{query}"</div>
        </div>
      )}
    </div>
  );
};
