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
    <group ref={group} scale={0.3} position={[0, 0, 0]}>
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

  const drinkDescriptions = [
    'A blend of fresh fruits and yogurt for a healthy treat',
    'Smooth espresso balanced with creamy steamed milk',
    'Pure, refreshing whole milk served chilled',
    'A rich espresso topped with a dollop of steamed milk foam',
    'Tangy and sweet, made with freshly squeezed lemons'
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
      highlightColor: '#cbcbcb', 
      midtoneColor: '#e5b485', 
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
  
  console.log('DrinkDetail - Current drink ID:', drinkId);
  console.log('DrinkDetail - Current colors:', currentColors);

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
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <VantaFog 
        baseColor={currentColors.baseColor}
        highlightColor={currentColors.highlightColor}
        midtoneColor={currentColors.midtoneColor}
        lowlightColor={currentColors.lowlightColor}
        enableControls={true}
      />
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
      >
        Back to Menu
      </button>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        maxWidth: '400px',
        zIndex: 100
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#333',
          textTransform: 'capitalize'
        }}>
          {drinkNames[drinkId]}
        </h1>
        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#666'
        }}>
          {drinkDescriptions[drinkId]}
        </p>
      </div>
      
      <Canvas
        style={{ width: '100vw', height: '100vh', position: 'relative', zIndex: 1 }}
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
            enableZoom={true}
            minDistance={2}
            maxDistance={10}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
      
      <button
        onClick={handlePrevious}
        style={{
          position: 'absolute',
          top: '50%',
          left: '40px',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
        aria-label="Previous drink"
      >
        ‹
      </button>
      
      <button
        onClick={handleNext}
        style={{
          position: 'absolute',
          top: '50%',
          right: '40px',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
        aria-label="Next drink"
      >
        ›
      </button>
      
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        {drinks.map((_, index) => (
          <button
            key={index}
            onClick={() => navigate(`/drink/${index}`)}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: index === drinkId ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            aria-label={`Go to ${drinkNames[index]}`}
          />
        ))}
      </div>
    </div>
  );
}

