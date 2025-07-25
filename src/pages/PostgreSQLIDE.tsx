
import React, { useState, useRef, useEffect } from 'react';
import { SQLEditor } from '@/components/sql/SQLEditor';
import { QueryResults } from '@/components/sql/QueryResults';
import { DatabaseExplorer } from '@/components/sql/DatabaseExplorer';
import { QueryHistory } from '@/components/sql/QueryHistory';
import { Terminal } from '@/components/sql/Terminal';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, Database, History, Terminal as TerminalIcon, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface QueryResult {
  id: string;
  query: string;
  result?: any[];
  error?: string;
  executionTime: number;
  timestamp: Date;
}

const PostgreSQLIDE = () => {
  const [currentQuery, setCurrentQuery] = useState('-- Welcome to PostgreSQL IDE\n-- Start typing your SQL queries here\n\nSELECT version();');
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [databases, setDatabases] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDatabaseSchema();
  }, []);

  const loadDatabaseSchema = async () => {
    try {
      // Get all tables from information_schema
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_table_info');
      
      if (tablesError) {
        console.log('Could not load schema:', tablesError);
      } else {
        setTables(tablesData || []);
      }
    } catch (error) {
      console.log('Schema loading error:', error);
    }
  };

  const executeQuery = async (query?: string, showToast: boolean = true) => {
    const queryToExecute = query || currentQuery;
    if (!queryToExecute.trim()) {
      if (showToast) {
        toast({
          title: "Empty Query",
          description: "Please enter a SQL query to execute.",
          variant: "destructive"
        });
      }
      return;
    }

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      // Split queries by semicolon and execute each one
      const queries = queryToExecute
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      const results: QueryResult[] = [];
      let hasErrors = false;

      for (const singleQuery of queries) {
        try {
          const { data, error } = await supabase.rpc('execute_sql', {
            query_text: singleQuery
          });

          const executionTime = Date.now() - startTime;
          const result: QueryResult = {
            id: Date.now().toString() + Math.random(),
            query: singleQuery,
            executionTime,
            timestamp: new Date(),
          };

          if (error) {
            result.error = error.message;
            hasErrors = true;
          } else {
            // Handle the result properly - data is now a JSONB response
            if (data) {
              // Check if it's an error response
              if (data.error) {
                result.error = data.error;
                hasErrors = true;
              } else if (data.message) {
                // Non-SELECT query result
                result.result = [];
              } else if (Array.isArray(data)) {
                // SELECT query result - data is already the array of rows
                result.result = data;
              } else {
                // Single object result
                result.result = [data];
              }
            } else {
              result.result = [];
            }
          }

          results.push(result);
        } catch (err: any) {
          hasErrors = true;
          results.push({
            id: Date.now().toString() + Math.random(),
            query: singleQuery,
            error: err.message || 'Unknown error occurred',
            executionTime: Date.now() - startTime,
            timestamp: new Date(),
          });
        }
      }

      setQueryResults(prev => [...results, ...prev]);
      
      // Switch to results tab when query is executed from editor
      if (showToast) {
        setActiveTab('results');
      }
      
      // Only show toast notifications for explicit user actions, not terminal commands
      if (showToast) {
        if (hasErrors) {
          toast({
            title: "Query Error",
            description: "Some queries failed to execute. Check the results panel.",
            variant: "destructive"
          });
        } else {
          // Only show success toast for important operations
          const lowerQuery = queryToExecute.toLowerCase();
          if (lowerQuery.includes('create') || lowerQuery.includes('insert') || 
              lowerQuery.includes('update') || lowerQuery.includes('delete')) {
            toast({
              title: "Query Executed",
              description: `${results.length} query(ies) executed successfully.`,
            });
          }
        }
      }

      // Refresh schema after potentially structure-changing queries
      if (queryToExecute.toLowerCase().includes('create') || 
          queryToExecute.toLowerCase().includes('drop') ||
          queryToExecute.toLowerCase().includes('alter')) {
        loadDatabaseSchema();
      }

    } catch (error: any) {
      const result: QueryResult = {
        id: Date.now().toString(),
        query: queryToExecute,
        error: error.message || 'Failed to execute query',
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
      };
      
      setQueryResults(prev => [result, ...prev]);
      
      if (showToast) {
        toast({
          title: "Execution Error",
          description: error.message || 'Failed to execute query',
          variant: "destructive"
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTerminalExecute = (query: string) => {
    // Execute from terminal without showing toast notifications
    executeQuery(query, false);
  };

  const clearHistory = () => {
    setQueryResults([]);
  };

  const saveQuery = () => {
    const blob = new Blob([currentQuery], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_${new Date().getTime()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Navigation Sidebar */}
      <Navigation 
        isCollapsed={isNavCollapsed} 
        onToggle={() => setIsNavCollapsed(!isNavCollapsed)} 
      />

      {/* Main IDE Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">PostgreSQL IDE</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => executeQuery()}
              disabled={isExecuting}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
            
            <Button variant="outline" onClick={saveQuery} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
              <Tabs defaultValue="explorer" className="h-full">
                <TabsList className="w-full">
                  <TabsTrigger value="explorer" className="flex-1">
                    <Database className="h-4 w-4 mr-1" />
                    Explorer
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    <History className="h-4 w-4 mr-1" />
                    History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="explorer" className="h-full mt-0">
                  <DatabaseExplorer 
                    tables={tables}
                    onTableSelect={(tableName) => {
                      setCurrentQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="history" className="h-full mt-0">
                  <QueryHistory 
                    queries={queryResults}
                    onQuerySelect={(query) => setCurrentQuery(query)}
                    onClearHistory={clearHistory}
                  />
                </TabsContent>
              </Tabs>
            </ResizablePanel>

            <ResizableHandle />

            {/* Main Panel */}
            <ResizablePanel defaultSize={80}>
              <div className="h-full flex flex-col">
                {/* Editor */}
                <div className="h-1/2 border-b">
                  <SQLEditor
                    value={currentQuery}
                    onChange={setCurrentQuery}
                    onExecute={() => executeQuery()}
                    tables={tables.map(t => t.table_name)}
                  />
                </div>

                {/* Bottom Panel with fixed tabs */}
                <div className="h-1/2 flex flex-col">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="border-b bg-muted/50">
                      <TabsList className="h-auto p-1">
                        <TabsTrigger value="results" className="gap-2">
                          <Database className="h-4 w-4" />
                          Results
                        </TabsTrigger>
                        <TabsTrigger value="terminal" className="gap-2">
                          <TerminalIcon className="h-4 w-4" />
                          Terminal
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="results" className="flex-1 m-0 overflow-hidden">
                      <QueryResults results={queryResults} />
                    </TabsContent>
                    
                    <TabsContent value="terminal" className="flex-1 m-0 overflow-hidden">
                      <Terminal 
                        onExecute={handleTerminalExecute}
                        onSchemaChange={loadDatabaseSchema}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

export default PostgreSQLIDE;
