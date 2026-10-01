import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Loader2, Check } from 'lucide-react';

interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  status?: 'idle' | 'loading' | 'success';
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({ 
  children, 
  className = '', 
  status = 'idle',
  ...props 
}) => {
  return (
    <button 
      className={`relative overflow-hidden group bg-[#9B7bf7]/10 backdrop-blur-md border border-[#9B7bf7]/30 text-white font-semibold rounded-[16px] transition-all duration-500 shadow-[0_4px_20px_rgba(155,123,247,0.1)] hover:bg-[#9B7bf7]/20 hover:border-[#9B7bf7]/50 hover:shadow-[0_8px_30px_rgba(155,123,247,0.2)] ${className}`}
      {...props}
    >
      {/* Content wrapper with states */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* Idle State - statically positioned to give the button natural width/height */}
        <div className={`transition-all duration-300 ${status === 'idle' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
          {children}
        </div>
        
        {/* Loading State */}
        <div className={`absolute flex items-center justify-center inset-0 transition-all duration-300 ${status === 'loading' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
        
        {/* Success State */}
        <div className={`absolute flex items-center justify-center inset-0 transition-all duration-300 ${status === 'success' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
          <Check className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
      </div>
    </button>
  );
};
