
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Play, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  queries,
  onQuerySelect
}) => {
  const { toast } = useToast();

  const copyToClipboard = (query: string) => {
    navigator.clipboard.writeText(query);
    toast({
      title: "Copied",
      description: "Query copied to clipboard",
    });
  };

  const formatQuery = (query: string) => {
    return query.length > 100 ? query.substring(0, 100) + '...' : query;
  };

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
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {queries.map((query) => (
            <div
              key={query.id}
              className="p-3 bg-background border rounded-lg hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={query.error ? 'destructive' : 'secondary'}>
                  {query.error ? 'Failed' : 'Success'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {query.executionTime}ms
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {query.timestamp.toLocaleTimeString()}
                </span>
              </div>

              <div className="font-mono text-xs text-muted-foreground mb-3 bg-muted/50 p-2 rounded">
                {formatQuery(query.query)}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onQuerySelect(query.query)}
                  className="h-7 gap-1"
                >
                  <Play className="h-3 w-3" />
                  Run
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(query.query)}
                  className="h-7 gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>

              {query.result && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {query.result.length} row(s) returned
                </div>
              )}
            </div>
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
