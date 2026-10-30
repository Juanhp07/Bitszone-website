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
  /** The current choice (sort order, section...): highlighted */
  active?: boolean;
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
  /** x/y = where the menu starts (a click, or the button's bottom-left). x2 = the button's right edge: if the menu
   *  doesn't fit to the right it flips so its right edge lines up with the button's. */
  anchor: { x: number; y: number; x2?: number } | null;
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
      left: Math.max(8, openLeft ? (anchor.x2 ?? anchor.x) - width : anchor.x),
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
            // Apple-style: the menu unrolls downward from where you clicked (clip reveal + a small stretch), then settles.
            // No `filter` here: on the same element it switches off the backdrop blur.
            initial={{ opacity: 0, scaleY: 0.9, scaleX: 0.97, y: pos?.originY === 'bottom' ? 6 : -6, clipPath: `inset(${pos?.originY === 'bottom' ? '60% 0 0 0' : '0 0 60% 0'} round 24px)` }}
            animate={{ opacity: 1, scaleY: 1, scaleX: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
            exit={{ opacity: 0, scaleY: 0.94, y: pos?.originY === 'bottom' ? 4 : -4, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 460, damping: 36, mass: 0.7, opacity: { duration: 0.16 } }}
            style={{
              left: pos?.left ?? anchor.x,
              top: pos?.top ?? anchor.y,
              width,
              transformOrigin: `${pos?.originX ?? 'left'} ${pos?.originY ?? 'top'}`,
              visibility: pos ? 'visible' : 'hidden',
              // same body as the shortcuts card (cardStyle: 24px blur, soft lilac rim, big shadow, top highlight), with a dark
              // tint where that card gets its darkness from the dimmed page behind it
              ...cardStyle,
              // the shortcuts card is dark because a 40% black layer dims the page behind it; same dimming here, and a
              // slightly deeper blur so the soft light and colour of what is behind still shows through like in that card
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(28px) saturate(1.15)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.15)',
              // no rim: the shortcuts card's outline and top highlight are left out, only the soft drop shadow stays
              border: 'none',
              boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.55)',
            }}
            className="fixed z-[9999] p-2 flex flex-col gap-0.5 rounded-3xl font-sans text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.04 + i * 0.022, ease: [0.16, 1, 0.3, 1] }}
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); item.onSelect(); if (!item.keepOpen) onClose(); }}
                className={`w-full text-left flex items-center justify-between gap-3 px-3.5 py-2.5 text-[14px] rounded-xl transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:bg-white/10 cursor-pointer ${item.danger ? 'text-red-300/90 hover:text-red-200 hover:bg-red-500/15' : item.active ? 'text-white bg-white/[0.12]' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
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
