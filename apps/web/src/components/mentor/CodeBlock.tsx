import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div style={{ margin: '1rem 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #374151', backgroundColor: '#1E1E1E' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', backgroundColor: '#2d2d2d', color: '#9CA3AF', fontSize: '0.8rem', fontFamily: 'monospace' }}>
        <span style={{ textTransform: 'lowercase' }}>{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#9CA3AF', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            transition: 'color 0.2s'
          }}
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} color="#10B981" /> 
              <span style={{ color: '#10B981' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} /> 
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'javascript'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '16px', fontSize: '0.9rem', backgroundColor: '#1E1E1E' }}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
