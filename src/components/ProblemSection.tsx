import React from 'react';
import { FileWarning, HardDrive, ClockAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const problems = [
  {
    id: 1,
    title: "El fin de los archivos fantasma",
    description: "Se acabó el modo avión silencioso. Visualiza exactamente qué pistas están listas para escucharse offline y cuáles siguen en la nube.",
    icon: <FileWarning size={24} className="text-[#a855f7]" />,
    gradient: "from-[#a855f7]/20 to-[#c026d3]/20",
    borderGlow: "group-hover:border-[#a855f7] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
  },
  {
    id: 2,
    title: "Control total de tu espacio",
    description: "Cero descargas ciegas. Monitorea al milímetro cuánto almacenamiento ocupa tu biblioteca musical y adminístralo con un solo toque.",
    icon: <HardDrive size={24} className="text-[#3b82f6]" />,
    gradient: "from-[#3b82f6]/20 to-[#0ea5e9]/20",
    borderGlow: "group-hover:border-[#3b82f6] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
  },
  {
    id: 3,
    title: "Licencias siempre vigentes",
    description: "No más caducidades sorpresa. Recibe notificaciones predictivas antes de que tus descargas expiren para mantener tu música siempre activa.",
    icon: <ClockAlert size={24} className="text-[#06b6d4]" />,
    gradient: "from-[#06b6d4]/20 to-[#14b8a6]/20",
    borderGlow: "group-hover:border-[#06b6d4] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
  }
];

export const ProblemSection = () => {
  return (
    <section className="py-32 px-6 md:px-16 w-full max-w-[1440px] mx-auto relative z-10 flex flex-col items-center">
      
      {/* Background glow - pushed down so the blur doesn't get sliced by the section boundary above */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#a855f7]/10 blur-[120px] rounded-[100%] pointer-events-none -z-10"></div>

      {/* Typography / Copywriting */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-4xl mx-auto mb-20"
      >
        <h2 className="text-4xl md:text-6xl font-sora font-bold text-white leading-tight mb-6">
          Tu música no debería abandonarte <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-[#d946ef] to-[#3b82f6]">cuando más la necesitas.</span>
        </h2>
        <p className="text-[#A0A3BD] text-lg md:text-xl font-inter max-w-3xl mx-auto leading-relaxed">
          Descargas incompletas, archivos fantasma y sincronizaciones fallidas son historia. Bitszone erradica la incertidumbre dándote <strong>visibilidad y control absoluto</strong> sobre tu biblioteca sin conexión.
        </p>
      </motion.div>

      {/* Glassmorphism Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
        {problems.map((item, i) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
            className={`group relative rounded-2xl p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer overflow-hidden ${item.borderGlow}`}
          >
            {/* Background Hover Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
            
            {/* Icon Wrapper */}
            <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_10s_linear_infinite] group-hover:border-transparent transition-colors"></div>
              {item.icon}
            </div>
            
            {/* Text Content */}
            <h3 className="text-white font-sora font-semibold text-xl mb-3">{item.title}</h3>
            <p className="text-[#A0A3BD] font-inter text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="mt-20"
      >
        <button className="relative px-8 py-4 rounded-full font-inter font-semibold text-white transition-all hover:scale-105 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7] to-[#3b82f6] rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7] to-[#3b82f6] rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
          <span className="relative z-10 text-[17px] tracking-wide">Probar Bitszone Gratis</span>
        </button>
      </motion.div>

    </section>
  );
};
