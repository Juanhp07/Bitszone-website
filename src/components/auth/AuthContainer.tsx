import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SpecularText } from '../ui/SpecularText';
import { Mail, Lock, User, UserCog, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import LiquidCrystalBackground from '../ui/LiquidCrystalBackground';
import { LiquidButton } from '../ui/LiquidButton';

const GmailIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75V40h7c1.657,0,3-1.343,3-3V16.2z"/>
    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
    <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"/>
    <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"/>
  </svg>
);

const OutlookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
    <path fill="#03a9f4" d="M42,12H16v24h26c1.105,0,2-0.895,2-2V14C44,12.895,43.105,12,42,12z"/>
    <path fill="#0277bd" d="M26,17h13v14H26V17z"/>
    <path fill="#4fc3f7" d="M32.5,29.5l-5-5l5-5l5,5L32.5,29.5z"/>
    <path fill="#0277bd" d="M16,14l0,20l-12,3V11L16,14z"/>
    <path fill="#fff" d="M12.125,23.5c0-1.933-1.166-3.5-2.625-3.5s-2.625,1.567-2.625,3.5s1.166,3.5,2.625,3.5 S12.125,25.433,12.125,23.5z M8.208,23.5c0-1.381,0.579-2.5,1.292-2.5s1.292,1.119,1.292,2.5s-0.579,2.5-1.292,2.5 S8.208,24.881,8.208,23.5z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
    <path fill="#1976D2" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"/>
    <path fill="#fff" d="M26.572 29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075 1.332-3.065 2.99-3.065h2.736v-4.148s-2.482-0.423-4.851-0.423c-4.945 0-8.156 2.986-8.156 8.358v2.008h-4.912v4.995h4.912v13.061c1.552 0.245 3.155 0.38 4.8 0.38 1.488 0 2.935-0.114 4.341-0.33v-13.111h-1.859z"/>
  </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className={className}>
    <path fill="#ffffff" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

export const AuthContainer = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [registerStatus, setRegisterStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return; // Prevent action if empty
    if (loginStatus !== 'idle') return;
    
    setLoginStatus('loading');
    setTimeout(() => {
      setLoginStatus('success');
      // Reset after a moment so they can click again if needed
      setTimeout(() => setLoginStatus('idle'), 2500);
    }, 1500);
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerEmail || !registerPassword || !registerConfirmPassword) return; // Prevent action if empty
    if (registerStatus !== 'idle') return;
    
    setRegisterStatus('loading');
    setTimeout(() => {
      setRegisterStatus('success');
      // Reset after a moment so they can click again if needed
      setTimeout(() => setRegisterStatus('idle'), 2500);
    }, 1500);
  };

  const MemoizedBackgrounds = React.useMemo(() => (
    <div className="absolute inset-0 z-0">
      <LiquidCrystalBackground speed={0.5} />
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      
      {MemoizedBackgrounds}

      {/* Admin Button */}
      <a 
        href="/admin" 
        className="fixed bottom-6 left-6 z-50 flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-md shadow-lg"
      >
        <UserCog className="w-5 h-5" />
        <span className="font-medium text-sm">Administrador</span>
      </a>

      {/* 3D Perspective Container */}
      <div style={{ perspective: 1200 }} className="z-10 w-full max-w-[900px]">
        <motion.div
          className="relative w-full h-[650px]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT FACE (LOGIN) */}
          <div
            className="absolute inset-0 w-full h-full flex rounded-3xl overflow-hidden shadow-2xl"
            style={{ 
              backfaceVisibility: "hidden", 
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(88, 28, 135, 0.05) 100%)",
              border: "1px solid rgba(216, 180, 254, 0.12)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)"
            }}
          >
            {/* Left Side: Login Form */}
            <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center relative">
              <h2 className="mb-2 z-10">
                <SpecularText
                  text="Login"
                  className="text-4xl font-bold"
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: "italic",
                  }}
                  specularColor="#5A1B5E"
                  baseStrokeColor="transparent"
                  strokeWidth={1.5}
                  glowSize={50}
                />
              </h2>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Por favor, introduzca sus datos para iniciar sesion.
              </p>
              
              {/* Social Login Icons */}
              <div className="flex justify-center space-x-4 mb-8">
                <button className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  <GmailIcon className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </button>
                <button className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  <FacebookIcon className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </button>
                <button className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  <AppleIcon className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </button>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type="email"
                    placeholder="Correo Electronico"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 group-hover:placeholder-white group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:placeholder-white focus:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 group-hover:placeholder-white group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:placeholder-white focus:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm mt-4">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-5 h-5 border border-white/20 bg-white/5 backdrop-blur-md rounded-[6px] cursor-pointer checked:bg-[#5A1B5E]/80 checked:border-[#5A1B5E] transition-all duration-300 hover:bg-white/10" 
                      />
                      <svg 
                        className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-300 scale-50 peer-checked:scale-100"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-gray-400 transition-colors group-hover:text-gray-300">Recuerdame</span>
                  </label>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Olvidaste la contraseña?
                  </a>
                </div>

                <LiquidButton 
                  onClick={handleLogin}
                  status={loginStatus}
                  className="w-full mt-8 h-[52px]"
                >
                  Ingresar
                </LiquidButton>
              </div>
            </div>

            {/* Right Side: Welcome */}
            <div className="hidden md:flex w-1/2 p-10 flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-purple-900/80 to-black/90">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="mb-4 z-10 flex flex-col items-center">
                <SpecularText
                  text="Bienvenidos a"
                  className="text-4xl font-bold mb-1"
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: "italic",
                  }}
                  specularColor="#5A1B5E"
                  baseStrokeColor="transparent"
                  strokeWidth={1.5}
                  glowSize={50}
                />
                <SpecularText
                  text="Bitszone"
                  className="text-4xl font-bold"
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: "italic",
                  }}
                  specularColor="#5A1B5E"
                  baseStrokeColor="transparent"
                  strokeWidth={1.5}
                  glowSize={50}
                />
              </h2>
              <p className="text-gray-300 mb-8 max-w-[80%] z-10">
                Introduce tus datos personales y unete al viaje musical con nosotros
              </p>
              <LiquidButton 
                onClick={() => setIsFlipped(true)}
                className="z-10 py-3 px-12"
              >
                Registrate
              </LiquidButton>
            </div>
          </div>

          {/* BACK FACE (REGISTER) */}
          <div
            className="absolute inset-0 w-full h-full flex rounded-3xl overflow-hidden shadow-2xl"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(88, 28, 135, 0.05) 100%)",
              border: "1px solid rgba(216, 180, 254, 0.12)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)"
            }}
          >
            {/* Left Side: Welcome Back */}
            <div className="hidden md:flex w-1/2 p-10 flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-purple-900/80 to-black/90">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="mb-4 z-10 flex flex-col items-center">
                <SpecularText
                  text="¡Hola de nuevo!"
                  className="text-4xl font-bold"
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: "italic",
                    textShadow: "0px 4px 15px rgba(255, 255, 255, 0.2)"
                  }}
                  strokeWidth={1.5}
                  glowSize={50}
                />
              </h2>
              <p className="text-gray-300 mb-8 max-w-[80%] z-10">
                Si ya tienes una cuenta en BitsZone, inicia sesión aquí para continuar tu viaje musical.
              </p>
              <LiquidButton 
                onClick={() => setIsFlipped(false)}
                className="z-10 py-3 px-12"
              >
                Iniciar Sesión
              </LiquidButton>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center relative overflow-y-auto max-h-full">
              <h2 className="mb-2 z-10 flex flex-col items-center">
                <SpecularText
                  text="Registro"
                  className="text-4xl font-bold"
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: "italic",
                    textShadow: "0px 4px 15px rgba(255, 255, 255, 0.2)"
                  }}
                  strokeWidth={1.5}
                  glowSize={50}
                />
              </h2>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Crea una cuenta a tu nuevo mundo musical
              </p>
              
              <div className="w-full max-w-sm space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 group-hover:placeholder-white group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:placeholder-white focus:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:outline-none focus:border-[#9B7bf7] focus:ring-1 focus:ring-[#9B7bf7] transition-all text-center"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 group-hover:placeholder-white group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:placeholder-white focus:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:outline-none focus:border-[#9B7bf7] focus:ring-1 focus:ring-[#9B7bf7] transition-all text-center"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 group-hover:placeholder-white group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:placeholder-white focus:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:outline-none focus:border-[#9B7bf7] focus:ring-1 focus:ring-[#9B7bf7] transition-all text-center"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 group-hover:placeholder-white group-hover:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:placeholder-white focus:[text-shadow:0_0_8px_rgba(255,255,255,0.8)] focus:outline-none focus:border-[#9B7bf7] focus:ring-1 focus:ring-[#9B7bf7] transition-all text-center"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showRegisterConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <LiquidButton 
                  onClick={handleRegister}
                  status={registerStatus}
                  className="w-full mt-6 h-[52px] px-4"
                >
                  Crear
                </LiquidButton>

                {/* Social Divider */}
                <div className="flex items-center justify-center space-x-4 pt-2">
                  <div className="h-px bg-white/20 w-16"></div>
                  <span className="text-gray-400 text-sm">o</span>
                  <div className="h-px bg-white/20 w-16"></div>
                </div>

                {/* Social Icons */}
                <div className="flex justify-center space-x-4 pb-4">
                  <button className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                    <GmailIcon className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </button>
                  <button className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                    <FacebookIcon className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </button>
                  <button className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                    <AppleIcon className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};
