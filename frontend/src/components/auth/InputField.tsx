import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  registration?: Partial<UseFormRegisterReturn>;
  rightElement?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  icon,
  registration,
  rightElement,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          {label}
        </label>
      </div>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          {...registration}
          {...props}
          className={`
            w-full bg-slate-50/50 border rounded-2xl py-3.5 
            ${icon ? 'pl-11' : 'pl-5'} 
            ${rightElement ? 'pr-12' : 'pr-5'} 
            text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all
            ${error ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 focus:border-primary'}
            ${className}
          `}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] font-bold text-rose-500 px-1 italic">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
