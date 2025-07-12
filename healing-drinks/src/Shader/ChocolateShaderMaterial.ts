// src/components/ChocolateShaderMaterial.ts
import * as THREE from 'three';
import { ShaderMaterial } from 'three';
import { extend } from '@react-three/fiber';

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Controllable chocolate gradient shader
const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  // Uniforms for color stops
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  
  // Uniforms for positions
  uniform float uPos1;
  uniform float uPos2;
  uniform float uPos3;
  uniform float uPos4;
  uniform float uPos5;
  
  // Debug and UV transformation uniforms
  uniform bool uDebugUV;
  uniform bool uFlipV;
  uniform bool uUseU;
  uniform float uUVScale;
  uniform float uUVOffset;
  uniform bool uSeamless;
  
  struct ColorStop {
    vec3 color;
    float position;
  };

  vec3 colorRamp(float factor) {
    ColorStop stops[5];
    stops[0] = ColorStop(uColor1, uPos1);
    stops[1] = ColorStop(uColor2, uPos2);
    stops[2] = ColorStop(uColor3, uPos3);
    stops[3] = ColorStop(uColor4, uPos4);
    stops[4] = ColorStop(uColor5, uPos5);

    int index = 0;
    for (int i = 0; i < 4; i++) {
      if (factor >= stops[i].position && factor <= stops[i+1].position) {
        index = i;
      }
    }
    ColorStop a = stops[index];
    ColorStop b = stops[index + 1];
    float range = b.position - a.position;
    float lerpFactor = (factor - a.position) / range;
    return mix(a.color, b.color, lerpFactor);
  }

  void main() {
    // Calculate UV coordinate to use for gradient
    vec2 uv = vUv;
    
    // Debug mode: show UV coordinates as colors
    if (uDebugUV) {
      gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);
      return;
    }
    
    float factor;
    
    if (uSeamless) {
      // Seamless gradient using world position
      if (uUseU) {
        // Horizontal seamless gradient using X position
        factor = (vWorldPosition.x + 1.0) * 0.5;
      } else {
        // Vertical seamless gradient using Y position
        factor = (vWorldPosition.y + 1.0) * 0.5;
      }
    } else {
      // UV transformations (original method)
      if (uUseU) {
        factor = uv.x; // Use U coordinate instead of V
      } else {
        factor = uv.y; // Use V coordinate (default)
      }
    }
    
    // Flip if needed
    if (uFlipV) {
      factor = 1.0 - factor;
    }
    
    // Scale and offset
    factor = factor * uUVScale + uUVOffset;
    factor = clamp(factor, 0.0, 1.0);
    
    vec3 color = colorRamp(factor);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export class ChocolateShaderMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        // Hardcoded chocolate gradient colors
        uColor1: { value: new THREE.Color('#5f392b') }, // Dark chocolate
        uColor2: { value: new THREE.Color('#302C17') }, // Dark brown chocolate
        uColor3: { value: new THREE.Color('#8B4513') }, // Medium chocolate brown
        uColor4: { value: new THREE.Color('#CD853F') }, // Light chocolate/tan
        uColor5: { value: new THREE.Color('#F5DEB3') }, // Cream/wheat color
        
        // Fixed position uniforms for smooth gradient
        uPos1: { value: 0.0 },
        uPos2: { value: 0.25 },
        uPos3: { value: 0.5 },
        uPos4: { value: 0.75 },
        uPos5: { value: 1.0 },

        // Fixed settings matching original Leva UI defaults
        uDebugUV: { value: false },
        uFlipV: { value: false },
        uUseU: { value: false },
        uUVScale: { value: 1.0 },
        uUVOffset: { value: 0.0 },
        uSeamless: { value: false }, // Use UV coordinates like original
      },
    });
    
    console.log('🍫 ChocolateShaderMaterial created with fixed chocolate gradient!');
  }
  

}

// Extend for React Three Fiber
extend({ ChocolateShaderMaterial });

// Default export for convenience
export default ChocolateShaderMaterial;
