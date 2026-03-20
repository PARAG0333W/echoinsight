import React from 'react';
import { Slot } from '@radix-ui/react-slot';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md';

import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center rounded-2xl text-sm font-bold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.5)] active:shadow-none',
  outline:
    'border-2 border-slate-200 bg-white hover:border-slate-300 text-slate-700',
  ghost: 'hover:bg-slate-50 text-slate-700',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4',
  md: 'h-12 px-8',
};

export const Button: React.FC<ButtonProps> = ({
  asChild,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  children,
  ...props
}) => {
  const Comp: any = asChild ? Slot : 'button';

  return (
    <Comp
      className={[base, variants[variant], sizes[size], className].join(' ')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        children
      )}
    </Comp>
  );
};

export default Button;