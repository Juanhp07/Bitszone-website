import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Toast {
  id: number;
  message: string;
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleShowToast = (e: any) => {
      const message = e.detail;
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message }]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-[88px] left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none items-center">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className="bg-[#a855f7]/20 backdrop-blur-2xl border border-white/20 text-white px-5 py-2.5 text-sm rounded-full shadow-lg font-medium tracking-wide flex items-center gap-2"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)', animation: 'slideDown 0.3s ease-out, fadeOut 0.3s ease-in 4.7s forwards', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}
        >
          {toast.message}
        </div>
      ))}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>,
    document.body
  );
};
