import { useRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * A card that can be put in "edit mode" like the iOS home screen: it jiggles, shows a check, a tap selects it and it can
 * be dragged to a new place. Long-pressing a card enters edit mode. Outside edit mode it is just a wrapper.
 *
 * Reordering uses native drag and drop (mouse); selecting and long-press also work on touch.
 */
export const SelectableCard = ({
  id,
  index,
  editing,
  selected,
  dragging,
  onToggle,
  onEnterEdit,
  onDragStartId,
  onDragOverId,
  onDragEndId,
  label,
  children,
}: {
  id: string;
  index: number;
  editing: boolean;
  selected: boolean;
  dragging: boolean;
  onToggle: (id: string) => void;
  /** long press on a card: start edit mode with this card selected */
  onEnterEdit: (id: string) => void;
  onDragStartId: (id: string) => void;
  onDragOverId: (id: string) => void;
  onDragEndId: () => void;
  label: string;
  children: ReactNode;
}) => {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = useRef<{ x: number; y: number } | null>(null);
  const longPressed = useRef(false);

  const clear = () => { clearTimeout(timer.current); start.current = null; };

  return (
    <motion.div
      layout="position"
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      draggable={editing}
      onDragStart={(e) => { (e as unknown as DragEvent).dataTransfer?.setData('text/plain', id); onDragStartId(id); }}
      onDragOver={(e) => { if (editing) { e.preventDefault(); onDragOverId(id); } }}
      onDragEnd={onDragEndId}
      onDrop={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (editing || e.button !== 0) return;
        longPressed.current = false;
        start.current = { x: e.clientX, y: e.clientY };
        timer.current = setTimeout(() => { longPressed.current = true; onEnterEdit(id); }, 480);
      }}
      onPointerMove={(e) => {
        if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8) clear();
      }}
      onPointerUp={clear}
      onPointerCancel={clear}
      onPointerLeave={clear}
      // the click that ends a long press must not also open the card
      onClickCapture={(e) => { if (longPressed.current) { longPressed.current = false; e.stopPropagation(); e.preventDefault(); } }}
      className={`relative ${editing ? 'jiggle' : ''} ${dragging ? 'opacity-40' : ''} transition-opacity duration-200`}
      style={{ ['--jd' as string]: `${-(index % 6) * 0.06}s` }}
    >
      {children}
      {editing && (
        // in edit mode the whole card is one big target: tap = select / unselect, drag = move
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(id); }}
          aria-pressed={selected}
          aria-label={`${selected ? 'Quitar de la selección' : 'Seleccionar'} ${label}`}
          className={`absolute inset-0 z-30 rounded-3xl cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-[background-color] duration-200 ${selected ? 'bg-white/[0.08]' : ''}`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${selected ? 'bg-white text-black scale-100 shadow-[0_6px_16px_rgba(0,0,0,0.35)]' : 'bg-black/40 backdrop-blur-xl ring-2 ring-white/70 scale-95'}`}
          >
            <Check className={`w-4 h-4 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} strokeWidth={3} />
          </span>
        </button>
      )}
    </motion.div>
  );
};
