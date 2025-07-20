
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Terminal as TerminalIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'table';
  content: string;
  data?: any[];
  timestamp: Date;
}

interface TerminalProps {
  onExecute: (query: string) => void;
  onSchemaChange: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onExecute, onSchemaChange }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'welcome',
      type: 'output',
      content: 'PostgreSQL Terminal - Type SQL commands and press Enter\nAvailable meta-commands: \\l (list databases), \\dt (list tables), \\d <table> (describe table)',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (type: TerminalLine['type'], content: string, data?: any[]) => {
    const newLine: TerminalLine = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content,
      data,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  const renderTable = (data: any[]) => {
    if (!data || data.length === 0) return null;

    const headers = Object.keys(data[0]);
    const maxWidths = headers.map(header => 
      Math.max(
        header.length, 
        ...data.map(row => {
          const value = row[header];
          if (value === null || value === undefined) return 4; // "NULL"
          if (typeof value === 'object') return JSON.stringify(value).length;
          return String(value).length;
        })
      )
    );

    const separator = '+-' + maxWidths.map(w => '-'.repeat(w)).join('-+-') + '-+';
    const headerRow = '| ' + headers.map((h, i) => h.padEnd(maxWidths[i])).join(' | ') + ' |';
    
    const rows = data.map(row => 
      '| ' + headers.map((h, i) => {
        const value = row[h];
        let displayValue;
        if (value === null || value === undefined) {
          displayValue = 'NULL';
        } else if (typeof value === 'object') {
          displayValue = JSON.stringify(value);
        } else {
          displayValue = String(value);
        }
        return displayValue.padEnd(maxWidths[i]);
      }).join(' | ') + ' |'
    );

    return [separator, headerRow, separator, ...rows, separator].join('\n');
  };

  const executeMetaCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case '\\l':
        try {
          const { data, error } = await supabase
            .rpc('execute_sql', { query_text: "SELECT datname as \"Database\" FROM pg_database WHERE datistemplate = false ORDER BY datname;" });
          
          if (error) {
            addLine('error', `Error: ${error.message}`);
          } else if (data) {
            if (data.error) {
              addLine('error', `Error: ${data.error}`);
            } else if (Array.isArray(data) && data.length > 0) {
              addLine('output', 'List of databases:');
              const tableStr = renderTable(data);
              if (tableStr) {
                addLine('table', tableStr);
              }
            } else {
              addLine('output', 'No databases found.');
            }
          }
        } catch (err: any) {
          addLine('error', `Error: ${err.message}`);
        }
        break;
        
      case '\\dt':
        try {
          const { data, error } = await supabase.rpc('get_table_info');
          
          if (error) {
            addLine('error', `Error: ${error.message}`);
          } else if (data && data.length > 0) {
            addLine('output', 'List of relations:');
            const tableData = data.map(table => ({
              Schema: table.table_schema,
              Name: table.table_name,
              Type: table.table_type,
              Owner: 'postgres'
            }));
            const tableStr = renderTable(tableData);
            if (tableStr) {
              addLine('table', tableStr);
            }
          } else {
            addLine('output', 'No tables found.');
          }
        } catch (err: any) {
          addLine('error', `Error: ${err.message}`);
        }
        break;
        
      default:
        if (cmd.startsWith('\\d ')) {
          const tableName = cmd.substring(3).trim();
          try {
            const { data, error } = await supabase
              .rpc('execute_sql', { 
                query_text: `
                  SELECT 
                    column_name as "Column",
                    data_type as "Type",
                    is_nullable as "Nullable",
                    column_default as "Default"
                  FROM information_schema.columns 
                  WHERE table_name = '${tableName}' 
                  ORDER BY ordinal_position;
                ` 
              });
            
            if (error) {
              addLine('error', `Error: ${error.message}`);
            } else if (data) {
              if (data.error) {
                addLine('error', `Error: ${data.error}`);
              } else if (Array.isArray(data) && data.length > 0) {
                addLine('output', `Table "${tableName}"`);
                const tableStr = renderTable(data);
                if (tableStr) {
                  addLine('table', tableStr);
                }
              } else {
                addLine('error', `Table "${tableName}" does not exist.`);
              }
            }
          } catch (err: any) {
            addLine('error', `Error: ${err.message}`);
          }
        } else {
          addLine('error', `Unknown meta-command: ${command}`);
          addLine('output', 'Available commands:\n  \\l       - List databases\n  \\dt      - List tables\n  \\d table - Describe table');
        }
    }
  };

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Add command line
    addLine('command', `postgres=# ${command}`);

    // Handle special terminal commands
    if (command.toLowerCase() === 'clear') {
      setLines([{
        id: 'welcome-after-clear',
        type: 'output',
        content: 'PostgreSQL Terminal - Type SQL commands and press Enter\nAvailable meta-commands: \\l (list databases), \\dt (list tables), \\d <table> (describe table)',
        timestamp: new Date()
      }]);
      return;
    }

    if (command.toLowerCase() === 'help') {
      addLine('output', 'Available commands:\n  clear    - Clear the terminal\n  help     - Show this help message\n  \\l       - List databases\n  \\dt      - List tables\n  \\d table - Describe table\n  Any SQL command will be executed');
      return;
    }

    if (command.startsWith('\\')) {
      await executeMetaCommand(command);
      return;
    }

    // Execute SQL command and show results in terminal
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query_text: command
      });

      if (error) {
        addLine('error', `Error: ${error.message}`);
      } else if (data) {
        // Check if it's an error response
        if (data.error) {
          addLine('error', `Error: ${data.error}`);
        } else if (data.message) {
          // Non-SELECT query result
          addLine('output', data.message);
        } else if (Array.isArray(data) && data.length > 0) {
          // SELECT query result - show table
          const tableStr = renderTable(data);
          if (tableStr) {
            addLine('table', tableStr);
          }
          addLine('output', `(${data.length} row${data.length !== 1 ? 's' : ''})`);
        } else {
          addLine('output', 'Query executed successfully.');
        }
        
        // Check if it's a schema-changing command
        const lowerCommand = command.toLowerCase().trim();
        if (lowerCommand.includes('create') || lowerCommand.includes('drop') || 
            lowerCommand.includes('alter') || lowerCommand.includes('database')) {
          // Trigger schema refresh
          onSchemaChange();
        }
      }
    } catch (error: any) {
      addLine('error', `Error: ${error.message || 'Unknown error occurred'}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
      setCurrentCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono">
      <div className="p-3 border-b border-green-800 bg-green-950/20">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4" />
          <h3 className="font-semibold">PostgreSQL Terminal</h3>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 space-y-1">
            {lines.map((line) => (
              <div key={line.id}>
                <div
                  className={`text-sm ${
                    line.type === 'command'
                      ? 'text-yellow-400'
                      : line.type === 'error'
                      ? 'text-red-400'
                      : line.type === 'table'
                      ? 'text-cyan-400'
                      : 'text-green-400'
                  }`}
                >
                  {line.type === 'table' ? (
                    <pre className="whitespace-pre font-mono text-xs leading-tight">
                      {line.content}
                    </pre>
                  ) : (
                    <pre className="whitespace-pre-wrap">{line.content}</pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-green-800 bg-green-950/20">
        <div className="flex items-center">
          <span className="text-yellow-400 mr-2">postgres=#</span>
          <Input
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none text-green-400 focus:ring-0 focus:ring-offset-0 p-0"
            placeholder="Enter SQL command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
