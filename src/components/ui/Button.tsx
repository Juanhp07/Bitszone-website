import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-lg px-6 py-3 font-inter font-medium transition-all duration-300";
    
    const variants = {
      primary: "bg-gradient-to-br from-brand-tertiary to-brand-secondary text-white shadow-[0_4px_16px_rgba(45,20,145,0.4)] hover:shadow-[0_4px_24px_rgba(85,16,141,0.6)] hover:from-brand-highlight hover:to-brand-highlight",
      secondary: "bg-surface-1 text-white border-gradient hover:bg-[#2d1491]/10",
      ghost: "bg-transparent text-on-surface hover:text-white hover:bg-white/5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
