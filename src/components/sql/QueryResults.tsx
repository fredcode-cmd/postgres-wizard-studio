
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryResult {
  id: string;
  query: string;
  result?: any[];
  error?: string;
  executionTime: number;
  timestamp: Date;
}

interface QueryResultsProps {
  results: QueryResult[];
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results }) => {
  const [selectedResult, setSelectedResult] = useState<QueryResult | null>(
    results.length > 0 ? results[0] : null
  );
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const downloadCSV = (data: any[]) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (results.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No queries executed yet</p>
          <p className="text-sm">Run a query to see results here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Results sidebar */}
      <div className="w-80 border-r bg-muted/20">
        <div className="p-3 border-b">
          <h3 className="font-semibold">Query Results</h3>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedResult?.id === result.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-background hover:bg-accent'
                }`}
                onClick={() => setSelectedResult(result)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.error ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <Badge variant={result.error ? 'destructive' : 'secondary'}>
                    {result.error ? 'Error' : 'Success'}
                  </Badge>
                </div>
                
                <div className="text-xs font-mono text-muted-foreground mb-1">
                  {result.query.length > 50 
                    ? result.query.substring(0, 50) + '...'
                    : result.query
                  }
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{result.executionTime}ms</span>
                  <span>{result.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Result details */}
      <div className="flex-1 flex flex-col">
        {selectedResult ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedResult.error ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-semibold">
                    {selectedResult.error ? 'Query Failed' : 'Query Successful'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(selectedResult.query)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Query
                  </Button>
                  
                  {selectedResult.result && selectedResult.result.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadCSV(selectedResult.result!)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download CSV
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Executed in {selectedResult.executionTime}ms • {selectedResult.timestamp.toLocaleString()}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="data" className="h-full">
                <TabsList className="m-4">
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="query">Query</TabsTrigger>
                </TabsList>
                
                <TabsContent value="data" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    {selectedResult.error ? (
                      <div className="p-4">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <h4 className="font-semibold text-destructive mb-2">Error Details</h4>
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {selectedResult.error}
                          </pre>
                        </div>
                      </div>
                    ) : selectedResult.result && selectedResult.result.length > 0 ? (
                      <div className="p-4">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                {Object.keys(selectedResult.result[0]).map((header) => (
                                  <th key={header} className="text-left p-3 font-semibold">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {selectedResult.result.map((row, index) => (
                                <tr key={index} className="border-t hover:bg-muted/50">
                                  {Object.values(row).map((value, cellIndex) => (
                                    <td key={cellIndex} className="p-3 font-mono text-sm">
                                      {value === null || value === undefined 
                                        ? <span className="text-muted-foreground italic">NULL</span>
                                        : String(value)
                                      }
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                          {selectedResult.result.length} row(s) returned
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Query executed successfully but returned no data
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="query" className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <pre className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                        {selectedResult.query}
                      </pre>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a query result to view details
          </div>
        )}
      </div>
    </div>
  );
};
