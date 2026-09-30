import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserCog } from 'lucide-react';
import MoltenMetal from '../ui/MoltenMetal';
import LiquidEther from '../ui/LiquidEther';

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

export const AuthContainer = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      
      {/* Global Molten Metal Background */}
      <div className="absolute inset-0 z-0">
        <MoltenMetal
          color1="#5227FF"
          color2="#FF9FFC"
          color3="#B497CF"
          speed={0.2}
          scale={2.5}
          detail={4}
          glow={0.5}
          coreSize={0.15}
          swirl={1.2}
          fold={-0.3}
          blackPoint={0.5}
          brightness={0.6}
          colorMode="molten"
          grain={true}
          grainIntensity={0.03}
          opacity={0.8}
          backgroundColor="#05050A"
          lightMode={false}
          mouseInteraction={true}
          mouseStrength={0.8}
        />
      </div>

      {/* LiquidEther Landing Background */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B497CF']}
          mouseForce={30}
          cursorSize={150}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.8}
          autoIntensity={3.0}
          takeoverDuration={0.25}
          backgroundColor="transparent"
          lightMode={false}
        />
      </div>

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
          className="relative w-full h-[550px]"
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
              <h2 className="text-4xl font-bold mb-2">Login</h2>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Por favor, introduzca sus datos para iniciar sesion.
              </p>
              
              {/* Social Login Icons */}
              <div className="flex space-x-6 mb-8">
                <button className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  <GmailIcon className="w-6 h-6 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </button>
                <button className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  <OutlookIcon className="w-6 h-6 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center"
                  />
                </div>

                <div className="flex items-center justify-between text-sm mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer group-checkbox">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-400 text-purple-500 focus:ring-purple-500 bg-transparent cursor-pointer" />
                    <span className="text-gray-400 transition-colors hover:text-gray-300">Recuerdame</span>
                  </label>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Olvidaste la contraseña?
                  </a>
                </div>

                <button className="w-full mt-8 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/40 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.2)]">
                  Ingresar
                </button>
              </div>
            </div>

            {/* Right Side: Welcome */}
            <div className="hidden md:flex w-1/2 p-10 flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-purple-900/40 to-black">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="text-4xl font-bold mb-4 z-10">Bienvenidos a Bitszone</h2>
              <p className="text-gray-300 mb-8 max-w-[80%] z-10">
                Introduce tus datos personales y unete al viaje musical con nosotros
              </p>
              <button 
                onClick={() => setIsFlipped(true)}
                className="z-10 py-3 px-12 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/40 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.2)]"
              >
                Registrate
              </button>
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
            <div className="hidden md:flex w-1/2 p-10 flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-black">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="text-4xl font-bold mb-4 z-10">¡Hola de nuevo!</h2>
              <p className="text-gray-300 mb-8 max-w-[80%] z-10">
                Si ya tienes una cuenta en BitsZone, inicia sesión aquí para continuar tu viaje musical.
              </p>
              <button 
                onClick={() => setIsFlipped(false)}
                className="z-10 py-3 px-12 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/40 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.2)]"
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center relative">
              <h2 className="text-4xl font-bold mb-2">Registro</h2>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Crea tu cuenta para acceder a la plataforma.
              </p>
              
              <div className="w-full max-w-sm space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type="email"
                    placeholder="Correo Electronico"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center"
                  />
                </div>

                <button className="w-full mt-8 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/40 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.2)]">
                  Crear Cuenta
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};
