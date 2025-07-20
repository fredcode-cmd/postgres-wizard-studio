
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Play, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QueryResult {
  id: string;
  query: string;
  result?: any[];
  error?: string;
  executionTime: number;
  timestamp: Date;
}

interface QueryHistoryProps {
  queries: QueryResult[];
  onQuerySelect: (query: string) => void;
  onClearHistory: () => void;
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  queries,
  onQuerySelect,
  onClearHistory
}) => {
  const { toast } = useToast();
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set());

  const copyToClipboard = (query: string) => {
    navigator.clipboard.writeText(query);
    toast({
      title: "Copied",
      description: "Query copied to clipboard",
    });
  };

  const formatQuery = (query: string) => {
    return query.length > 60 ? query.substring(0, 60) + '...' : query;
  };

  const toggleQuery = (queryId: string) => {
    setExpandedQueries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(queryId)) {
        newSet.delete(queryId);
      } else {
        newSet.add(queryId);
      }
      return newSet;
    });
  };

  const groupedQueries = queries.reduce((acc, query) => {
    const date = query.timestamp.toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(query);
    return acc;
  }, {} as Record<string, QueryResult[]>);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <h3 className="font-semibold">Query History</h3>
          <Badge variant="secondary" className="ml-auto">
            {queries.length}
          </Badge>
        </div>
        {queries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="w-full mt-2 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear History
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {Object.entries(groupedQueries).map(([date, dayQueries]) => (
            <Collapsible key={date} defaultOpen={date === new Date().toDateString()}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                  <ChevronRight className="h-3 w-3 mr-2" />
                  <span className="text-xs font-medium">{date}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {dayQueries.length}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 ml-4">
                {dayQueries.map((query) => (
                  <Collapsible
                    key={query.id}
                    open={expandedQueries.has(query.id)}
                    onOpenChange={() => toggleQuery(query.id)}
                  >
                    <div className="p-2 bg-background border rounded-lg hover:border-primary/20 transition-colors">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-2 mb-2 cursor-pointer">
                          {expandedQueries.has(query.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          <Badge variant={query.error ? 'destructive' : 'secondary'} className="text-xs">
                            {query.error ? 'Failed' : 'Success'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {query.executionTime}ms
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {query.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </CollapsibleTrigger>

                      <div className="font-mono text-xs text-muted-foreground mb-2 bg-muted/50 p-2 rounded">
                        {formatQuery(query.query)}
                      </div>

                      <CollapsibleContent>
                        <div className="space-y-2 mb-3">
                          <div className="font-mono text-xs bg-muted/30 p-2 rounded max-h-32 overflow-auto">
                            {query.query}
                          </div>
                          
                          {query.result && (
                            <div className="text-xs text-muted-foreground">
                              {query.result.length} row(s) returned
                            </div>
                          )}
                          
                          {query.error && (
                            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                              {query.error}
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onQuerySelect(query.query)}
                          className="h-6 gap-1 text-xs"
                        >
                          <Play className="h-3 w-3" />
                          Run
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(query.query)}
                          className="h-6 gap-1 text-xs"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}

          {queries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No query history</p>
              <p className="text-sm">Execute queries to see them here</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
