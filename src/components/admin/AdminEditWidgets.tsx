import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, ShieldCheck, Check, Sparkles, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useAdminEdit, type EditTarget } from './AdminEditContext';

/**
 * Discreet pencil button to place on editable elements:
 * titles, covers, artist names, buttons, etc.
 * Features Liquid Glass styling with frosted background blur and precise flex centering.
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
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
  }[size];

  const floatingSizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9',
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size];

  const variantClasses = {
    inline: 'inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 text-white/90 hover:text-white border border-white/25 hover:border-white/40 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:scale-110 active:scale-95 cursor-pointer ml-1.5 shrink-0 select-none',
    floating: 'absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-30 flex items-center justify-center rounded-full bg-black/45 hover:bg-white/25 active:bg-white/35 text-white/95 hover:text-white border border-white/30 hover:border-white/50 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all hover:scale-110 active:scale-95 cursor-pointer select-none',
    'button-corner': 'inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 text-white/90 hover:text-white border border-white/25 hover:border-white/40 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:scale-110 active:scale-95 cursor-pointer ml-1 shrink-0 select-none',
  }[variant];

  const appliedSize = variant === 'floating' ? floatingSizeClasses : sizeClasses;

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
      className={`${appliedSize} ${variantClasses} ${className}`}
    >
      <Pencil className={`${iconSizes} drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]`} strokeWidth={2} />
    </button>
  );
};

/**
 * Floating bar has been migrated into the Profile modal (ProfileDialog)
 * to avoid overlaying and blocking content on the screen.
 */
export const AdminEditFloatingBar: React.FC = () => {
  return null;
};
