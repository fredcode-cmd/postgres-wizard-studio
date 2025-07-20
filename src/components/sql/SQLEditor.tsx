
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  tables: string[];
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onExecute,
  tables
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // PostgreSQL keywords for auto-completion
  const pgKeywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'TABLE', 'INDEX', 'VIEW', 'TRIGGER', 'FUNCTION', 'PROCEDURE', 'DATABASE', 'SCHEMA',
    'PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'NOT NULL', 'DEFAULT', 'CHECK', 'REFERENCES',
    'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'DISTINCT', 'ALL', 'ANY', 'SOME',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'GREATEST', 'LEAST',
    'CAST', 'EXTRACT', 'DATE_PART', 'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursor = e.target.selectionStart;
    onChange(newValue);
    setCursorPosition(cursor);

    // Get current word being typed
    const beforeCursor = newValue.substring(0, cursor);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1].toUpperCase();

    if (currentWord.length > 0) {
      const matchingSuggestions = [
        ...pgKeywords.filter(keyword => 
          keyword.startsWith(currentWord) && keyword !== currentWord
        ),
        ...tables.filter(table => 
          table.toUpperCase().startsWith(currentWord) && table.toUpperCase() !== currentWord
        )
      ].slice(0, 10);

      setSuggestions(matchingSuggestions);
      setShowSuggestions(matchingSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
      e.preventDefault();
      onExecute();
    }

    if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      insertSuggestion(suggestions[0]);
    }

    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];
    const beforeCurrentWord = beforeCursor.substring(0, beforeCursor.length - currentWord.length);
    
    const newValue = beforeCurrentWord + suggestion + afterCursor;
    onChange(newValue);
    setShowSuggestions(false);

    // Set cursor position after the inserted suggestion
    setTimeout(() => {
      const newCursorPos = beforeCurrentWord.length + suggestion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const formatSQL = () => {
    // Basic SQL formatting
    let formatted = value
      .replace(/\s+/g, ' ')
      .replace(/,/g, ',\n  ')
      .replace(/\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING|UNION)\b/gi, '\n$1')
      .replace(/\b(INNER|LEFT|RIGHT|FULL)\s+(JOIN)\b/gi, '\n$1 $2')
      .trim();
    
    onChange(formatted);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Button onClick={onExecute} size="sm" className="gap-2">
            <Play className="h-3 w-3" />
            Run
          </Button>
          <Button onClick={formatSQL} size="sm" variant="outline">
            Format
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Press F5 or Ctrl+Enter to execute • Tab for autocomplete
        </div>
      </div>

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 font-mono text-sm bg-background border-none outline-none resize-none"
          placeholder="Enter your SQL query here..."
          spellCheck={false}
        />

        {/* Auto-completion suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-16 left-4 bg-popover border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-accent cursor-pointer text-sm font-mono"
                onClick={() => insertSuggestion(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
