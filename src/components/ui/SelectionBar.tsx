import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

/** Edit mode dock, lives in the section hero where the Seleccionar button was: how many are selected, select all, delete and done. Same blur body as the menus. */
export const SelectionBar = ({
  count,
  total,
  noun,
  onSelectAll,
  onClearSelection,
  onDelete,
  onDone,
}: {
  count: number;
  total: number;
  noun: string; // "álbumes" / "listas"
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
  onDone: () => void;
}) => (
  <motion.div
    initial={{ scale: 0.92, x: 16 }}
    animate={{ scale: 1, x: 0 }}
    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    role="toolbar"
    aria-label="Edición"
    className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full max-w-full origin-right"
    style={{ background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(28px) saturate(1.15)', WebkitBackdropFilter: 'blur(28px) saturate(1.15)', boxShadow: '0 24px 60px -12px rgba(0,0,0,0.55)' }}
  >
    {/* on phones the counter is just the number so the whole dock fits next to the edges */}
    <span className="pl-3 sm:pl-4 pr-1 sm:pr-2 text-sm font-medium text-white/85 whitespace-nowrap tabular-nums">
      <span className="sm:hidden">{count}</span>
      <span className="hidden sm:inline">{count === 0 ? `Elige ${noun}` : `${count} ${count === 1 ? 'seleccionado' : 'seleccionados'}`}</span>
    </span>
    <button
      onClick={count === total ? onClearSelection : onSelectAll}
      className="px-3 sm:px-4 h-9 sm:h-10 rounded-full text-sm font-semibold text-white/85 hover:text-white bg-white/[0.08] hover:bg-white/[0.16] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      {count === total ? 'Quitar todo' : 'Todo'}
    </button>
    <button
      onClick={onDelete}
      disabled={count === 0}
      aria-label="Eliminar seleccionados"
      className="px-3 sm:px-4 h-9 sm:h-10 rounded-full text-sm font-semibold flex items-center gap-1.5 text-red-200 bg-red-500/15 hover:bg-red-500/25 disabled:opacity-40 disabled:hover:bg-red-500/15 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
    >
      <Trash2 className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">Eliminar</span>
    </button>
    <button
      onClick={onDone}
      className="px-4 sm:px-5 h-9 sm:h-10 rounded-full text-sm font-semibold text-black bg-white hover:bg-white/90 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      Listo
    </button>
  </motion.div>
);
