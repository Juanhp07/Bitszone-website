import React, { useState } from "react";
import { motion } from "framer-motion";
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
      className={`cursor-target font-inter text-[15px] xl:text-[17px] 2xl:text-[20px] transition-colors relative ${isActive ? "text-white" : "text-[#A0A3BD] hover:text-white"}`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
};

export const Header = () => {
  const [activeAuth, setActiveAuth] = useState("");
  const [activeNav, setActiveNav] = useState("");

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-8 md:px-16 md:py-10 2xl:px-24 2xl:py-14 max-w-[1920px] mx-auto w-full">
      <TargetCursor
        targetSelector=".cursor-target"
        cursorColor="#ffffff"
        cursorColorOnTarget="#B497CF"
        showOnlyOnTarget={true}
      />
      <div className="flex items-center">
        {/* Logo */}
        <div className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-300">
          <SpecularText
            text="Bitszone"
            className="text-[24px] xl:text-[28px] 2xl:text-[32px] tracking-normal leading-none pr-2"
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: "italic",
            }}
            specularColor="#5A1B5E" // The deep plum color for the laser highlight
            baseStrokeColor="transparent" // No border when idle
            strokeWidth={1.5}
            glowSize={50}
          />
        </div>

        {/* Auth links */}
        <div className="hidden md:flex items-center ml-10 xl:ml-16 pl-10 xl:pl-16 gap-8 xl:gap-12 relative border-l border-white/5">
          <NavLink
            label="Iniciar sesión"
            isActive={activeAuth === "iniciar"}
            onClick={() => setActiveAuth("iniciar")}
          />
          <NavLink
            label="Registrarse"
            isActive={activeAuth === "registrarse"}
            onClick={() => setActiveAuth("registrarse")}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-10 xl:gap-14">
        <NavLink
          label="Inicio"
          isActive={activeNav === "inicio"}
          onClick={() => setActiveNav("inicio")}
        />
        <NavLink
          label="Mis Descargas"
          isActive={activeNav === "descargas"}
          onClick={() => setActiveNav("descargas")}
        />
      </nav>
    </header>
  );
};
