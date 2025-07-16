import { useRef, useEffect } from 'react';
import VANTA from 'vanta/dist/vanta.fog.min';
import * as THREE from 'three';
import { useControls } from 'leva';

const VantaFog = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<ReturnType<typeof VANTA> | null>(null);

  const controls = useControls('Vanta Fog', {
    baseColor: { value: '#fffbfa' }, // 16772075 in hex
    highlightColor: { value: '#f2e8e6' }, // 14606046 in hex
    midtoneColor: { value: '#a1c7ef' }, // 13816530 in hex
    lowlightColor: { value: '#e3f4fc' }, // 9671571 in hex
    blurFactor: { value: 0.6, min: 0, max: 1, step: 0.1 },
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    zoom: { value: 1, min: 0.1, max: 3, step: 0.1 },
    scale: { value: 2, min: 1, max: 10, step: 0.5 },
    scaleMobile: { value: 4, min: 1, max: 10, step: 0.5 },
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
  });

  useEffect(() => {
    if (!vantaRef.current) return;

    if (vantaEffect.current) vantaEffect.current.destroy();

    try {
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
      if (vantaEffect.current) vantaEffect.current.destroy();
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