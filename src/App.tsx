import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import { useNavigate } from 'react-router-dom';
import VantaFog from './VantaFog';
import { ChocolateShaderMaterial } from './Shader/ChocolateShaderMaterial.ts';
import Header from './components/Header';
import styles from './App.module.css';

interface DrinkProps {
  modelPath: string;
  position: [number, number, number];
  index: number;
  focusedIndex: number;
  onClick: (index: number) => void;
  tiltStrength: number;
  tiltSmoothness: number;
  enableTilt: boolean;
}

function Drink({ modelPath, position, index, focusedIndex, onClick, tiltStrength, tiltSmoothness, enableTilt }: DrinkProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  const { mouse } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });
  const previousFocusedIndex = useRef(focusedIndex);
  const [tiltEnabled, setTiltEnabled] = useState(true);
  const baseMousePosition = useRef({ x: 0, y: 0 });
  
  // Check for mobile/tablet for scale adjustment
  const [scale, setScale] = useState(0.05);
  
  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth <= 480) {
        setScale(0.04); // Smaller on mobile
      } else if (window.innerWidth <= 768) {
        setScale(0.045); // Medium on tablet
      } else {
        setScale(0.05); // Default on desktop
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  
  // Reset tilt when focus changes with delay
  useEffect(() => {
    if (previousFocusedIndex.current !== focusedIndex) {
      console.log(`[Drink ${index}] Focus changed from ${previousFocusedIndex.current} to ${focusedIndex}`);
      // Disable tilt immediately
      setTiltEnabled(false);
      targetRotation.current = { x: 0, y: 0 };
      if (group.current) {
        console.log(`[Drink ${index}] Resetting rotation to 0`);
        group.current.rotation.x = 0;
        group.current.rotation.y = 0;
      }
      previousFocusedIndex.current = focusedIndex;
      
      // Re-enable tilt after delay if this drink is focused
      if (focusedIndex === index) {
        console.log(`[Drink ${index}] Will enable tilt after 800ms`);
        const timer = setTimeout(() => {
          console.log(`[Drink ${index}] Enabling tilt`);
          // Store current mouse position as baseline when enabling tilt
          baseMousePosition.current = { x: mouse.x, y: mouse.y };
          console.log(`[Drink ${index}] Baseline mouse position: x=${baseMousePosition.current.x.toFixed(3)}, y=${baseMousePosition.current.y.toFixed(3)}`);
          setTiltEnabled(true);
        }, 800); // 800ms delay
        
        return () => clearTimeout(timer);
      }
    }
  }, [focusedIndex, index]);

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

  // 浮動 + 縮放動畫 + 滑鼠傾斜效果（僅限焦點飲品）
  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();
    const isFocused = focusedIndex === index;
    
    // 基礎旋轉動畫
    const baseRotationY = Math.sin(t + index) * 0.1;
    
    // 滑鼠傾斜效果 - 僅在焦點時應用，且有延遲
    if (isFocused && enableTilt && tiltEnabled) {
      // Use mouse position relative to baseline position when tilt was enabled
      const relativeMouseX = mouse.x - baseMousePosition.current.x;
      const relativeMouseY = mouse.y - baseMousePosition.current.y;
      
      // Apply damping to make movement feel more stable
      const dampingFactor = 0.5;
      targetRotation.current.x = relativeMouseY * tiltStrength * dampingFactor;
      targetRotation.current.y = relativeMouseX * tiltStrength * dampingFactor;
      
      // Clamp rotation to prevent excessive tilting
      const maxTilt = 0.15; // Maximum tilt in radians (~8.5 degrees)
      targetRotation.current.x = Math.max(-maxTilt, Math.min(maxTilt, targetRotation.current.x));
      targetRotation.current.y = Math.max(-maxTilt, Math.min(maxTilt, targetRotation.current.y));
      
      if (Math.abs(targetRotation.current.x) > 0.01 || Math.abs(targetRotation.current.y) > 0.01) {
        console.log(`[Drink ${index}] Mouse tilt: x=${targetRotation.current.x.toFixed(3)}, y=${targetRotation.current.y.toFixed(3)} (relative: ${relativeMouseX.toFixed(3)}, ${relativeMouseY.toFixed(3)})`);
      }
    } else {
      targetRotation.current.x = 0;
      targetRotation.current.y = 0;
    }
    
    // 平滑插值旋轉
    if (isFocused && enableTilt && tiltEnabled) {
      group.current.rotation.x += (targetRotation.current.x - group.current.rotation.x) * tiltSmoothness;
      group.current.rotation.y += (baseRotationY + targetRotation.current.y - group.current.rotation.y) * tiltSmoothness;
    } else {
      group.current.rotation.x += (0 - group.current.rotation.x) * tiltSmoothness;
      group.current.rotation.y += (baseRotationY - group.current.rotation.y) * tiltSmoothness;
    }
    
    // Debug logging every 60 frames (roughly once per second)
    if (Math.floor(t * 60) % 60 === 0 && Math.floor(t * 60) !== Math.floor((t - 1/60) * 60)) {
      console.log(`[Drink ${index}] State: focused=${isFocused}, tiltEnabled=${tiltEnabled}, enableTilt=${enableTilt}, rotation=(${group.current.rotation.x.toFixed(3)}, ${group.current.rotation.y.toFixed(3)})`);
    }
    
    // 浮動效果
    group.current.position.y = 0.2 + Math.sin(t * 2 + index) * 0.05;
    
    // 縮放效果
    const baseScale = scale;
    const targetScale = isFocused ? baseScale * 5 : baseScale * 2; // Focused is 5x, unfocused is 2x base scale
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group
      ref={group}
      position={position}
      onClick={() => onClick(index)}
      scale={scale}
    >
      {/* Offset the model down so rotation happens around the base */}
      <group position={[0, -0.3, 0]}>
        <primitive object={scene} />
      </group>
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
  tiltControls: {
    tiltStrength: number;
    tiltSmoothness: number;
    enableTilt: boolean;
  };
  focusedIndex: number;
  onFocusChange: (index: number) => void;
}

function Scene({ cameraControls, tiltControls, focusedIndex, onFocusChange }: SceneProps) {
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
              window.playClickSound?.();
            }}
            tiltStrength={tiltControls.tiltStrength}
            tiltSmoothness={tiltControls.tiltSmoothness}
            enableTilt={tiltControls.enableTilt}
          />
        );
      })}
    </>
  );
}

export default function App() {
  const [focusedDrinkIndex, setFocusedDrinkIndex] = useState(0);
  const navigate = useNavigate();
  
  // Check if mobile/tablet
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 480);
      setIsTablet(window.innerWidth > 480 && window.innerWidth <= 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  const drinkNames = [
    'Smoothie',
    'Latte', 
    'Milk',
    'Macchiato',
    'Lemonade'
  ];
  
  
  const drinkBannerTexts = [
    'Move to Feel Better',
    'Emotional Support',
    'Simple Comforts',
    'Scientific Healing',
    'Motivation Boost'
  ];
  
  // Adjust camera settings based on device
  const getDefaultCameraSettings = () => {
    if (isMobile) {
      return { positionY: 2.8, orbitMultiplier: 4.5, fov: 55 };
    } else if (isTablet) {
      return { positionY: 2.3, orbitMultiplier: 3.5, fov: 45 };
    }
    return { positionY: 2.2, orbitMultiplier: 3.0, fov: 40 };
  };
  
  const defaultSettings = getDefaultCameraSettings();
  
  const cameraControls = useControls('Main Camera', {
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: defaultSettings.positionY, min: 0, max: 10, step: 0.1 },
    positionZ: { value: 0, min: -10, max: 10, step: 0.1 },
    orbitMultiplier: { value: defaultSettings.orbitMultiplier, min: 0.5, max: 5, step: 0.1 },
    lookAtY: { value: 0.3, min: -2, max: 5, step: 0.1 },
    fov: { value: defaultSettings.fov, min: 10, max: 120, step: 1 },
  });
  
  const tiltControls = useControls('Main Tilt Effect', {
    tiltStrength: { value: 1, min: 0, max: 1, step: 0.05 },
    tiltSmoothness: { value: 0.1, min: 0.01, max: 0.3, step: 0.01 },
    enableTilt: { value: true },
  });

  const handlePrevDrink = () => {
    const newIndex = (focusedDrinkIndex - 1 + drinkNames.length) % drinkNames.length;
    setFocusedDrinkIndex(newIndex);
    (window as any).playClickSound?.();
  };

  const handleNextDrink = () => {
    const newIndex = (focusedDrinkIndex + 1) % drinkNames.length;
    setFocusedDrinkIndex(newIndex);
    (window as any).playClickSound?.();
  };

  return (
    <div className={styles.container}>
      <VantaFog 
        baseColor="#fffbfa"
        highlightColor="#f2e8e6"
        midtoneColor="#a1c7ef"
        lowlightColor="#e3f4fc"
        enableControls={true}
      />
      
      {/* Header with Logo and About */}
      <Header />

      {/* Main Title */}
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Choose your healing drink
        </h1>
      </div>

      {/* Scrolling Drink Name Behind 3D Models */}
      <div className={styles.scrollingDrinkName}>
        <div 
          key={focusedDrinkIndex}
          className={styles.scrollingText}
        >
          {Array(20).fill(drinkNames[focusedDrinkIndex]).join(' • ')}
        </div>
      </div>

      <Canvas
        className={styles.canvas}
        style={{ zIndex: 10 }}
        camera={{ 
          position: [cameraControls.positionX, cameraControls.positionY, cameraControls.positionZ], 
          fov: cameraControls.fov 
        }}
      >
        <Suspense fallback={null}>
          <Scene cameraControls={cameraControls} tiltControls={tiltControls} focusedIndex={focusedDrinkIndex} onFocusChange={setFocusedDrinkIndex} />
          <OrbitControls enableZoom={false} />
        </Suspense>
      </Canvas>


      {/* Navigation and Choose Buttons */}
      <div className={styles.navigationContainer}>
        {/* Banner Text */}
        <p className={styles.bannerText}>
          {drinkBannerTexts[focusedDrinkIndex]}
        </p>
        
        {/* Button Group */}
        <div className={styles.buttonGroup}>
          {/* Left Arrow */}
          <button
            onClick={handlePrevDrink}
            className={styles.navButton}
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
            &lt;
          </button>

          {/* Choose Button */}
          <button
            onClick={() => {
              window.playClickSound?.();
              navigate(`/drink/${focusedDrinkIndex}`);
            }}
            className={styles.chooseButton}
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

          {/* Right Arrow */}
          <button
            onClick={handleNextDrink}
            className={styles.navButton}
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
            &gt;
          </button>
        </div>
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