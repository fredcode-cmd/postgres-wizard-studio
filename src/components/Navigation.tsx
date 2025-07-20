import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  Database, 
  Settings, 
  HelpCircle, 
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    icon: Home,
    label: 'Home',
    href: '/',
    description: 'Return to homepage'
  },
  {
    icon: Database,
    label: 'PostgreSQL IDE',
    href: '/ide',
    description: 'SQL Editor and Database Explorer'
  },
];

interface NavigationProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  isCollapsed = false, 
  onToggle 
}) => {
  const location = useLocation();

  const NavigationContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "h-full flex flex-col",
      mobile ? "p-4" : "p-2"
    )}>
      <div className={cn(
        "flex items-center gap-3 mb-6",
        mobile ? "px-2" : isCollapsed ? "justify-center px-0" : "px-2"
      )}>
        <Database className="h-6 w-6 text-primary flex-shrink-0" />
        {(!isCollapsed || mobile) && (
          <span className="font-semibold text-lg">PG Studio</span>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                isCollapsed && !mobile && "justify-center px-2"
              )}
              title={isCollapsed && !mobile ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || mobile) && (
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  {item.description && mobile && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {(!isCollapsed || mobile) && (
        <div className="border-t pt-4 mt-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3"
            asChild
          >
            <a
              href="https://github.com/Fredrickmureti/postgres-wizard-studio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HelpCircle className="h-4 w-4" />
              Help & Docs
            </a>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className={cn(
        "hidden md:flex border-r bg-muted/20 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="w-full relative">
          <NavigationContent />
          
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-background shadow-sm"
            onClick={onToggle}
          >
            <ChevronLeft className={cn(
              "h-3 w-3 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <NavigationContent mobile />
        </SheetContent>
      </Sheet>
    </>
  );
};
