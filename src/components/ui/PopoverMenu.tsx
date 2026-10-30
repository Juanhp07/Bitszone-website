import { cardStyle } from '../auth/authUi';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

export type PopoverMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
  /** Keep the menu open after selecting (e.g. to show a sub-step) */
  keepOpen?: boolean;
};

// Floating menu with an Apple-style "grow from the anchor" spring.
// `anchor` is a viewport point (button corner or right-click position).
export const PopoverMenu = ({
  open,
  anchor,
  items,
  onClose,
  width = 240,
}: {
  open: boolean;
  anchor: { x: number; y: number } | null;
  items: PopoverMenuItem[];
  onClose: () => void;
  width?: number;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; originX: string; originY: string } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const h = menuRef.current?.offsetHeight ?? items.length * 46 + 12;
    const openLeft = anchor.x + width + 8 > window.innerWidth;
    const openUp = anchor.y + h + 8 > window.innerHeight;
    setPos({
      left: Math.max(8, openLeft ? anchor.x - width : anchor.x),
      top: Math.max(8, openUp ? anchor.y - h : anchor.y),
      originX: openLeft ? 'right' : 'left',
      originY: openUp ? 'bottom' : 'top',
    });
  }, [open, anchor?.x, anchor?.y, items.length, width]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    const onScroll = () => onClose();
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('wheel', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('wheel', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && anchor && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            onContextMenu={(e) => { e.preventDefault(); onClose(); }}
          />
          <motion.div
            ref={menuRef}
            role="menu"
            // no `filter` here: on the same element it switches off the backdrop blur
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.7 }}
            style={{
              left: pos?.left ?? anchor.x,
              top: pos?.top ?? anchor.y,
              width,
              transformOrigin: `${pos?.originX ?? 'left'} ${pos?.originY ?? 'top'}`,
              visibility: pos ? 'visible' : 'hidden',
              // same body as the shortcuts card (cardStyle: 24px blur, soft lilac rim, big shadow, top highlight), with a dark
              // tint where that card gets its darkness from the dimmed page behind it
              ...cardStyle,
              background: 'rgba(10, 8, 16, 0.5)',
            }}
            className="fixed z-[9999] p-2 flex flex-col gap-0.5 rounded-3xl font-sans text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: i * 0.018, ease: [0.16, 1, 0.3, 1] }}
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); item.onSelect(); if (!item.keepOpen) onClose(); }}
                className={`w-full text-left flex items-center justify-between gap-3 px-3.5 py-2.5 text-[14px] rounded-xl transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:bg-white/10 cursor-pointer ${item.danger ? 'text-red-300/90 hover:text-red-200 hover:bg-red-500/15' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
              >
                {item.label}
                {item.icon && <span className="shrink-0 opacity-80">{item.icon}</span>}
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
