import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import { useNavigate } from 'react-router-dom';
import VantaFog from './VantaFog';
import { ChocolateShaderMaterial } from './Shader/ChocolateShaderMaterial.ts';

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
      
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.Material;
          const name = material.name?.toLowerCase() || '';
          const exactName = material.name || '';

          if (name.includes('glass')) {
            glassCount++;
            mesh.material = new THREE.MeshPhysicalMaterial({
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
            console.log(`🍫 Applied chocolate shader to: ${material.name} in ${modelPath} (index: ${index})`);
            
            const newMaterial = new ChocolateShaderMaterial();
            mesh.material = newMaterial;
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
  focusedIndex: number;
  onFocusChange: (index: number) => void;
}

function Scene({ cameraControls, focusedIndex, onFocusChange }: SceneProps) {
  const drinks = [
    '/drink4.glb',
    '/drink2.glb',
    '/drink3.glb',
    '/drink1.glb',
    '/drink5.glb',
  ];

  const radius = 3;
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (!cameraRef.current) return;
    const angle = (focusedIndex / drinks.length) * Math.PI * 2;
    const orbitRadius = 2.5 * cameraControls.orbitMultiplier;
    // Calculate camera position relative to origin (0, 0, 0) for consistent distances
    const x = Math.sin(angle) * orbitRadius;
    const z = Math.cos(angle) * orbitRadius;
    // Add initial offset after calculating the orbit position
    const target = new THREE.Vector3(
      x + cameraControls.positionX,
      cameraControls.positionY,
      z + cameraControls.positionZ
    );
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
            onClick={(idx: number) => {
              onFocusChange(idx);
            }}
          />
        );
      })}
    </>
  );
}

export default function App() {
  const [focusedDrinkIndex, setFocusedDrinkIndex] = useState(0);
  const navigate = useNavigate();
  const drinkNames = [
    'Smoothie',
    'Latte', 
    'Milk',
    'Macchiato',
    'Lemonade'
  ];
  
  const drinkColors = [
    'rgba(166, 75, 75, 0.3)',    // Smoothie
    'rgba(139, 121, 72, 0.3)',    // Latte
    'rgba(61, 61, 61, 0.5)',  // Milk
    'rgba(139, 97, 72, 0.3)',    // Macchiato
    'rgba(75, 113, 14, 0.4)'   // Lemonade
  ];
  
  const drinkBannerTexts = [
    'Move to Feel Better',
    'Emotional Support',
    'Learn to Heal',
    'Scientific Healing',
    'Motivation Boost'
  ];
  
  const cameraControls = useControls('Camera', {
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 2.2, min: 0, max: 10, step: 0.1 },
    positionZ: { value: 0, min: -10, max: 10, step: 0.1 },
    orbitMultiplier: { value: 3.0, min: 0.5, max: 3, step: 0.1 },
    lookAtY: { value: 0.3, min: -2, max: 5, step: 0.1 },
    fov: { value: 40, min: 10, max: 120, step: 1 },
  });

  const handlePrevDrink = () => {
    const newIndex = (focusedDrinkIndex - 1 + drinkNames.length) % drinkNames.length;
    setFocusedDrinkIndex(newIndex);
  };

  const handleNextDrink = () => {
    const newIndex = (focusedDrinkIndex + 1) % drinkNames.length;
    setFocusedDrinkIndex(newIndex);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <VantaFog 
        baseColor="#fffbfa"
        highlightColor="#f2e8e6"
        midtoneColor="#a1c7ef"
        lowlightColor="#e3f4fc"
        enableControls={true}
      />
      
      {/* Header with Logo and About */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '30px 50px',
        zIndex: 20,
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'black',
        }}>
          Logo
        </div>
        <a 
          href="/about"
          style={{
            fontSize: '18px',
            color: 'black',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          About
        </a>
      </div>

      {/* Main Title */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 20,
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: 'black',
          margin: 0,
        }}>
          Chose your healing drink
        </h1>
      </div>

      {/* Scrolling Drink Name Behind 3D Models */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        width: '100%',
        height: '140px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        zIndex: 5,
        transform: 'translateY(-50%)',
      }}>
        <div 
          key={focusedDrinkIndex}
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: 'scroll 50s linear infinite',
            fontSize: '140px',
            fontWeight: 'bold',
            color: 'rgba(61, 61, 61, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '10px',
          }}
        >
          {Array(20).fill(drinkNames[focusedDrinkIndex]).join(' • ')}
        </div>
      </div>

      <Canvas
        style={{ width: '100vw', height: '100vh', zIndex: 10, position: 'relative' }}
        camera={{ 
          position: [cameraControls.positionX, cameraControls.positionY, cameraControls.positionZ], 
          fov: cameraControls.fov 
        }}
      >
        <Suspense fallback={null}>
          <Scene cameraControls={cameraControls} focusedIndex={focusedDrinkIndex} onFocusChange={setFocusedDrinkIndex} />
          <OrbitControls enableZoom={false} />
        </Suspense>
      </Canvas>

      {/* Left Navigation Arrow */}
      <button
        onClick={handlePrevDrink}
        style={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          transform: 'translateY(-50%)',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'all 0.3s ease',
          zIndex: 20,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        &lt;
      </button>


      {/* Right Navigation Arrow */}
      <button
        onClick={handleNextDrink}
        style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          transform: 'translateY(-50%)',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'all 0.3s ease',
          zIndex: 20,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        &gt;
      </button>

      {/* Scientific Healing Text and Choose Button */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 20,
      }}>
        {/* <p style={{
          fontSize: '20px',
          color: drinkColors[focusedDrinkIndex].replace(/[\d.]+\)$/, '1)'),
          fontWeight: 'bold',
          marginBottom: '30px',
        }}>
          {drinkBannerTexts[focusedDrinkIndex]}
        </p> */}
        <button
          onClick={() => navigate(`/drink/${focusedDrinkIndex}`)}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Choose
        </button>
      </div>
      
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
}