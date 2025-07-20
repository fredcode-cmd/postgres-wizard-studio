
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Code, Terminal, History } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Database className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            PostgreSQL IDE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A powerful, modern PostgreSQL IDE with syntax highlighting, auto-completion, 
            and advanced query execution capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Smart SQL Editor</CardTitle>
              <CardDescription>
                Advanced code editor with PostgreSQL syntax highlighting, auto-completion, 
                and intelligent error detection.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Terminal className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Terminal Interface</CardTitle>
              <CardDescription>
                Execute commands through a PostgreSQL-like terminal interface with 
                command history and meta-commands support.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Database Explorer</CardTitle>
              <CardDescription>
                Browse your database schema, explore tables, columns, and relationships 
                with an intuitive tree view interface.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <History className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Query History</CardTitle>
              <CardDescription>
                Keep track of all executed queries with detailed execution times, 
                results, and error information.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Results Visualization</CardTitle>
              <CardDescription>
                View query results in clean, organized tables with export capabilities 
                and error highlighting.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Advanced Features</CardTitle>
              <CardDescription>
                SQL formatting, query execution shortcuts (F5, Ctrl+Enter), 
                and comprehensive PostgreSQL keyword support.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/ide">
            <Button size="lg" className="gap-2">
              <Database className="h-5 w-5" />
              Launch PostgreSQL IDE
            </Button>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold mb-2">🚀 Performance</h3>
              <p className="text-muted-foreground">
                Lightning-fast query execution with detailed performance metrics and execution times.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">🎯 Precision</h3>
              <p className="text-muted-foreground">
                Accurate auto-completion with PostgreSQL keywords, functions, and your database schema.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">🔒 Security</h3>
              <p className="text-muted-foreground">
                Secure connection to your PostgreSQL database through Supabase with row-level security.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">📊 Analytics</h3>
              <p className="text-muted-foreground">
                Comprehensive query history and results analysis with CSV export capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
