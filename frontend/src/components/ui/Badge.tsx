import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'destructive';

const variants: Record<Variant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-800',
  destructive: 'bg-rose-100 text-rose-700',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  ...props
}) => (
  <span
    className={[
      'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-[11px] font-medium',
      variants[variant],
      className,
    ].join(' ')}
    {...props}
  />
);