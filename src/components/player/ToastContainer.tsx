import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: number;
  message: string;
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleShowToast = (e: any) => {
      const message = e.detail;
      if (!message) return;
      const id = Date.now() + Math.random();

      setToasts(prev => {
        const next = [...prev, { id, message }];
        // Limitar a máximo 3 notificaciones a la vez: las nuevas se apilan y las anteriores van saliendo
        return next.slice(-3);
      });

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4500);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div 
      className="fixed top-3 md:top-4 left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] md:w-auto z-[9999] flex flex-col gap-2 pointer-events-none items-center" 
      role="status" 
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map(toast => (
          <motion.div 
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-full bg-[#2a1640]/90 md:bg-[#a855f7]/20 backdrop-blur-2xl border border-white/20 text-white px-5 py-2.5 text-sm text-center rounded-full shadow-lg font-medium tracking-wide flex items-center gap-2"
            style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.2)', 
              backdropFilter: 'blur(32px)', 
              WebkitBackdropFilter: 'blur(32px)' 
            }}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};
