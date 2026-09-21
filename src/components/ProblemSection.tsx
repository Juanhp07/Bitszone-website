import React from 'react';
import { FileWarning, HardDrive, ClockAlert } from 'lucide-react';

const problems = [
  {
    id: 1,
    title: "El fin de los archivos fantasma",
    description: "Se acabó el modo avión silencioso. Visualiza exactamente qué pistas están listas para escucharse offline y cuáles siguen en la nube.",
    icon: <FileWarning size={24} className="text-[#a855f7]" />
  },
  {
    id: 2,
    title: "Control total de tu espacio",
    description: "Cero descargas ciegas. Monitorea al milímetro cuánto almacenamiento ocupa tu biblioteca musical y adminístralo con un solo toque.",
    icon: <HardDrive size={24} className="text-[#3b82f6]" />
  },
  {
    id: 3,
    title: "Licencias siempre vigentes",
    description: "No más caducidades sorpresa. Recibe notificaciones predictivas antes de que tus descargas expiren para mantener tu música siempre activa.",
    icon: <ClockAlert size={24} className="text-[#06b6d4]" />
  }
];

export const ProblemSection = () => {
  return (
    <section className="py-32 px-6 md:px-16 w-full max-w-[1440px] mx-auto relative z-10 flex flex-col items-center">
      
      {/* Background glow */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#a855f7]/5 blur-[120px] rounded-[100%] pointer-events-none -z-10"></div>

      {/* Typography / Copywriting */}
      <div className="text-center max-w-4xl mx-auto mb-20">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-white leading-[1.2] mb-6">
          Tu música no debería <br className="hidden md:block" /> abandonarte <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-[#d946ef] to-[#3b82f6]">cuando más la necesitas.</span>
        </h2>
        <p className="text-[#A0A3BD] text-lg md:text-xl font-inter max-w-3xl mx-auto leading-relaxed">
          Descargas incompletas, archivos fantasma y sincronizaciones fallidas son historia. Bitszone erradica la incertidumbre dándote <strong className="text-white">visibilidad y control absoluto</strong> sobre tu biblioteca sin conexión.
        </p>
      </div>

      {/* Static Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl mx-auto">
        {problems.map((item) => (
          <div 
            key={item.id} 
            className="rounded-2xl p-8 bg-white/[0.03] border border-white/5 flex flex-col"
          >
            {/* Icon Wrapper */}
            <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6">
              {item.icon}
            </div>
            
            {/* Text Content */}
            <h3 className="text-white font-sora font-semibold text-xl mb-3">{item.title}</h3>
            <p className="text-[#A0A3BD] font-inter text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="mt-20">
        <button className="px-8 py-4 rounded-full font-inter font-semibold text-white bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-[17px] tracking-wide">
          Probar Bitszone Gratis
        </button>
      </div>

    </section>
  );
};
