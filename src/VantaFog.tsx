import { useRef, useEffect } from 'react';
import VANTA from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';

interface VantaFogProps {
  baseColor?: string;
  highlightColor?: string;
  midtoneColor?: string;
  lowlightColor?: string;
  enableControls?: boolean;
}

const VantaFog = ({ 
  baseColor = '#fffbfa',
  highlightColor = '#f2e8e6',
  midtoneColor = '#a1c7ef',
  lowlightColor = '#e3f4fc'
}: VantaFogProps) => {
  console.log('VantaFog - Received props:', { baseColor, highlightColor, midtoneColor, lowlightColor });
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<ReturnType<typeof VANTA> | null>(null);

  const controls = {
    baseColor: baseColor,
    highlightColor: highlightColor,
    midtoneColor: midtoneColor,
    lowlightColor: lowlightColor,
    blurFactor: 0.8,
    speed: 1,
    zoom: 1,
    scale: 2,
    scaleMobile: 4,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
  };


  // Initialize and update Vanta effect
  useEffect(() => {
    if (!vantaRef.current) return;

    // Clean up previous effect
    if (vantaEffect.current) {
      vantaEffect.current.destroy();
      vantaEffect.current = null;
    }

    try {
      console.log('VantaFog - Creating new effect with colors:', {
        baseColor: controls.baseColor,
        highlightColor: controls.highlightColor,
        midtoneColor: controls.midtoneColor,
        lowlightColor: controls.lowlightColor
      });
      vantaEffect.current = VANTA({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: controls.mouseControls,
        touchControls: controls.touchControls,
        gyroControls: controls.gyroControls,
        minHeight: 200.00,
        minWidth: 200.00,
        baseColor: controls.baseColor,
        highlightColor: controls.highlightColor,
        midtoneColor: controls.midtoneColor,
        lowlightColor: controls.lowlightColor,
        blurFactor: controls.blurFactor,
        speed: controls.speed,
        zoom: controls.zoom,
        scale: controls.scale,
        scaleMobile: controls.scaleMobile,
        backgroundAlpha: 1
      });
    } catch (error) {
      console.error('Error initializing Vanta effect:', error);
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [
    controls.baseColor,
    controls.highlightColor,
    controls.midtoneColor,
    controls.lowlightColor,
    controls.blurFactor,
    controls.speed,
    controls.zoom,
    controls.scale,
    controls.scaleMobile,
    controls.mouseControls,
    controls.touchControls,
    controls.gyroControls
  ]);

  return (
    <div 
      ref={vantaRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default VantaFog;