import { useEffect, useRef } from 'react';
import * as THREE from 'three';

declare global {
  interface Window {
    VANTA: any;
  }
}

export default function VantaClouds() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  const controls = {
    skyColor: '#c5e0f8',
    cloudColor: '#c6ddf2',
    cloudShadowColor: '#8eafcb',
    sunColor: '#e5aa82',
    sunGlareColor: '#e5b493',
    sunlightColor: '#ffffff',
    speed: 0.60,
    mouseControls: true,
    touchControls: true
  };

  useEffect(() => {
    // Dynamically import Vanta Clouds effect
    const loadVanta = async () => {
      try {
        // Import the clouds effect
        const CLOUDS = (await import('vanta/dist/vanta.clouds.min')).default;
        
        if (!vantaEffect.current && vantaRef.current) {
          vantaEffect.current = CLOUDS({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: controls.mouseControls,
            touchControls: controls.touchControls,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            backgroundColor: 0xffffff,
            skyColor: controls.skyColor,
            cloudColor: controls.cloudColor,
            cloudShadowColor: controls.cloudShadowColor,
            sunColor: controls.sunColor,
            sunGlareColor: controls.sunGlareColor,
            sunlightColor: controls.sunlightColor,
            speed: controls.speed
          });
        }
      } catch (error) {
        console.error('Error loading Vanta effect:', error);
      }
    };

    loadVanta();

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  // Update effect when controls change
  useEffect(() => {
    if (vantaEffect.current) {
      vantaEffect.current.setOptions({
        skyColor: controls.skyColor,
        cloudColor: controls.cloudColor,
        cloudShadowColor: controls.cloudShadowColor,
        sunColor: controls.sunColor,
        sunGlareColor: controls.sunGlareColor,
        sunlightColor: controls.sunlightColor,
        speed: controls.speed,
        mouseControls: controls.mouseControls,
        touchControls: controls.touchControls
      });
    }
  }, [controls]);

  return (
    <div 
      ref={vantaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
      }}
    />
  );
}