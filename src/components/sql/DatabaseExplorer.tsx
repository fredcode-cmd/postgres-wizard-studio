
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Table, Database, Key, Hash } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TableInfo {
  table_name: string;
  table_schema: string;
  table_type: string;
  columns?: ColumnInfo[];
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string;
  is_primary_key?: boolean;
}

interface DatabaseExplorerProps {
  tables: TableInfo[];
  onTableSelect: (tableName: string) => void;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  tables,
  onTableSelect
}) => {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableName)) {
        newSet.delete(tableName);
      } else {
        newSet.add(tableName);
      }
      return newSet;
    });
  };

  const groupedTables = tables.reduce((acc, table) => {
    const schema = table.table_schema;
    if (!acc[schema]) {
      acc[schema] = [];
    }
    acc[schema].push(table);
    return acc;
  }, {} as Record<string, TableInfo[]>);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <h3 className="font-semibold">Database Schema</h3>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(groupedTables).map(([schema, schemaTables]) => (
            <div key={schema} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-muted/50 rounded">
                <Database className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{schema}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {schemaTables.length}
                </Badge>
              </div>

              <div className="space-y-1 ml-2">
                {schemaTables.map((table) => (
                  <Collapsible
                    key={`${table.table_schema}.${table.table_name}`}
                    open={expandedTables.has(table.table_name)}
                    onOpenChange={() => toggleTable(table.table_name)}
                  >
                    <div className="group">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 h-8"
                        >
                          {expandedTables.has(table.table_name) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          <Table className="h-3 w-3 text-blue-500" />
                          <span className="text-sm font-mono">{table.table_name}</span>
                          <Badge 
                            variant={table.table_type === 'BASE TABLE' ? 'default' : 'secondary'}
                            className="ml-auto text-xs"
                          >
                            {table.table_type === 'BASE TABLE' ? 'Table' : 'View'}
                          </Badge>
                        </Button>
                      </CollapsibleTrigger>

                      <div 
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTableSelect(`"${table.table_schema}"."${table.table_name}"`);
                        }}
                      >
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <span className="text-xs">→</span>
                        </Button>
                      </div>
                    </div>

                    <CollapsibleContent className="ml-4 space-y-1">
                      {table.columns ? (
                        table.columns.map((column) => (
                          <div
                            key={column.column_name}
                            className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted/50 rounded"
                          >
                            {column.is_primary_key ? (
                              <Key className="h-3 w-3 text-yellow-500" />
                            ) : (
                              <Hash className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="font-mono">{column.column_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {column.data_type}
                            </Badge>
                            {column.is_nullable === 'NO' && (
                              <Badge variant="destructive" className="text-xs">
                                NOT NULL
                              </Badge>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          Click to load columns
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          ))}

          {tables.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tables found</p>
              <p className="text-sm">Create some tables to see them here</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
