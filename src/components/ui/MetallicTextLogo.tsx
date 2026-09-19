'use client';
import React, { useEffect, useState } from 'react';
import MetallicPaint from './MetallicPaint';

interface MetallicTextLogoProps {
  text: string;
  tintColor?: string;
}

export const MetallicTextLogo: React.FC<MetallicTextLogoProps> = ({ 
  text,
  tintColor = "#B497CF"
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    document.fonts.ready.then(() => {
      // First pass: Measure the exact width of the text
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      tempCtx.font = 'italic 160px "DM Serif Display", serif';
      const metrics = tempCtx.measureText(text);
      
      const textWidth = Math.ceil(metrics.width);
      // Tight bounding box to prevent empty space from shrinking the image
      const canvasWidth = textWidth + 20; 
      const canvasHeight = 180; 

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Re-apply context settings after resizing canvas
      ctx.fillStyle = '#000000';
      ctx.font = 'italic 160px "DM Serif Display", serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      
      // Draw text dead center
      ctx.fillText(text, canvasWidth / 2, canvasHeight / 2 + 10);
      
      setDataUrl(canvas.toDataURL('image/png'));
    });
  }, [text]);

  if (!dataUrl) return <div className="w-[300px] h-[50px]"></div>;

  return (
    <div className="w-[280px] md:w-[350px] xl:w-[400px] 2xl:w-[480px] h-[50px] md:h-[60px] xl:h-[70px] 2xl:h-[80px]">
      <MetallicPaint
        imageSrc={dataUrl}
        tintColor={tintColor}
        lightColor="#ffffff"
        darkColor="#05050A"
        liquid={0.8}
        speed={0.3}
        mouseAnimation={true} // makes it react to hover!
        refraction={0.03}
        distortion={0.8}
        blur={0.02}
        fresnel={1.5}
        waveAmplitude={1.2}
      />
    </div>
  );
};
