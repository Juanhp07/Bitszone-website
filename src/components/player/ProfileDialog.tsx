import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Camera, Clock, Headphones, LogOut, Mail, Mic2, Music2, User as UserIcon, X } from 'lucide-react';
import { LiquidButton } from '../ui/LiquidButton';
import { cardStyle, inputClass, titleStyle } from '../auth/authUi';
import { supabase } from '../../lib/supabase';
import { getHistory, topBy } from '../../lib/listenHistory';
import { toAvatar } from './Onboarding';

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/i;

const ago = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
};

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="mt-8 first:mt-0">
    <h3 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/55 mb-3">{icon}{title}</h3>
    {children}
  </section>
);

/** Account panel: photo, username, email, sign out, and the listening stats */
export const ProfileDialog = ({
  open,
  onClose,
  userId,
  email,
  username,
  avatarUrl,
  onSaved,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  onSaved: () => void;
  onSignOut: () => void;
}) => {
  const [name, setName] = useState(username);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    setName(username); setAvatar(avatarUrl); setError(''); setStatus('idle');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const stats = useMemo(() => {
    if (!open) return null;
    const history = getHistory();
    const artists = topBy(history, (l) => l.artist, 5);
    const genres = topBy(history, (l) => l.genre, 5);
    return {
      history,
      artists,
      genres,
      minutes: Math.round(history.reduce((s, l) => s + l.duration, 0) / 60_000),
      distinctArtists: new Set(history.map((l) => l.artist)).size,
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  const dirty = name.trim() !== username || avatar !== avatarUrl;

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Elige una imagen'); return; }
    try { setAvatar(await toAvatar(file)); setError(''); } catch { setError('No pudimos leer esa imagen'); }
  };

  const save = async () => {
    if (status !== 'idle' || !dirty) return;
    const clean = name.trim();
    if (!USERNAME_RE.test(clean)) { setError('Usa de 3 a 20 letras, números, punto o guion bajo'); return; }
    setStatus('loading');
    const { error: err } = await supabase.from('profiles').upsert({ id: userId, username: clean.toLowerCase(), avatar_url: avatar });
    if (err) {
      setStatus('idle');
      setError(err.code === '23505' ? 'Ese nombre ya está en uso' : 'Algo salió mal. Intenta de nuevo.');
      return;
    }
    setStatus('success');
    onSaved();
    setTimeout(() => setStatus('idle'), 900);
  };

  const maxGenre = stats?.genres[0]?.count || 1;

  return createPortal(
    <AnimatePresence>
      {open && stats && (
        <motion.div
          initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
          animate={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)' }}
          exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)', transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-3 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Tu perfil"
          onClick={onClose}
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.9, opacity: { duration: 0.35 } }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[980px] max-h-[calc(100dvh-1.5rem)] md:h-[min(640px,calc(100vh-2rem))] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
            style={cardStyle}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Left: the account */}
            <div className="md:w-[38%] shrink-0 p-7 md:p-9 flex flex-col items-center backdrop-blur-xl md:border-r border-white/10 overflow-y-auto">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group rounded-full mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                aria-label="Cambiar foto de perfil"
              >
                <span className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-black/30 border border-white/30 overflow-hidden flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
                  {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-1/2 h-1/2 text-white/70" aria-hidden="true" />}
                </span>
                <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-7 h-7" aria-hidden="true" />
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
              <h2 className="mt-4 text-3xl md:text-4xl text-center break-all" style={titleStyle}>{name.trim() || username}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/65 break-all text-center"><Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />{email}</p>

              <div className="w-full mt-7 space-y-3">
                <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-white/55">Nombre de usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-white/85" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    aria-label="Nombre de usuario"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                    className={inputClass}
                  />
                </div>
                {error && <p className="text-sm text-pink-200 text-center">{error}</p>}
                <LiquidButton onClick={save} status={status} disabled={!dirty} className={`w-full h-12 transition-opacity ${dirty ? '' : 'opacity-50'}`}>Guardar cambios</LiquidButton>
              </div>

              <button
                type="button"
                onClick={() => { onClose(); onSignOut(); }}
                className="mt-auto pt-6 flex items-center gap-2 text-sm font-medium text-red-200/85 hover:text-red-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" /> Cerrar sesión
              </button>
            </div>

            {/* Right: listening stats */}
            <div className="flex-1 min-w-0 p-7 md:p-9 overflow-y-auto bg-black/20">
              <h2 className="text-2xl md:text-3xl mb-1" style={titleStyle}>Tu música</h2>
              <p className="text-sm text-white/60 mb-6">Lo que más suena en tu Bitszone.</p>

              <div className="grid grid-cols-3 gap-2.5 mb-8">
                {[
                  { icon: <Headphones className="w-4 h-4" />, value: stats.history.length, label: 'reproducciones' },
                  { icon: <Clock className="w-4 h-4" />, value: stats.minutes, label: 'minutos' },
                  { icon: <Mic2 className="w-4 h-4" />, value: stats.distinctArtists, label: 'artistas' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-white/[0.06] border border-white/10 px-3 py-3.5">
                    <span className="text-white/55" aria-hidden="true">{s.icon}</span>
                    <p className="mt-2 text-2xl font-bold tabular-nums leading-none">{s.value}</p>
                    <p className="mt-1 text-[11px] text-white/55">{s.label}</p>
                  </div>
                ))}
              </div>

              {stats.history.length === 0 ? (
                <div className="text-center py-10 text-white/60">
                  <Music2 className="w-10 h-10 mx-auto mb-3 text-white/30" aria-hidden="true" />
                  <p className="font-semibold text-white/80">Aún no hay estadísticas</p>
                  <p className="text-sm mt-1">Pon algo de música y aquí verás tus artistas, géneros e historial.</p>
                </div>
              ) : (
                <>
                  <Section icon={<Mic2 className="w-3.5 h-3.5" aria-hidden="true" />} title="Artistas más escuchados">
                    <ol className="space-y-1">
                      {stats.artists.map((a, i) => (
                        <li key={a.key} className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors">
                          <span className="w-5 text-right text-sm font-bold text-white/40 tabular-nums">{i + 1}</span>
                          <img src={a.sample.albumCover} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                          <span className="flex-1 min-w-0 truncate font-semibold">{a.key}</span>
                          <span className="text-xs text-white/50 tabular-nums">{a.count} {a.count === 1 ? 'vez' : 'veces'}</span>
                        </li>
                      ))}
                    </ol>
                  </Section>

                  {stats.genres.length > 0 && (
                    <Section icon={<Music2 className="w-3.5 h-3.5" aria-hidden="true" />} title="Tus géneros">
                      <div className="space-y-2.5">
                        {stats.genres.map((g, i) => (
                          <div key={g.key}>
                            <div className="flex justify-between text-sm mb-1"><span className="font-medium">{g.key}</span><span className="text-white/50 tabular-nums">{g.count}</span></div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-white/80"
                                initial={{ width: 0 }}
                                animate={{ width: `${(g.count / maxGenre) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.25 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  <Section icon={<Clock className="w-3.5 h-3.5" aria-hidden="true" />} title="Escuchado recientemente">
                    <ul className="space-y-0.5">
                      {stats.history.slice(0, 12).map((l) => (
                        <li key={l.at} className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors">
                          <img src={l.albumCover} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold">{l.title}</p>
                            <p className="truncate text-xs text-white/55">{l.artist}</p>
                          </div>
                          <span className="text-xs text-white/45 whitespace-nowrap">{ago(l.at)}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
