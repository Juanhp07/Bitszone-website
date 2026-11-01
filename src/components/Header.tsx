import React, { useState } from "react";
import { SpecularText } from "./ui/SpecularText";
import "../styles/bootstrap-custom.scss";

export const Header = () => {
  return (
    <header className="position-absolute top-0 start-0 end-0 d-flex flex-column px-4 px-md-5 py-3 py-md-4 w-100 mx-auto" style={{ zIndex: 50, maxWidth: "1920px", pointerEvents: "none" }}>
      <div className="d-flex align-items-center justify-content-center w-100">
        
        {/* Center: Logo */}
        <a href="/" className="d-flex align-items-center justify-content-center text-decoration-none" style={{ pointerEvents: "auto", cursor: "pointer" }}>
          <SpecularText
            text="Bitszone"
            className="pe-2"
            style={{
              fontSize: "36px",
              fontFamily: '"DM Serif Display", serif',
              fontStyle: "italic",
            }}
            specularColor="#5A1B5E"
            baseStrokeColor="transparent"
            strokeWidth={1.5}
            glowSize={50}
          />
        </a>

      </div>
    </header>
  );
};