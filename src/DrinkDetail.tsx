import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment, Html, useProgress } from '@react-three/drei';
import { Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';
import VantaFog from './VantaFog';
import { ChocolateShaderMaterial } from './Shader/ChocolateShaderMaterial';

interface DrinkModelProps {
  modelPath: string;
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

function DrinkModel({ modelPath }: DrinkModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

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

  // Add rotation animation
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group} scale={0.4} position={[0, -1, 0]}>
      <primitive object={scene} />
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
    'Curious minds heal faster. Watch Brené Brown\'s TED Talk on vulnerability — it might just change how you see strength.',
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

  const handlePrevious = () => {
    const prevId = drinkId === 0 ? drinks.length - 1 : drinkId - 1;
    navigate(`/drink/${prevId}`);
  };

  const handleNext = () => {
    const nextId = drinkId === drinks.length - 1 ? 0 : drinkId + 1;
    navigate(`/drink/${nextId}`);
  };

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
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '30px 50px',
        zIndex: 100
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>Logo</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '18px', color: '#1a1a1a' }}>About</span>
          <span style={{ fontSize: '24px' }}>♪</span>
        </div>
      </div>

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
        }}>
          {drinkDescriptions[drinkId]}
        </p>
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
        camera={{ position: [3, 2, 5], fov: 50 }}
      >
        <Suspense fallback={<Loader />}>
          <PerspectiveCamera makeDefault position={[3, 2, 5]} fov={50} />
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <Environment preset="city" background={false} />
          
          <DrinkModel modelPath={drinks[drinkId]} />
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
      
      {/* Carousel Dots */}
      <div style={{
        position: 'absolute',
        bottom: '180px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 100
      }}>
        {drinks.map((_, index) => (
          <button
            key={index}
            onClick={() => navigate(`/drink/${index}`)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: index === drinkId ? drinkTitleColors[drinkId] : '#D4C4B0',
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
          onClick={() => navigate(`/drink/${(drinkId - 1 + drinkNames.length) % drinkNames.length}`)}
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
          onClick={() => navigate('/')}
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
          onClick={() => navigate(`/drink/${(drinkId + 1) % drinkNames.length}`)}
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
            <span key={i} style={{ marginRight: '40px' }}>
              {drinkBannerTexts[drinkId]} ✦
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

