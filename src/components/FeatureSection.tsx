import React from 'react';
import { motion } from 'framer-motion';
import { ImageStreamHero } from './ui/image-stream-hero';
import { SpecularText } from './ui/SpecularText';
import { LiquidMetalText } from './ui/LiquidMetalText';

const albums = [
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/53/a7/7f/53a77fab-c54c-a57b-8130-248fc12d0c80/093624948995.jpg/600x600bb.jpg",
    alt: "Linkin Park - Hybrid Theory",
    color: "#dc2626" // Red (Soldier wings)
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/df/fe/a7/dffea722-e8d7-b2ac-2b31-e207fb738b8e/13UABIM36806.rgb.jpg/600x600bb.jpg",
    alt: "Megadeth - Rust In Peace",
    color: "#0ea5e9" // Blue (Sky/Atmosphere)
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/0f/7a/74/0f7a7472-92fa-e77d-384a-1e4304705e83/dj.jbiruenb.png/600x600bb.jpg",
    alt: "Metallica - Master of Puppets",
    color: "#ea580c" // Orange/Red (Logo and sky)
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c3/09/a4/c309a4f8-33a0-abcb-83a2-710d63072de9/24CRGIM46412.rgb.jpg/600x600bb.jpg",
    alt: "Alter Bridge - One Day Remains (Metalingus)",
    color: "#ca8a04" // Yellow/Gold (Bridge/Sepia tone)
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/41/a9/3c/41a93c27-8841-b992-f484-85c999adff0a/00602537437290.rgb.jpg/600x600bb.jpg",
    alt: "Megadeth - Countdown to Extinction",
    color: "#d97706" // Amber/Orange
  },
  {
    src: "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/dd/7d/72/dd7d7259-d27f-5b3e-ce64-9e304d2cb40f/dj.rxzrauer.jpg/600x600bb.jpg",
    alt: "Linkin Park - Meteora",
    color: "#3b82f6" // Blue (Background tint)
  }
];

export const FeatureSection = () => {
  return (
    <section className="relative overflow-hidden w-full bg-canvas flex flex-col items-center">
      <ImageStreamHero
        images={albums}
        className="h-[800px] w-full"
        speed={25}
        cards={12}
        axis={65}
      >
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-30 flex flex-col items-center pt-24 text-center px-6"
        >
          <p className="font-jetbrains text-xs tracking-widest text-[#deb7ff] uppercase mb-4">Descubrimiento Sonoro</p>
          <h2 className="flex flex-col items-center justify-center font-sans font-bold text-center w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <span className="text-white text-3xl md:text-5xl tracking-normal leading-[1.2]">
              EL QUE BUSCA,
            </span>
            <LiquidMetalText
              text="ENCUENTRA SU RITMO."
              className="text-3xl md:text-5xl tracking-normal leading-[1.2]"
              strokeWidth={2}
              tintColor="#5C206B"
            />
          </h2>
        </motion.div>
        
        {/* Glow point behind images */}
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#55108d]/20 blur-[100px] z-0 pointer-events-none"></div>

        {/* --- OVERLAYS FOR BLUR AND FADES --- */}
        
        {/* Center Vanishing Point Fade + Blur */}
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[350px] md:h-[350px] bg-[#08080C] z-20 pointer-events-none [mask-image:radial-gradient(circle_at_center,black_2%,transparent_40%)] [-webkit-mask-image:radial-gradient(circle_at_center,black_2%,transparent_40%)]"></div>
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[350px] md:h-[350px] backdrop-blur-[6px] z-20 pointer-events-none [mask-image:radial-gradient(circle_at_center,black_2%,transparent_40%)] [-webkit-mask-image:radial-gradient(circle_at_center,black_2%,transparent_40%)]"></div>

        {/* Left Edge Fade + Blur */}
        <div className="absolute inset-y-0 left-0 w-[10%] md:w-[15%] bg-gradient-to-r from-[#08080C] via-[#08080C]/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 left-0 w-[10%] md:w-[15%] backdrop-blur-[6px] z-20 pointer-events-none [mask-image:linear-gradient(to_right,black_10%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_10%,transparent_100%)]"></div>

        {/* Right Edge Fade + Blur */}
        <div className="absolute inset-y-0 right-0 w-[10%] md:w-[15%] bg-gradient-to-l from-[#08080C] via-[#08080C]/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-[10%] md:w-[15%] backdrop-blur-[6px] z-20 pointer-events-none [mask-image:linear-gradient(to_left,black_10%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_left,black_10%,transparent_100%)]"></div>
      </ImageStreamHero>
      
      {/* Bottom fade to blend with next section */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-canvas to-transparent z-30 pointer-events-none"></div>
    </section>
  );
};
