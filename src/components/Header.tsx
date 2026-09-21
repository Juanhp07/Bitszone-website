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
    <header className="absolute top-0 left-0 right-0 z-50 flex flex-col px-4 py-4 md:px-8 md:py-6 2xl:px-12 2xl:py-8 max-w-[1920px] mx-auto w-full">
      <TargetCursor
        targetSelector=".cursor-target"
        cursorColor="#ffffff"
        cursorColorOnTarget="#B497CF"
        showOnlyOnTarget={true}
      />

      <div className="flex items-center justify-between w-full">
        {/* Left: Logo */}
        <div className="flex items-center cursor-pointer w-1/2 justify-start">
          <SpecularText
            text="Bitszone"
            className="text-[24px] xl:text-[28px] 2xl:text-[32px] tracking-normal leading-none pr-2"
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

        {/* Right: Menu Icon */}
        <div className="w-1/2 flex justify-end">
          <button
            className="cursor-target text-white p-2 relative z-50"
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
            className="absolute top-16 right-4 md:right-8 2xl:right-12 mt-2 flex flex-col bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-w-[220px] gap-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40"
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
              label="Iniciar sesión"
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
