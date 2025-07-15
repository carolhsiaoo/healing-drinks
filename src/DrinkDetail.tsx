import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ChocolateShaderMaterial } from './Shader/ChocolateShaderMaterial';

interface DrinkModelProps {
  modelPath: string;
  index: number;
}

function DrinkModel({ modelPath, index }: DrinkModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

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
            const newMaterial = new ChocolateShaderMaterial();
            child.material = newMaterial;
          }
        }
      });
    } catch (error) {
      console.error(`Error processing materials for ${modelPath}:`, error);
    }
  }, [scene, modelPath, index]);

  return (
    <group ref={group} scale={0.3} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export default function DrinkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const drinkId = parseInt(id || '0');
  const drinks = [
    '/drink1.glb',
    '/drink2.glb',
    '/drink3.glb',
    '/drink4.glb',
    '/drink5.glb',
  ];
  
  const drinkNames = [
    'macchiato',
    'latte', 
    'milk',
    'smoothie',
    'lemonade'
  ];

  const drinkDescriptions = [
    'A rich espresso topped with a dollop of steamed milk foam',
    'Smooth espresso balanced with creamy steamed milk',
    'Pure, refreshing whole milk served chilled',
    'A blend of fresh fruits and yogurt for a healthy treat',
    'Tangy and sweet, made with freshly squeezed lemons'
  ];

  if (drinkId < 0 || drinkId >= drinks.length) {
    return <div>Drink not found</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'white', position: 'relative' }}>
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
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [3, 2, 5], fov: 50 }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[3, 2, 5]} fov={50} />
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Environment preset="city" background={false} />
          
          <DrinkModel modelPath={drinks[drinkId]} index={drinkId} />
          
          <OrbitControls enableZoom={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}