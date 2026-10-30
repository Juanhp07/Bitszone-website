import { BackButton } from '../ui/BackButton';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Mail, ArrowLeft, Check, Link2, User, UserCog, KeyRound, Eye, EyeOff } from 'lucide-react';
import GradientASCII from '../ui/GradientASCII';
import { LiquidButton } from '../ui/LiquidButton';
import { supabase } from '../../lib/supabase';
import { Heading, cardStyle, inputClass, slide, titleStyle } from './authUi';

// One flow for everyone: no separate "register" and "login". First time = account is created.
// Email: one-time code (or the link in the same email). Google: OAuth. Both come back through /login.
// The profile (photo, username, tastes) is completed inside the player, in <Onboarding />.
// Admin users can optionally sign in with email + password via the top toggle.
type Step = 'choose' | 'google' | 'code' | 'password' | 'done';
type Status = 'idle' | 'loading' | 'success';

// must match Supabase > Authentication > Providers > Email > Email OTP Length
const CODE_LENGTH = 8;
const RESEND_SECONDS = 30;
const AFTER_LOGIN = '/player';

const friendly = (e: { message?: string; status?: number }) =>
  e.status === 429 || /rate limit|too many|seconds/i.test(e.message ?? '')
    ? 'Demasiados intentos. Espera un momento y vuelve a intentar.'
    : 'Algo salió mal. Intenta de nuevo.';

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

type Method = 'email' | 'google' | 'admin';

const STEPS: Record<Method, { title: string; text: string }[]> = {
  email: [
    { title: 'Elige cómo entrar', text: 'Con Google o con tu correo.' },
    { title: 'Confirma que eres tú', text: `Un código de ${CODE_LENGTH} dígitos o un enlace.` },
    { title: 'Listo, a escuchar', text: 'Sin contraseñas que recordar.' },
  ],
  google: [
    { title: 'Elige cómo entrar', text: 'Con Google o con tu correo.' },
    { title: 'Autoriza con Google', text: 'Eliges tu cuenta y compartimos solo tu nombre, correo y foto.' },
    { title: 'Listo, a escuchar', text: 'Entras directo con tu perfil de Google.' },
  ],
  admin: [
    { title: 'Acceso Administrador', text: 'Credenciales del sistema.' },
    { title: 'Verificación segura', text: 'Autenticación con contraseña.' },
    { title: 'Panel de Control', text: 'Acceso completo al Dashboard.' },
  ],
};

const SUBTITLE: Record<Method, string> = {
  email: 'Tu música, sin contraseñas que recordar.',
  google: 'Entra con tu cuenta de Google, sin crear nada nuevo.',
  admin: 'Acceso administrativo seguro para gestionar Bitszone.',
};

const stepIndex: Record<Method, Record<Step, number>> = {
  email: { choose: 0, google: 0, code: 1, password: 1, done: 2 },
  google: { choose: 0, google: 1, code: 1, password: 1, done: 2 },
  admin: { choose: 0, google: 0, code: 1, password: 1, done: 2 },
};

// the background reveals in this many seconds; the card and the corner buttons come in right as it reaches them
const BG_INTRO_SECONDS = 1.4;

export const AuthContainer = () => {
  const [step, setStep] = useState<Step>('choose');
  const [method, setMethod] = useState<Method>('email');
  const [status, setStatus] = useState<Status>('idle');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [codeError, setCodeError] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const handled = useRef(false);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const reduceMotion = useReducedMotion();
  const intro = useMotionValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) { intro.set(1); return; }
    // the background drives `intro`; if it never does (no WebGL), reveal anyway
    const t = setTimeout(() => { if (intro.get() === 0) animate(intro, 1, { duration: 0.6 }); }, 2500);
    return () => clearTimeout(t);
  }, [reduceMotion, intro]);
  // the card is uncovered from its bottom edge upwards, as the wave passes over it
  const cardReveal = useTransform(intro, [0.18, 0.72], [0, 1], { clamp: true });
  const cardMask = useTransform(cardReveal, (v) => (v >= 1 ? 'none' : `linear-gradient(to top, #000 ${v * 150 - 50}%, transparent ${v * 150}%)`));
  const cardY = useTransform(cardReveal, [0, 1], [22, 0]);
  const cornerOpacity = useTransform(intro, [0.55, 0.9], [0, 1], { clamp: true });

  const MemoizedBackgrounds = useMemo(() => (
    <div className="absolute inset-0 z-0">
      <GradientASCII colors={['#8a3aed', '#9c55f7', '#d05adc', '#bb38f8']} glow={0.15} grain={0.05} flicker={0.06} speed={0.55} introSeconds={BG_INTRO_SECONDS} introProgress={intro} gradientOpacity={0.85} style={{ filter: 'brightness(0.92)' }} />
      {/* vignette: keeps the vivid glow near the top and eases the edges so it doesn't tire the eyes */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 120% 95% at 50% 15%, transparent 45%, rgba(5,5,10,0.22) 80%, rgba(5,5,10,0.5) 100%)' }} />
    </div>
  ), []);

  // resend countdown while on the code step
  useEffect(() => {
    if (step !== 'code' || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const afterSignIn = (session: { user: { app_metadata?: any } }) => {
    if (handled.current) return;
    handled.current = true;
    setMethod(session.user.app_metadata?.provider === 'google' ? 'google' : 'email');
    setStatus('success');
    setStep('done');
  };

  // coming back from Google or from the link in the email
  useEffect(() => {
    const back = window.location.hash + window.location.search;
    if (!/access_token|error_description|[?&]code=/.test(back)) return;
    if (/provider_token/.test(back)) { setMethod('google'); setStep('google'); }
    if (/error_description/.test(back)) {
      setStep('choose');
      setEmailError('No pudimos iniciar sesión. Intenta de nuevo.');
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) afterSignIn(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) afterSignIn(session); });
    window.history.replaceState(null, '', window.location.pathname);
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (step !== 'done') return;
    const t = setTimeout(() => { window.location.href = AFTER_LOGIN; }, 1400);
    return () => clearTimeout(t);
  }, [step]);

  const sendCode = async () => {
    if (status !== 'idle') return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setEmailError('Escribe un correo válido'); return; }
    setEmailError('');
    setMethod('email');
    setStatus('loading');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) { setStatus('idle'); setEmailError(friendly(error)); return; }
    setStatus('success');
    setTimeout(() => {
      setStatus('idle');
      setDigits(Array(CODE_LENGTH).fill(''));
      setCodeError('');
      setSeconds(RESEND_SECONDS);
      setStep('code');
    }, 450);
  };

  const resend = async () => {
    setSeconds(RESEND_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(''));
    setCodeError('');
    digitRefs.current[0]?.focus();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) setCodeError(friendly(error));
  };

  const continueWithGoogle = async () => {
    setMethod('google');
    setStep('google');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) { setStep('choose'); setEmailError(friendly(error)); }
  };

  const signInWithPassword = async () => {
    if (status !== 'idle') return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setEmailError('Escribe un correo válido'); return; }
    if (!password) { setPasswordError('Escribe tu contraseña'); return; }
    setEmailError('');
    setPasswordError('');
    setMethod('admin');
    setStatus('loading');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    if (error || !data.session) {
      setStatus('idle');
      setPasswordError(
        error?.message?.toLowerCase().includes('invalid') || error?.message?.toLowerCase().includes('credentials')
          ? 'Correo o contraseña incorrectos'
          : friendly(error || {})
      );
      return;
    }
    afterSignIn(data.session);
  };


  const setDigit = (i: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) { setDigits((d) => d.map((x, k) => (k === i ? '' : x))); return; }
    // typing or pasting: spread the digits over the boxes
    const next = [...digits];
    clean.slice(0, CODE_LENGTH - i).split('').forEach((c, k) => { next[i + k] = c; });
    setDigits(next);
    setCodeError('');
    digitRefs.current[Math.min(i + clean.length, CODE_LENGTH - 1)]?.focus();
    if (next.every(Boolean)) verify(next);
  };

  const onDigitKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) digitRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) digitRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) digitRefs.current[i + 1]?.focus();
    if (e.key === 'Enter') verify();
  };

  const verify = async (code: string[] = digits) => {
    if (status !== 'idle') return;
    if (code.join('').length < CODE_LENGTH) { setCodeError(`Escribe los ${CODE_LENGTH} dígitos`); return; }
    setStatus('loading');
    const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.join(''), type: 'email' });
    if (error || !data.session) {
      setStatus('idle');
      setCodeError(error?.status === 429 ? friendly(error) : 'Código incorrecto o vencido');
      setDigits(Array(CODE_LENGTH).fill(''));
      digitRefs.current[0]?.focus();
      return;
    }
    afterSignIn(data.session);
  };

  const active = stepIndex[method][step];
  const steps = STEPS[method];

  const toggleAdmin = () => {
    if (step === 'password') {
      setEmail('');
      setPassword('');
      setEmailError('');
      setPasswordError('');
      setMethod('email');
      setStep('choose');
    } else {
      setEmail(email.trim() || 'bitszone.app@gmail.com');
      setPassword('');
      setEmailError('');
      setPasswordError('');
      setMethod('admin');
      setStep('password');
    }
  };

  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">

      {MemoizedBackgrounds}

      {(step === 'choose' || step === 'password') && (
        <motion.div
          style={{ opacity: cornerOpacity }}
          className="absolute top-5 right-5 md:top-8 md:right-8 z-20"
        >
          <BackButton
            dark
            reverse
            onClick={toggleAdmin}
            label={step === 'password' ? 'Volver al inicio de sesión normal' : 'Acceso para administrador'}
            text={step === 'password' ? 'Usuario' : 'Admin'}
            hoverWidth={step === 'password' ? 'hover:w-[118px] md:hover:w-[126px]' : 'hover:w-[104px] md:hover:w-[112px]'}
            icon={step === 'password'
              ? <User className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
              : <UserCog className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />}
          />
        </motion.div>
      )}

      {(step === 'choose' || step === 'password') && (
        <motion.div
          style={{ opacity: cornerOpacity }}
          className="absolute top-5 left-5 md:top-8 md:left-8 z-20"
        >
          <BackButton
            dark
            onClick={() => {
              if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) window.history.back();
              else window.location.href = '/player';
            }}
          />
        </motion.div>
      )}

      <motion.div
        className="relative z-10 w-full max-w-[960px] md:h-[min(600px,calc(100vh-2rem))] flex rounded-3xl overflow-hidden shadow-2xl [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
        style={{ ...cardStyle, y: cardY, WebkitMaskImage: cardMask, maskImage: cardMask }}
      >
        {/* Left: the flow */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center items-center relative backdrop-blur-xl min-h-[560px] md:min-h-0">


          <div className="w-full max-w-[26rem]">
            <AnimatePresence mode="wait" initial={false}>
              {step === 'choose' && (
                <motion.div key="choose" {...slide}>
                  <Heading title="Bienvenido" subtitle="Entra o crea tu cuenta en un solo paso." />

                  <button
                    onClick={continueWithGoogle}
                    className="w-full h-14 rounded-xl flex items-center justify-center gap-3 bg-white/90 hover:bg-white text-[#1f1f1f] font-semibold [text-shadow:none] transition-all active:scale-[0.99] shadow-lg"
                  >
                    <GoogleIcon className="w-5 h-5" />
                    Continuar con Google
                  </button>

                  <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-white/25 flex-1" />
                    <span className="text-white/85 text-sm">o con tu correo</span>
                    <div className="h-px bg-white/25 flex-1" />
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white/85" />
                      </div>
                      <input
                        type="email"
                        placeholder="Correo Electronico"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                        className={inputClass}
                      />
                    </div>
                    {emailError && <p className="text-sm text-pink-200 text-center -mt-2">{emailError}</p>}
                    <LiquidButton onClick={sendCode} status={status} className="w-full h-14 !rounded-full !bg-white/[0.04] hover:!bg-white/[0.1] !border-white/35 hover:!border-white/55 !backdrop-blur-2xl !shadow-[0_8px_30px_rgba(0,0,0,0.3)] active:scale-[0.99]">
                      Continuar con correo
                    </LiquidButton>
                  </div>

                  <p className="mt-4 text-xs text-white/70 text-center leading-relaxed">
                    Al continuar aceptas los Términos y la Política de privacidad.
                  </p>
                </motion.div>
              )}

              {step === 'google' && (
                <motion.div key="google" {...slide} className="text-center py-6">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <GoogleIcon className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-bold mb-3" style={titleStyle}>Conectando con Google</h2>
                  <p className="text-base text-white/85 mb-6">Elige tu cuenta en la ventana de Google.</p>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="w-2.5 h-2.5 rounded-full bg-white"
                        animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'code' && (
                <motion.div key="code" {...slide}>
                  <Heading
                    title="Revisa tu correo"
                    subtitle={<>Enviamos un código de {CODE_LENGTH} dígitos a<br /><span className="font-semibold text-white">{email}</span></>}
                  />

                  <div className="flex justify-between gap-2 mb-2" onPaste={(e) => { e.preventDefault(); setDigit(0, e.clipboardData.getData('text')); }}>
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { digitRefs.current[i] = el; }}
                        value={d}
                        inputMode="numeric"
                        autoFocus={i === 0}
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        maxLength={CODE_LENGTH}
                        onChange={(e) => setDigit(i, e.target.value)}
                        onKeyDown={(e) => onDigitKey(i, e)}
                        onFocus={(e) => e.currentTarget.select()}
                        aria-label={`Dígito ${i + 1}`}
                        className={`w-full min-w-0 h-16 p-0 text-2xl leading-none font-semibold text-center bg-black/30 border rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all ${codeError ? 'border-pink-300/70' : d ? 'border-white/50' : 'border-white/25'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-sm text-center h-5 mb-4 ${codeError ? 'text-pink-200' : 'text-transparent'}`}>{codeError || '.'}</p>

                  <LiquidButton onClick={() => verify()} status={status} className="w-full h-14">
                    Verificar y entrar
                  </LiquidButton>

                  <div className="mt-5 flex items-center justify-between text-[15px]">
                    <button onClick={() => setStep('choose')} className="flex items-center gap-1.5 text-white/85 hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Cambiar correo
                    </button>
                    {seconds > 0 ? (
                      <span className="text-white/70">Reenviar en 0:{String(seconds).padStart(2, '0')}</span>
                    ) : (
                      <button onClick={resend} className="text-white font-semibold hover:underline">
                        Reenviar código
                      </button>
                    )}
                  </div>

                  <div className="mt-6 flex items-start gap-3 rounded-xl bg-black/25 border border-white/15 px-4 py-3 text-sm text-white/85">
                    <Link2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>El correo también trae un enlace: ábrelo desde ese mismo dispositivo y entrarás sin escribir nada.</span>
                  </div>
                </motion.div>
              )}

              {step === 'password' && (
                <motion.div key="password" {...slide}>
                  <Heading
                    title="Acceso Administrador"
                    subtitle="Inicia sesión con correo y contraseña autorizados."
                  />

                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white/85" />
                      </div>
                      <input
                        type="email"
                        placeholder="Correo de Administrador"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        className={inputClass}
                      />
                    </div>
                    {emailError && <p className="text-sm text-pink-200 text-center -mt-2">{emailError}</p>}

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-white/85" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && signInWithPassword()}
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white cursor-pointer"
                        title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordError && <p className="text-sm text-pink-200 text-center -mt-2">{passwordError}</p>}

                    <LiquidButton onClick={signInWithPassword} status={status} className="w-full h-14 !rounded-full !bg-white/[0.04] hover:!bg-white/[0.1] !border-white/35 hover:!border-white/55 !backdrop-blur-2xl !shadow-[0_8px_30px_rgba(0,0,0,0.3)] active:scale-[0.99]">
                      Entrar al Dashboard
                    </LiquidButton>
                  </div>
                </motion.div>
              )}

              {step === 'done' && (
                <motion.div key="done" {...slide} className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="mx-auto mb-6 w-20 h-20 rounded-full bg-white/15 border border-white/40 flex items-center justify-center shadow-[0_0_40px_rgba(187,56,248,0.45)]"
                  >
                    <Check className="w-10 h-10" strokeWidth={3} />
                  </motion.div>
                  <h2 className="text-5xl font-bold mb-3" style={titleStyle}>¡Bienvenido!</h2>
                  <p className="text-base text-white/85 mb-8">Entrando a tu música…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: where you are in the flow */}
        <div className="hidden md:flex w-1/2 p-10 flex-col justify-center items-center text-center relative overflow-hidden bg-black/30 bg-[linear-gradient(135deg,rgba(168,85,247,0.12),rgba(88,28,135,0.05))] backdrop-blur-sm">
          <h2 className="mb-4 flex flex-col items-center text-5xl font-bold" style={titleStyle}>
            <span className="mb-1">Bienvenidos a</span>
            <span>Bitszone</span>
          </h2>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={method} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
              className="text-white/90 mb-10 max-w-[85%] text-lg">
              {SUBTITLE[method]}
            </motion.p>
          </AnimatePresence>

          <ol className="w-full max-w-[22rem] space-y-3 text-left">
            {steps.map((s, i) => {
              const done = i < active || step === 'done';
              const current = i === active && step !== 'done';
              return (
                <li key={method + i} className={`flex items-center gap-4 rounded-2xl px-4 py-3 border transition-all duration-500 ${current ? 'bg-white/12 border-white/35' : 'border-transparent'} ${!current && !done ? 'opacity-55' : ''}`}>
                  <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm leading-none tabular-nums font-semibold border transition-all duration-500 [text-shadow:none] ${done ? 'bg-white text-purple-900 border-white' : current ? 'border-white text-white' : 'border-white/40 text-white/80'}`}>
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
    </div>
  );
};
