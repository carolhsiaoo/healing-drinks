import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PresentationControls, useGLTF, PerspectiveCamera, Environment, Html, useProgress } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import VantaFog from './VantaFog';
import { ChocolateShaderMaterial } from './Shader/ChocolateShaderMaterial';
import Header from './components/Header';

interface DrinkModelProps {
  modelPath: string;
  tiltStrength: number;
  tiltSmoothness: number;
  enableTilt: boolean;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        color: 'white',
        fontSize: '16px',
        fontFamily: 'monospace',
        textAlign: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          borderTopColor: 'white',
          animation: 'spin 1s linear infinite',
          marginBottom: '10px',
          margin: '0 auto'
        }} />
        <div>Loading {Math.round(progress)}%</div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </Html>
  );
}

function AutoResetPresentationControls({ children, drinkId, autoResetDelay, enableAutoReset }: { 
  children: React.ReactNode; 
  drinkId: number; 
  autoResetDelay: number; 
  enableAutoReset: boolean; 
}) {
  // const controlsRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionRef = useRef(Date.now());

  // Reset when drink changes
  useEffect(() => {
    // Auto-reset is handled by remounting the component when drinkId changes
  }, [drinkId]);

  // Auto-reset after inactivity
  useEffect(() => {
    if (!enableAutoReset) return;

    const handleInteraction = () => {
      lastInteractionRef.current = Date.now();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        // Reset happens automatically when component remounts
      }, autoResetDelay);
    };

    // Set up initial timeout
    handleInteraction();

    // Listen for mouse events on canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', handleInteraction);
      canvas.addEventListener('touchstart', handleInteraction);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (canvas) {
        canvas.removeEventListener('mousedown', handleInteraction);
        canvas.removeEventListener('touchstart', handleInteraction);
      }
    };
  }, [autoResetDelay, enableAutoReset]);

  return (
    <PresentationControls
      enabled={true}
      global={false}
      cursor={true}
      snap={true}
      speed={1}
      zoom={1}
      rotation={[0, 0, 0]}
      polar={[-Math.PI / 3, Math.PI / 3]}
      azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
    >
      {children}
    </PresentationControls>
  );
}

function DrinkModel({ modelPath, tiltStrength, tiltSmoothness, enableTilt }: DrinkModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  const { mouse } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });
  const previousPath = useRef(modelPath);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const isFirstLoad = useRef(true);
  const baseMousePosition = useRef({ x: 0, y: 0 });
  
  // Base tilt constant
  const baseTiltX = 0.5;
  
  // Reset tilt when drink changes with delay
  useEffect(() => {
    if (previousPath.current !== modelPath || isFirstLoad.current) {
      console.log(`[Detail] Model changed to: ${modelPath}`);
      // Disable tilt immediately
      setTiltEnabled(false);
      targetRotation.current = { x: 0, y: 0 };
      if (group.current) {
        console.log(`[Detail] Resetting rotation to base tilt`);
        // Set directly to base tilt to avoid animation jump
        group.current.rotation.x = baseTiltX;
        group.current.rotation.y = 0;
      }
      previousPath.current = modelPath;
      isFirstLoad.current = false;
      
      // Re-enable tilt after delay
      console.log(`[Detail] Will enable tilt after 800ms`);
      const timer = setTimeout(() => {
        console.log(`[Detail] Enabling tilt`);
        // Store current mouse position as baseline when enabling tilt
        baseMousePosition.current = { x: mouse.x, y: mouse.y };
        console.log(`[Detail] Baseline mouse position: x=${baseMousePosition.current.x.toFixed(3)}, y=${baseMousePosition.current.y.toFixed(3)}`);
        setTiltEnabled(true);
      }, 800); // 800ms delay
      
      return () => clearTimeout(timer);
    }
  }, [modelPath]);

  // Material replacement logic - same as in App.tsx
  useEffect(() => {
    try {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.Material;
          const name = material.name?.toLowerCase() || '';
          const exactName = material.name || '';

          if (name.includes('glass')) {
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
            const newMaterial = new ChocolateShaderMaterial();
            mesh.material = newMaterial;
          }
        }
      });
    } catch (error) {
      console.error(`Error processing materials for ${modelPath}:`, error);
    }
  }, [scene, modelPath]);

  // Add rotation animation with mouse tilt effect
  useFrame((state) => {
    if (!group.current) return;
    
    // Base rotation animation
    const baseRotationY = Math.sin(state.clock.elapsedTime) * 0.1;
    
    // Mouse tilt effect with delay
    if (enableTilt && tiltEnabled) {
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
        console.log(`[Detail] Mouse tilt: x=${targetRotation.current.x.toFixed(3)}, y=${targetRotation.current.y.toFixed(3)} (relative: ${relativeMouseX.toFixed(3)}, ${relativeMouseY.toFixed(3)})`);
      }
    } else {
      targetRotation.current.x = 0;
      targetRotation.current.y = 0;
    }
    
    // Use the base tilt constant
    
    // Smooth interpolation
    if (enableTilt && tiltEnabled) {
      group.current.rotation.x += (baseTiltX + targetRotation.current.x - group.current.rotation.x) * tiltSmoothness;
      group.current.rotation.y += (baseRotationY + targetRotation.current.y - group.current.rotation.y) * tiltSmoothness;
    } else {
      group.current.rotation.x += (baseTiltX - group.current.rotation.x) * tiltSmoothness;
      group.current.rotation.y += (baseRotationY - group.current.rotation.y) * tiltSmoothness;
    }
    
    // Debug logging every 60 frames (roughly once per second)
    const t = state.clock.elapsedTime;
    if (Math.floor(t * 60) % 60 === 0 && Math.floor(t * 60) !== Math.floor((t - 1/60) * 60)) {
      console.log(`[Detail] State: tiltEnabled=${tiltEnabled}, enableTilt=${enableTilt}, rotation=(${group.current.rotation.x.toFixed(3)}, ${group.current.rotation.y.toFixed(3)})`);
    }
  });

  return (
    <group ref={group} scale={0.2} position={[0, 0, 0]}>
      {/* Center the model in the canvas */}
      <group position={[0, -1, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// Preload all drink models
const drinkPaths = [
  '/drink4.glb',
  '/drink2.glb',
  '/drink3.glb',
  '/drink1.glb',
  '/drink5.glb',
];

drinkPaths.forEach(path => {
  useGLTF.preload(path);
});

export default function DrinkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const drinkId = parseInt(id || '0', 10);
  
  const cameraControls = useControls('Detail Camera', {
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 0, min: -5, max: 10, step: 0.1 },
    positionZ: { value: 3, min: -10, max: 10, step: 0.1 },
    fov: { value: 50, min: 20, max: 120, step: 1 },
  });
  
  const tiltControls = useControls('Detail Tilt Effect', {
    tiltStrength: { value: 0.3, min: 0, max: 1, step: 0.05 },
    tiltSmoothness: { value: 0.1, min: 0.01, max: 0.3, step: 0.01 },
    enableTilt: { value: true },
  });
  
  const presentationControls = useControls('Presentation Controls', {
    autoResetDelay: { value: 3000, min: 1000, max: 10000, step: 500 },
    enableAutoReset: { value: true },
  });
  const drinks = [
    '/drink4.glb',
    '/drink2.glb',
    '/drink3.glb',
    '/drink1.glb',
    '/drink5.glb',
  ];
  
  const drinkNames = [
    'smoothie',
    'latte', 
    'milk',
    'macchiato',
    'lemonade'
  ];

  const drinkCategories = [
    'Move to Feel Better',
    'Emotional Support',
    'Learn to Heal',
    'Scientific Healing',
    'Motivation Boost'
  ];

  const drinkDescriptions = [
    'Stand up, reach your arms overhead, and take a deep breath. Hold for 5 seconds. Movement releases endorphins!',
    '"Even the darkest night will end and the sun will rise." — Victor Hugo. Sometimes, hope is all we need to carry on.',
    'Curious minds heal faster. Watch <a href="https://www.youtube.com/watch?v=iCvmsMzlF7o&t=1s" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; font-family: inherit; font-size: inherit; font-weight: inherit;">the power of vulnerability TED Talk</a> from Brene Brown. It might just change how you see strength.',
    'Try the 4-7-8 breathing technique: Breathe in for 4 seconds, hold for 7, exhale for 8. Do a few rounds to reset.',
    'Start small today: Make your bed. Drink water. Send one kind text. These 3 simple actions can shift your entire day.'
  ];

  const drinkTitleColors = [
    '#8B1D33', // smoothie - red
    '#6B5D4F', // latte - olive/brownish
    '#333333', // milk - dark gray
    '#8B6F47', // macchiato - brown
    '#0E750E'  // lemonade - green
  ];

  const drinkBannerTexts = [
    'A small movement can make a big shift.',
    'Sometimes, all we need is a gentle reminder.',
    'Knowledge can comfort more than you think.',
    'Science says it works. Why not try it now?',
    'Action fuels momentum.'
  ];

  const drinkBackgroundColors = [
    { 
      baseColor: '#f5f5f5',
      highlightColor: '#e59292',
      midtoneColor: '#ffffff', 
      lowlightColor: '#c1c1c1' 
    }, // smoothie - berry tones
    { 
      baseColor: '#ffffff',
      highlightColor: '#e6c3ae',
      midtoneColor: '#e2e2e2',
      lowlightColor: '#fcfffa'
    }, // latte - creamy coffee tones
    { 
      baseColor: '#f8f8f8', 
      highlightColor: '#315dce', 
      midtoneColor: '#e6e6e6', 
      lowlightColor: '#F5F5F5' 
    }, // milk - pure white tones
    { 
      baseColor: '#ffffff', 
      highlightColor: '#ffffff', 
      midtoneColor: '#ffe5cc', 
      lowlightColor: '#ffffff' 
    }, // macchiato - warm coffee tones
    { 
      baseColor: '#efefef', 
      highlightColor: '#e3e87d', 
      midtoneColor: '#73ce94', 
      lowlightColor: '#bebebe' 
    }, // lemonade - citrus tones
  ];

  const currentColors = drinkBackgroundColors[drinkId] || drinkBackgroundColors[0];

  if (drinkId < 0 || drinkId >= drinks.length) {
    return <div>Drink not found</div>;
  }


  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <VantaFog 
        baseColor={currentColors.baseColor}
        highlightColor={currentColors.highlightColor}
        midtoneColor={currentColors.midtoneColor}
        lowlightColor={currentColors.lowlightColor}
        enableControls={true}
      />
      {/* Header */}
      <Header showMusicIcon={true} />

      {/* Scientific Healing subtitle */}
      <div style={{
        position: 'absolute',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100
      }}>
        <h3 style={{ 
          fontSize: '24px', 
          color: drinkTitleColors[drinkId], 
          fontWeight: 'bold',
          margin: 0
        }}>{drinkCategories[drinkId]}</h3>
      </div>

      {/* Drink Title Pattern - Behind everything */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 2
      }}>
        {/* Repeating horizontal text */}
        {[...Array(5)].map((_, index) => (
          <h1 key={index} style={{
            fontSize: '96px',
            fontWeight: 'bold',
            color: drinkTitleColors[drinkId],
            margin: '0 20px',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
            opacity: 0.3
          }}>
            {drinkNames[drinkId]}
          </h1>
        ))}
      </div>


      {/* Description Text */}
      <div style={{
        position: 'absolute',
        bottom: '250px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '700px',
        textAlign: 'left',
        zIndex: 100
      }}>
        <p style={{
          fontSize: '20px',
          lineHeight: '1.6',
          fontWeight: 600,
          color: drinkTitleColors[drinkId]
        }}
        dangerouslySetInnerHTML={{ __html: drinkDescriptions[drinkId] }}
        />
      </div>
      
      <Canvas
        style={{ 
          width: '500px', 
          height: '500px', 
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20
        }}
        camera={{ 
          position: [cameraControls.positionX, cameraControls.positionY, cameraControls.positionZ], 
          fov: cameraControls.fov 
        }}
      >
        <Suspense fallback={<Loader />}>
          <PerspectiveCamera 
            makeDefault 
            position={[cameraControls.positionX, cameraControls.positionY, cameraControls.positionZ]} 
            fov={cameraControls.fov} 
          />
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <Environment preset="city" background={false} />
          
          <AutoResetPresentationControls
            drinkId={drinkId}
            autoResetDelay={presentationControls.autoResetDelay}
            enableAutoReset={presentationControls.enableAutoReset}
          >
            <DrinkModel 
              modelPath={drinks[drinkId]} 
              tiltStrength={tiltControls.tiltStrength}
              tiltSmoothness={tiltControls.tiltSmoothness}
              enableTilt={tiltControls.enableTilt}
            />
          </AutoResetPresentationControls>
        </Suspense>
      </Canvas>
      
      {/* Carousel Dots */}
      <div style={{
        position: 'absolute',
        bottom: '200px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 100
      }}>
        {drinks.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              window.playClickSound?.();
              navigate(`/drink/${index}`);
            }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: index === drinkId ? drinkTitleColors[drinkId] : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0
            }}
            aria-label={`Go to ${drinkNames[index]}`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        zIndex: 100
      }}>
        {/* Previous Drink */}
        <button
          onClick={() => {
            window.playClickSound?.();
            navigate(`/drink/${(drinkId - 1 + drinkNames.length) % drinkNames.length}`);
          }}
          style={{
            padding: '12px 25px',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
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

        {/* Back Button */}
        <button
          onClick={() => {
            window.playClickSound?.();
            navigate('/');
          }}
          style={{
            padding: '12px 40px',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Back
        </button>

        {/* Next Drink */}
        <button
          onClick={() => {
            window.playClickSound?.();
            navigate(`/drink/${(drinkId + 1) % drinkNames.length}`);
          }}
          style={{
            padding: '12px 25px',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
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
      
      {/* Scrolling Banner */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        opacity: 0.55,
        width: '100%',
        height: '60px',
        backgroundColor: drinkTitleColors[drinkId],
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          animation: 'scroll 20s linear infinite',
          whiteSpace: 'nowrap',
          color: 'white',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          {Array(10).fill(null).map((_, i) => (
            <span key={i} style={{ 
              marginRight: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '40px'
            }}>
              <span>{drinkBannerTexts[drinkId]}</span>
              <span>✦</span>
            </span>
          ))}
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

