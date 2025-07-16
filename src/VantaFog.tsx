import { useRef, useEffect } from 'react';
import VANTA from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';
import { useControls } from 'leva';

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
  lowlightColor = '#e3f4fc',
  enableControls = true
}: VantaFogProps) => {
  console.log('VantaFog - Received props:', { baseColor, highlightColor, midtoneColor, lowlightColor });
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<ReturnType<typeof VANTA> | null>(null);

  const [controls, set] = useControls('Vanta Fog', () => ({
    baseColor: { value: baseColor },
    highlightColor: { value: highlightColor },
    midtoneColor: { value: midtoneColor },
    lowlightColor: { value: lowlightColor },
    blurFactor: { value: 0.8, min: 0, max: 1, step: 0.1 },
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    zoom: { value: 1, min: 0.1, max: 3, step: 0.1 },
    scale: { value: 2, min: 1, max: 10, step: 0.5 },
    scaleMobile: { value: 4, min: 1, max: 10, step: 0.5 },
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
  }), { collapsed: !enableControls });

  // Update Leva controls when props change
  useEffect(() => {
    console.log('VantaFog - Props changed, updating Leva controls');
    // Update Leva controls to reflect new prop values
    set({
      baseColor: baseColor,
      highlightColor: highlightColor,
      midtoneColor: midtoneColor,
      lowlightColor: lowlightColor
    });
  }, [baseColor, highlightColor, midtoneColor, lowlightColor, set]);

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