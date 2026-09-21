import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { SpecularText } from "./ui/SpecularText";
import "../styles/bootstrap-custom.scss";

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
      className={`btn p-0 text-start position-relative transition-colors border-0 bg-transparent ${isActive ? "text-white" : "text-white-50"}`}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "17px",
        color: isActive ? "#ffffff" : "#A0A3BD",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.color = "#A0A3BD";
      }}
    >
      <span className="position-relative" style={{ zIndex: 10 }}>{label}</span>
    </button>
  );
};

export const Header = () => {
  const [activeAuth, setActiveAuth] = useState("");
  const [activeNav, setActiveNav] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="position-absolute top-0 start-0 end-0 d-flex flex-column px-4 px-md-5 py-3 py-md-4 w-100 mx-auto" style={{ zIndex: 50, maxWidth: "1920px" }}>
      <div className="d-flex align-items-center justify-content-between w-100">
        
        {/* Left: Logo */}
        <div className="d-flex align-items-center w-50 justify-content-start" style={{ cursor: "pointer" }}>
          <SpecularText
            text="Bitszone"
            className="pe-2"
            style={{
              fontSize: "28px",
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
        <div className="w-50 d-flex justify-content-end">
          <button
            className="btn text-white p-2 position-relative border-0 bg-transparent"
            style={{ zIndex: 50 }}
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
            className="position-absolute d-flex flex-column p-4 rounded-4"
            style={{
              top: "70px",
              right: "30px",
              minWidth: "220px",
              gap: "20px",
              backgroundColor: "rgba(10, 10, 15, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              zIndex: 40,
            }}
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
            
            <div className="w-100 my-1" style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>
            
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
