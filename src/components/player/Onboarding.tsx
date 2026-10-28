import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Camera, Check, User as UserIcon } from 'lucide-react';
import { LiquidButton } from '../ui/LiquidButton';
import { supabase } from '../../lib/supabase';
import { GENRES } from '../../lib/genres';
import { Heading, cardStyle, inputClass, slide, titleStyle } from '../auth/authUi';

type Step = 'profile' | 'tastes' | 'done';
type Status = 'idle' | 'loading' | 'success';
export type OnboardingResult = { username: string; avatarUrl: string | null; genres: string[] };

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/i;

const STEPS = [
  { title: 'Tu perfil', text: 'Tu foto y tu nombre de usuario.' },
  { title: 'Tus gustos', text: 'Para mostrarte lo tuyo primero.' },
  { title: 'A escuchar', text: 'Tu inicio ya hecho a tu medida.' },
];
const stepIndex: Record<Step, number> = { profile: 0, tastes: 1, done: 2 };

// square-crop and shrink the photo so it fits in the profiles.avatar_url text column
const toAvatar = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      const side = Math.min(img.width, img.height);
      ctx?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });

const Avatar = ({ src, size = 112 }: { src: string | null; size?: number }) => (
  <span
    className="rounded-full bg-black/30 border border-white/30 overflow-hidden flex items-center justify-center shrink-0"
    style={{ width: size, height: size }}
  >
    {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-1/2 h-1/2 text-white/70" aria-hidden="true" />}
  </span>
);

export const Onboarding = ({
  userId,
  userMeta,
  preview = false,
  onDone,
}: {
  userId: string;
  /** Google puts the name and photo here */
  userMeta?: Record<string, any>;
  /** dev preview: walks through the steps without saving anything */
  preview?: boolean;
  onDone: (result: OnboardingResult) => void;
}) => {
  const [step, setStep] = useState<Step>('profile');
  const [status, setStatus] = useState<Status>('idle');
  const [username, setUsername] = useState(() =>
    String(userMeta?.name ?? userMeta?.full_name ?? '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.]/g, '').slice(0, 20));
  const [avatar, setAvatar] = useState<string | null>(userMeta?.avatar_url ?? null);
  const [genres, setGenres] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  if (typeof document === 'undefined') return null;

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Elige una imagen'); return; }
    try { setAvatar(await toAvatar(file)); setError(''); } catch { setError('No pudimos leer esa imagen'); }
  };

  const advance = (next: Step) => {
    setStatus('success');
    setTimeout(() => { setStatus('idle'); setStep(next); }, 450);
  };

  const saveProfile = async () => {
    if (status !== 'idle') return;
    const name = username.trim();
    if (!USERNAME_RE.test(name)) { setError('Usa de 3 a 20 letras, números, punto o guion bajo'); return; }
    setError('');
    setStatus('loading');
    if (!preview) {
      const { error: err } = await supabase.from('profiles').upsert({ id: userId, username: name.toLowerCase(), avatar_url: avatar });
      if (err) {
        setStatus('idle');
        setError(err.code === '23505' ? 'Ese nombre ya está en uso' : 'Algo salió mal. Intenta de nuevo.');
        return;
      }
    }
    advance('tastes');
  };

  const saveTastes = async () => {
    if (status !== 'idle' || genres.length === 0) return;
    setStatus('loading');
    if (!preview) {
      const { error: err } = await supabase.auth.updateUser({ data: { genres } });
      if (err) { setStatus('idle'); setError('Algo salió mal. Intenta de nuevo.'); return; }
    }
    setError('');
    advance('done');
  };

  const toggle = (id: string) => setGenres((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  const active = stepIndex[step];

  return createPortal(
    <motion.div
      initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
      animate={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)' }}
      exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)', transition: { duration: 0.35 } }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Configura tu perfil"
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.25 } }}
        transition={{ type: 'spring', stiffness: 150, damping: 22, mass: 0.9, delay: 0.12, opacity: { duration: 0.45, delay: 0.12 } }}
        className="relative w-full max-w-[960px] max-h-[calc(100vh-2rem)] md:h-[min(600px,calc(100vh-2rem))] flex rounded-3xl overflow-hidden shadow-2xl text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
        style={cardStyle}
      >
        {/* Left: the steps */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center items-center relative backdrop-blur-xl overflow-y-auto">
          <div className="w-full max-w-[26rem]">
            <AnimatePresence mode="wait" initial={false}>
              {step === 'profile' && (
                <motion.div key="profile" {...slide}>
                  <Heading title="Tu perfil" subtitle="Así te verán en Bitszone." />
                  <div className="flex flex-col items-center mb-6">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="relative group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                      aria-label="Elegir foto de perfil"
                    >
                      <Avatar src={avatar} />
                      <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-7 h-7" aria-hidden="true" />
                      </span>
                    </button>
                    <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 text-[15px] text-white/85 hover:text-white transition-colors">
                      {avatar ? 'Cambiar foto' : 'Subir una foto'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-white/85" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
                        className={inputClass}
                        autoFocus
                      />
                    </div>
                    {error && <p className="text-sm text-pink-200 text-center -mt-2">{error}</p>}
                    <LiquidButton onClick={saveProfile} status={status} className="w-full h-14">Siguiente</LiquidButton>
                  </div>
                </motion.div>
              )}

              {step === 'tastes' && (
                <motion.div key="tastes" {...slide}>
                  <Heading title="Tus gustos" subtitle="Elige lo que más escuchas y lo verás primero." />
                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {GENRES.map((g) => {
                      const on = genres.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(g.id)}
                          className={`relative px-7 py-3 rounded-full border text-base font-semibold transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${on ? 'bg-white text-[#3b1a66] border-white [text-shadow:none]' : 'bg-black/30 border-white/25 text-white hover:bg-white/10'}`}
                        >
                          {/* the label slides right by half the check (12px) so "check + label" stays centred while the chip width never changes */}
                          <span className={`relative inline-block transition-transform duration-200 ${on ? 'translate-x-3' : ''}`}>
                            <Check
                              className={`absolute right-full mr-2 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200 ${on ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                              strokeWidth={3}
                              aria-hidden="true"
                            />
                            {g.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {error && <p className="text-sm text-pink-200 text-center -mt-4 mb-4">{error}</p>}
                  <LiquidButton onClick={saveTastes} status={status} className={`w-full h-14 ${genres.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                    {genres.length === 0 ? 'Elige al menos uno' : 'Siguiente'}
                  </LiquidButton>
                </motion.div>
              )}

              {step === 'done' && (
                <motion.div key="done" {...slide} className="text-center">
                  <div className="flex justify-center mb-6"><Avatar src={avatar} size={96} /></div>
                  <Heading title="¡Todo listo!" subtitle={<>Bienvenido, <span className="font-semibold text-white">{username.trim()}</span></>} />
                  <LiquidButton onClick={() => onDone({ username: username.trim().toLowerCase(), avatarUrl: avatar, genres })} className="w-full h-14">
                    Empezar a escuchar
                  </LiquidButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: where you are */}
        <div className="hidden md:flex w-1/2 p-10 flex-col justify-center items-center text-center relative overflow-hidden bg-black/30 bg-[linear-gradient(135deg,rgba(168,85,247,0.12),rgba(88,28,135,0.05))] backdrop-blur-sm">
          <h2 className="mb-4 flex flex-col items-center text-5xl font-bold" style={titleStyle}>
            <span className="mb-1">Personaliza</span>
            <span>tu Bitszone</span>
          </h2>
          <p className="text-white/90 mb-10 max-w-[85%] text-lg">Unos pasos y tu inicio se llena de lo que te gusta.</p>
          <ol className="w-full max-w-[22rem] space-y-3 text-left">
            {STEPS.map((s, i) => {
              const done = i < active || (step === 'done' && i === 2);
              const current = i === active && !done;
              return (
                <li key={s.title} className={`flex items-center gap-4 rounded-2xl px-4 py-3 border transition-all duration-500 ${current ? 'bg-white/12 border-white/35' : 'border-transparent'} ${!current && !done ? 'opacity-55' : ''}`}>
                  <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold border transition-all duration-500 ${done ? 'bg-white text-purple-900 border-white' : current ? 'border-white text-white' : 'border-white/40 text-white/80'}`}>
                    {done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="leading-tight">
                    <span className="block font-semibold">{s.title}</span>
                    <span className="block text-sm text-white/80">{s.text}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};
