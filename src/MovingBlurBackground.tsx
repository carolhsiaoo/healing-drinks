import React, { useRef } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const BlurGradientMaterial = shaderMaterial(
  { 
    uTime: 0, 
    uRes: [0, 0],
    uColor1: new THREE.Color(1.0, 0.9, 0.85),
    uColor2: new THREE.Color(0.9, 0.95, 1.0),
    uColor3: new THREE.Color(1.0, 1.0, 0.8),
    uSpeed: 0.05,
    uWaveFreq: 3.0,
    uMixStrength: 1.0
  },
  `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
    }
  `,
  `
    uniform float uTime;
    uniform vec2 uRes;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uSpeed;
    uniform float uWaveFreq;
    uniform float uMixStrength;
    varying vec2 vUv;
    
    void main(){
      vec2 uv = vUv;
      float t = uTime * uSpeed;

      float x = sin((uv.x+uv.y)*uWaveFreq + t)*0.5+0.5;
      vec3 col = mix(uColor1, uColor2, x * uMixStrength);
      col = mix(col, uColor3, (1.0 - x) * uMixStrength);

      gl_FragColor = vec4(col, 1.);
    }
  `
);

extend({ BlurGradientMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    blurGradientMaterial: THREE.ShaderMaterialParameters & {
      uTime?: number;
      uRes?: [number, number];
      uColor1?: THREE.Color;
      uColor2?: THREE.Color;
      uColor3?: THREE.Color;
      uSpeed?: number;
      uWaveFreq?: number;
      uMixStrength?: number;
    };
  }
}

interface MovingBlurBackgroundProps {
  color1?: THREE.Color | string;
  color2?: THREE.Color | string;
  color3?: THREE.Color | string;
  speed?: number;
  waveFreq?: number;
  mixStrength?: number;
}

export function MovingBlurBackground({ 
  color1,
  color2,
  color3,
  speed = 0.05,
  waveFreq = 3.0,
  mixStrength = 1.0
}: MovingBlurBackgroundProps) {
  const mat = useRef<THREE.ShaderMaterial & {
    uTime: number;
    uRes: [number, number];
    uColor1: THREE.Color;
    uColor2: THREE.Color;
    uColor3: THREE.Color;
    uSpeed: number;
    uWaveFreq: number;
    uMixStrength: number;
  }>();
  const { size } = useThree();

  useFrame(({ clock }) => {
    if (mat.current) {
      mat.current.uTime = clock.getElapsedTime();
      mat.current.uRes = [size.width, size.height];
    }
  });

  React.useEffect(() => {
    if (mat.current) {
      if (color1) mat.current.uColor1 = new THREE.Color(color1);
      if (color2) mat.current.uColor2 = new THREE.Color(color2);
      if (color3) mat.current.uColor3 = new THREE.Color(color3);
      mat.current.uSpeed = speed;
      mat.current.uWaveFreq = waveFreq;
      mat.current.uMixStrength = mixStrength;
    }
  }, [color1, color2, color3, speed, waveFreq, mixStrength]);

  return (
    <mesh scale={[size.width, size.height, 1]} position={[0, 0, -10]}>
      <planeGeometry args={[1, 1]} />
      <blurGradientMaterial ref={mat} />
    </mesh>
  );
}