import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, ShieldCheck, Check, Sparkles, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useAdminEdit, type EditTarget } from './AdminEditContext';

/**
 * Discreet pencil button to place on editable elements:
 * titles, covers, artist names, buttons, etc.
 */
export const AdminPencil: React.FC<{
  target: EditTarget;
  title?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'floating' | 'inline' | 'button-corner';
  className?: string;
}> = ({
  target,
  title = 'Editar con rol Admin',
  size = 'sm',
  variant = 'inline',
  className = '',
}) => {
  const { isAdmin, isEditMode, openEditModal } = useAdminEdit();

  if (!isAdmin || !isEditMode) return null;

  const sizeClasses = {
    xs: 'w-5 h-5 p-1',
    sm: 'w-6 h-6 p-1.5',
    md: 'w-8 h-8 p-2',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size];

  const variantClasses = {
    inline: 'inline-flex items-center justify-center rounded-lg bg-purple-500/20 hover:bg-[#8a3aed] text-purple-200 hover:text-white border border-purple-400/30 transition-all shadow-sm cursor-pointer ml-1.5',
    floating: 'absolute top-2.5 right-2.5 z-30 rounded-full bg-black/60 hover:bg-[#8a3aed] text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all shadow-lg cursor-pointer hover:scale-105',
    'button-corner': 'inline-flex items-center justify-center rounded-md bg-purple-500/25 hover:bg-[#8a3aed] text-purple-200 hover:text-white border border-purple-400/35 transition-all shadow-sm cursor-pointer ml-1',
  }[variant];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        openEditModal(target);
      }}
      title={title}
      aria-label={title}
      className={`${sizeClasses} ${variantClasses} ${className}`}
    >
      <Pencil className={iconSizes} />
    </button>
  );
};

/**
 * Floating bar visible only to Admins to toggle Edit Mode on/off
 * and see how many custom edits are active.
 */
export const AdminEditFloatingBar: React.FC = () => {
  const { isAdmin, isEditMode, toggleEditMode, totalOverridesCount, resetAllOverrides } = useAdminEdit();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#120b22]/90 border border-purple-500/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white text-xs"
      >
        {/* Admin Badge */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-bold tracking-wider text-[11px] text-purple-200 uppercase">
            Admin
          </span>
        </div>

        <span className="w-px h-4 bg-white/15" />

        {/* Toggle Mode */}
        <button
          type="button"
          onClick={toggleEditMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
            isEditMode
              ? 'bg-[#8a3aed] text-white shadow-sm'
              : 'bg-white/10 hover:bg-white/15 text-white/60 hover:text-white'
          }`}
          title={isEditMode ? 'Pausar modo de edición' : 'Activar modo de edición con lápices'}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>{isEditMode ? 'Edición activa' : 'Edición en pausa'}</span>
        </button>

        {/* Overrides Badge / Reset */}
        {totalOverridesCount > 0 && (
          <>
            <span className="w-px h-4 bg-white/15" />
            <span className="text-[11px] text-purple-300 font-medium">
              {totalOverridesCount} {totalOverridesCount === 1 ? 'cambio' : 'cambios'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas restablecer todos los cambios y personalizaciones a sus valores originales?')) {
                  resetAllOverrides();
                }
              }}
              title="Restablecer todos los cambios del Admin"
              className="p-1 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};
