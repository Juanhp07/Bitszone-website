import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { cardStyle, titleStyle } from '../auth/authUi';

/** Confirmation card, same glass body as the other dialogs. */
export const ConfirmDialog = ({
  open,
  title,
  text,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative rounded-3xl p-8 sm:p-9 max-w-md w-full text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
            style={{ ...cardStyle, border: 'none', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.65)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/15 backdrop-blur-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-300" />
              </div>
              <h3 className="text-2xl sm:text-3xl text-white tracking-tight" style={titleStyle}>{title}</h3>
            </div>
            <p className="text-white/80 mb-7 text-base leading-relaxed">{text}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
