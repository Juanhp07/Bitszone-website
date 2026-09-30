import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserCog } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const AuthContainer = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d12] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      
      {/* Admin Button */}
      <a 
        href="/admin" 
        className="fixed bottom-6 left-6 z-50 flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-md shadow-lg"
      >
        <UserCog className="w-5 h-5" />
        <span className="font-medium text-sm">Administrador</span>
      </a>

      {/* Background Subtle Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Main Title */}
      <h1 className="text-3xl font-bold mb-8 z-10 tracking-wider">
        {isFlipped ? "Crear Cuenta" : "Iniciar Sesion"}
      </h1>

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
            className="absolute inset-0 w-full h-full flex rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ 
              backfaceVisibility: "hidden", 
              background: "rgba(20, 20, 25, 0.7)", 
              backdropFilter: "blur(20px)" 
            }}
          >
            {/* Left Side: Login Form */}
            <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center relative">
              <h2 className="text-4xl font-bold mb-2">Login</h2>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Por favor, introduzca sus datos para iniciar sesion.
              </p>
              
              {/* Instagram Icon */}
              <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 mb-8 hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
                <InstagramIcon className="text-white w-6 h-6" />
              </button>

              <div className="w-full max-w-sm space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Correo Electronico"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-center"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-center"
                  />
                </div>

                <div className="flex items-center justify-between text-sm mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-400 text-purple-500 focus:ring-purple-500 bg-transparent cursor-pointer" />
                    <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Recuerdame</span>
                  </label>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Olvidaste la contraseña?
                  </a>
                </div>

                <button className="w-full mt-8 py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
                  Ingresar
                </button>
              </div>
            </div>

            {/* Right Side: Welcome */}
            <div className="hidden md:flex w-1/2 p-10 flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-purple-900/40 to-black">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="text-4xl font-bold mb-4 z-10">Bienvenidos a BitsZone</h2>
              <p className="text-gray-300 mb-8 max-w-[80%] z-10">
                Introduce tus datos personales y unete al viaje musical con nosotros
              </p>
              <button 
                onClick={() => setIsFlipped(true)}
                className="z-10 py-3 px-12 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-black transition-all duration-300"
              >
                Registrate
              </button>
            </div>
          </div>

          {/* BACK FACE (REGISTER) */}
          <div
            className="absolute inset-0 w-full h-full flex rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)",
              background: "rgba(20, 20, 25, 0.7)", 
              backdropFilter: "blur(20px)" 
            }}
          >
            {/* Left Side: Welcome Back (Now on left in back face) */}
            <div className="hidden md:flex w-1/2 p-10 flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-black">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="text-4xl font-bold mb-4 z-10">¡Hola de nuevo!</h2>
              <p className="text-gray-300 mb-8 max-w-[80%] z-10">
                Si ya tienes una cuenta en BitsZone, inicia sesión aquí para continuar tu viaje musical.
              </p>
              <button 
                onClick={() => setIsFlipped(false)}
                className="z-10 py-3 px-12 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-black transition-all duration-300"
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-center"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Correo Electronico"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-center"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-center"
                  />
                </div>

                <button className="w-full mt-8 py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
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
