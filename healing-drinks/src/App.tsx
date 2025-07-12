import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import { ChocolateShaderMaterial } from './Shader/ChocolateShaderMaterial.ts'; // ⬅️ 自定義 Shader Material 匯入

interface DrinkProps {
  modelPath: string;
  position: [number, number, number];
  index: number;
  focusedIndex: number;
  onClick: (index: number) => void;
}

function Drink({ modelPath, position, index, focusedIndex, onClick }: DrinkProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  // 材質替換邏輯：glass 與 chocolate
  useEffect(() => {
    try {
      let chocolateCount = 0;
      let glassCount = 0;
      
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const name = child.material.name?.toLowerCase() || '';
          const exactName = child.material.name || '';

          if (name.includes('glass')) {
            glassCount++;
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              metalness: 0,
              roughness: 0,
              transmission: 1,
              thickness: 0.5,
              ior: 1.5,
              transparent: true,
              clearcoat: 1,
              clearcoatRoughness: 0.1,
            });
          } else if (exactName === 'CHOCOLATE.005' || exactName === 'CHOCOLATE.007') {
            chocolateCount++;
            console.log(`🍫 Applied chocolate shader to: ${child.material.name} in ${modelPath} (index: ${index})`);
            
            const newMaterial = new ChocolateShaderMaterial();
            child.material = newMaterial;
          }
        }
      });
      
      if (chocolateCount > 0 || glassCount > 0) {
        console.log(`📊 ${modelPath} (index: ${index}): ${chocolateCount} chocolate, ${glassCount} glass materials applied`);
      }
    } catch (error) {
      console.error(`Error processing materials for ${modelPath}:`, error);
    }
  }, [scene, modelPath, index]);

  // 浮動 + 縮放動畫 (removed shader uTime updates)
  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t + index) * 0.1;
    group.current.position.y = 0.2 + Math.sin(t * 2 + index) * 0.05;
    const targetScale = focusedIndex === index ? 0.25 : 0.1;
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // No need to update uTime for static chocolate shader
  });

  return (
    <group
      ref={group}
      position={position}
      onClick={() => onClick(index)}
      scale={0.05}
    >
      <primitive object={scene} />
    </group>
  );
}

interface SceneProps {
  cameraControls: {
    positionX: number;
    positionY: number;
    positionZ: number;
    orbitMultiplier: number;
    lookAtY: number;
    fov: number;
  };
}

function Scene({ cameraControls }: SceneProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const drinks = [
    '/drink1.glb',
    '/drink2.glb',
    '/drink3.glb',
    '/drink4.glb',
    '/drink5.glb',
  ];

  const radius = 3;
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (!cameraRef.current) return;
    const angle = (focusedIndex / drinks.length) * Math.PI * 2;
    const orbitRadius = 2.5;
    const x = Math.sin(angle) * orbitRadius * cameraControls.orbitMultiplier + cameraControls.positionX;
    const z = Math.cos(angle) * orbitRadius * cameraControls.orbitMultiplier + cameraControls.positionZ;
    const target = new THREE.Vector3(x, cameraControls.positionY, z);
    cameraRef.current.position.lerp(target, 0.1);
    cameraRef.current.lookAt(0, cameraControls.lookAtY, 0);
    cameraRef.current.fov = cameraControls.fov;
    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef} 
        makeDefault 
        position={[cameraControls.positionX, cameraControls.positionY, cameraControls.positionZ]} 
        fov={cameraControls.fov}
      />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Environment preset="city" background={false} />

      {drinks.map((path, i) => {
        const angle = (i / drinks.length) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const isFocused = focusedIndex === i;
        const position: [number, number, number] = isFocused 
          ? [0, 1, 0]  
          : [x, 1, z];

        return (
          <Drink
            key={i}
            modelPath={path}
            position={position}
            index={i}
            focusedIndex={focusedIndex}
            onClick={(idx: number) => setFocusedIndex(idx)}
          />
        );
      })}
    </>
  );
}

export default function App() {
  const cameraControls = useControls('Camera', {
    positionX: { value: 0.4, min: -10, max: 10, step: 0.1 },
    positionY: { value: 2.2, min: 0, max: 10, step: 0.1 },
    positionZ: { value: 2.2, min: 0, max: 10, step: 0.1 },
    orbitMultiplier: { value: 3.0, min: 0.5, max: 3, step: 0.1 },
    lookAtY: { value: 0.1, min: -2, max: 5, step: 0.1 },
    fov: { value: 50, min: 10, max: 120, step: 1 },
  });







  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      camera={{ 
        position: [cameraControls.positionX, cameraControls.positionY, cameraControls.positionZ], 
        fov: cameraControls.fov 
      }}
    >
      <Suspense fallback={null}>
        <Scene cameraControls={cameraControls} />
        <OrbitControls enableZoom={false} />
      </Suspense>
    </Canvas>
  );
}
