import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import TargetCursor from "./ui/TargetCursor";
import { SpecularText } from "./ui/SpecularText";

const NavLink = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-target font-inter text-[15px] xl:text-[17px] 2xl:text-[20px] transition-colors relative text-left ${isActive ? "text-white" : "text-[#A0A3BD] hover:text-white"}`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
};

export const Header = () => {
  const [activeAuth, setActiveAuth] = useState("");
  const [activeNav, setActiveNav] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex flex-col px-8 py-8 md:px-16 md:py-10 2xl:px-24 2xl:py-14 max-w-[1920px] mx-auto w-full">
      <TargetCursor
        targetSelector=".cursor-target"
        cursorColor="#ffffff"
        cursorColorOnTarget="#B497CF"
        showOnlyOnTarget={true}
      />

      <div className="flex items-center justify-between w-full">
        {/* Left: Logo */}
        <div className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-300 w-1/3 justify-start">
          <SpecularText
            text="Bitszone"
            className="text-[24px] xl:text-[28px] 2xl:text-[32px] tracking-normal leading-none pr-2 cursor-target"
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: "italic",
            }}
            specularColor="#5A1B5E"
            baseStrokeColor="transparent"
            strokeWidth={1.5}
            glowSize={50}
          />
        </div>

        {/* Middle: Descargas Button */}
        <div className="w-1/3 flex justify-center hidden sm:flex">
          <button
            className="cursor-target font-inter text-[14px] xl:text-[16px] 2xl:text-[18px] text-[#A0A3BD] hover:text-white transition-colors font-medium border border-white/10 rounded-full px-6 py-2 bg-[#05050A]/40 backdrop-blur-md hover:bg-white/10"
            onClick={() => setActiveNav("descargas")}
          >
            Mis Descargas
          </button>
        </div>

        {/* Right: Menu Icon */}
        <div className="w-1/3 flex justify-end">
          <button
            className="cursor-target text-white hover:text-[#B497CF] transition-colors p-2 relative z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-24 right-8 md:right-16 2xl:right-24 mt-2 flex flex-col bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-w-[220px] gap-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40"
          >
            <NavLink
              label="Inicio"
              isActive={activeNav === "inicio"}
              onClick={() => {
                setActiveNav("inicio");
                setIsMenuOpen(false);
              }}
            />
            <NavLink
              label="Mis descargas"
              isActive={activeNav === "descargas"}
              onClick={() => {
                setActiveNav("descargas");
                setIsMenuOpen(false);
              }}
            />
            <div className="h-[1px] w-full bg-white/10 my-1"></div>
            <NavLink
              label="Iniciar sesión TSMR"
              isActive={activeAuth === "iniciar"}
              onClick={() => {
                setActiveAuth("iniciar");
                setIsMenuOpen(false);
              }}
            />
            <NavLink
              label="Registrarse"
              isActive={activeAuth === "registrarse"}
              onClick={() => {
                setActiveAuth("registrarse");
                setIsMenuOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
