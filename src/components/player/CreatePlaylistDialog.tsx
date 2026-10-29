import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Camera, ListMusic, Sparkles, X } from 'lucide-react';
import { LiquidButton } from '../ui/LiquidButton';
import { Heading, cardStyle, inputClass } from '../auth/authUi';
import { toAvatar } from './Onboarding';

/** "Nueva lista" card, same look as the onboarding: cover (photo or automatic from the songs) + name */
export const CreatePlaylistDialog = ({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, cover?: string) => void;
}) => {
  const [name, setName] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    setName(''); setCover(null); setError('');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (typeof document === 'undefined') return null;

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Elige una imagen'); return; }
    try { setCover(await toAvatar(file)); setError(''); } catch { setError('No pudimos leer esa imagen'); }
  };

  const create = () => {
    if (!name.trim()) { setError('Ponle un nombre a tu lista'); return; }
    onCreate(name.trim(), cover ?? undefined);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
          animate={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)' }}
          exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)', transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Nueva lista"
          onClick={onClose}
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 170, damping: 22, mass: 0.9, opacity: { duration: 0.35 } }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[26rem] rounded-3xl overflow-hidden shadow-2xl text-white p-8 backdrop-blur-xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
            style={cardStyle}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <Heading title="Nueva lista" subtitle="Elige una portada y ponle nombre." />

            <div className="flex flex-col items-center mb-6">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group w-32 h-32 rounded-2xl overflow-hidden bg-black/30 border border-white/25 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                aria-label="Elegir foto de portada"
              >
                {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <ListMusic className="w-12 h-12 text-white/60" aria-hidden="true" />}
                <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-7 h-7" aria-hidden="true" />
                </span>
              </button>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <button type="button" onClick={() => fileRef.current?.click()} className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${cover ? 'bg-white text-[#3b1a66] border-white [text-shadow:none]' : 'border-white/25 text-white/85 hover:bg-white/10'}`}>
                  {cover ? 'Cambiar foto' : 'Subir foto'}
                </button>
                <button type="button" onClick={() => setCover(null)} aria-pressed={!cover} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${!cover ? 'bg-white text-[#3b1a66] border-white [text-shadow:none]' : 'border-white/25 text-white/85 hover:bg-white/10'}`}>
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Automática
                </button>
              </div>
              <p className="mt-2 text-xs text-white/60 text-center">{cover ? 'Usaremos tu foto.' : 'Se arma sola con las portadas de tus canciones.'}</p>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la lista"
                aria-label="Nombre de la lista"
                maxLength={60}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && create()}
                className={`${inputClass} !pl-4`}
                autoFocus
              />
              {error && <p className="text-sm text-pink-200 text-center -mt-2">{error}</p>}
              <LiquidButton onClick={create} className="w-full h-14">Crear lista</LiquidButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
