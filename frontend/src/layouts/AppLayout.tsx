import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">EI</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              EchoInsight <span className="text-muted-foreground">AI</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/upload" className="hover:text-foreground transition-colors">
              Upload
            </Link>
            <Link to="/app" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Button asChild size="sm" variant="primary">
              <Link to="/upload">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;