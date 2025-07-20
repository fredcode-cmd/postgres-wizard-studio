
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Terminal as TerminalIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
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
      content: 'PostgreSQL Terminal - Type SQL commands and press Enter',
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

  const addLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeMetaCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case '\\l':
        try {
          const { data, error } = await supabase
            .rpc('execute_sql', { query_text: "SELECT datname as \"Database\" FROM pg_database WHERE datistemplate = false;" });
          
          if (error) {
            addLine('error', `Error: ${error.message}`);
          } else if (data && data[0]) {
            addLine('output', 'List of databases:');
            if (Array.isArray(data[0])) {
              data[0].forEach((db: any) => {
                addLine('output', `  ${db.Database}`);
              });
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
            addLine('output', '  Schema | Name | Type | Owner');
            addLine('output', '  -------|------|------|------');
            data.forEach((table: any) => {
              addLine('output', `  ${table.table_schema} | ${table.table_name} | ${table.table_type} | postgres`);
            });
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
            } else if (data && data[0] && Array.isArray(data[0]) && data[0].length > 0) {
              addLine('output', `Table "${tableName}"`);
              addLine('output', '  Column | Type | Nullable | Default');
              addLine('output', '  -------|------|----------|--------');
              data[0].forEach((col: any) => {
                addLine('output', `  ${col.Column} | ${col.Type} | ${col.Nullable} | ${col.Default || ''}`);
              });
            } else {
              addLine('error', `Table "${tableName}" does not exist.`);
            }
          } catch (err: any) {
            addLine('error', `Error: ${err.message}`);
          }
        } else {
          addLine('error', `Unknown meta-command: ${command}`);
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
      setLines([]);
      return;
    }

    if (command.toLowerCase() === 'help') {
      addLine('output', 'Available commands:');
      addLine('output', '  clear    - Clear the terminal');
      addLine('output', '  help     - Show this help message');
      addLine('output', '  \\l       - List databases');
      addLine('output', '  \\dt      - List tables');
      addLine('output', '  \\d table - Describe table');
      addLine('output', '  Any SQL command will be executed');
      return;
    }

    if (command.startsWith('\\')) {
      await executeMetaCommand(command);
      return;
    }

    // Execute SQL command silently (no toast)
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query_text: command
      });

      if (error) {
        addLine('error', `Error: ${error.message}`);
      } else {
        addLine('output', `Query executed successfully.`);
        
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
              <div
                key={line.id}
                className={`text-sm ${
                  line.type === 'command'
                    ? 'text-yellow-400'
                    : line.type === 'error'
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}
              >
                {line.content}
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
