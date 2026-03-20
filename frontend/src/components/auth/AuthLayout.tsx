import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      {/* Background blobs for subtle depth */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[15%] right-[10%] w-[25%] h-[25%] bg-blue-500/5 rounded-full blur-3xl delay-1000" />
      </div>

      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="text-sm font-bold text-primary">EI</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm font-medium text-slate-500 max-w-[280px] mx-auto">{subtitle}</p>
        </div>

        <Card className="p-8 md:p-10 bg-white/60 backdrop-blur-xl border-slate-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          {children}
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
