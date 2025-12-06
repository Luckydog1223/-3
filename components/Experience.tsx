import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ArixTree } from './ArixTree';
import { GoldenStar } from './GoldenStar';
import { GreetingText } from './GreetingText';
import { TreeState } from '../types';
import { CONFIG } from '../constants';
import { Vector3, Points } from 'three';

interface ExperienceProps {
  treeState: TreeState;
}

const Snow: React.FC = () => {
  const count = 1500;
  const mesh = useRef<Points>(null);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 60; // x
      temp[i * 3 + 1] = (Math.random() - 0.5) * 60; // y
      temp[i * 3 + 2] = (Math.random() - 0.5) * 60; // z
    }
    return temp;
  }, []);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Move down
      positions[i * 3 + 1] -= delta * 2; 
      
      // Reset if below bottom
      if (positions[i * 3 + 1] < -30) {
        positions[i * 3 + 1] = 30;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
};

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  const isTreeForm = treeState === TreeState.TREE_SHAPE;

  // Star and Text positions relative to tree top
  const topPosition = new Vector3(0, CONFIG.TREE_HEIGHT / 2 + 1, 0);
  const textPosition = new Vector3(0, CONFIG.TREE_HEIGHT / 2 + 3, 0);

  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: false }}>
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={45} />
      
      {/* Controls: AutoRotate when formed to show off the tree */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={isTreeForm}
        autoRotateSpeed={0.5}
        zoomSpeed={0.5}
      />

      {/* Lighting for Luxury Feel */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#ffeebb" 
        castShadow 
      />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#00ff44" />
      
      {/* Environment reflections */}
      <Environment preset="city" />

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Snow />

      {/* Main Content */}
      <Suspense fallback={null}>
        <group position={[0, -2, 0]}>
          <ArixTree treeState={treeState} />
          <GoldenStar position={topPosition} visible={isTreeForm} />
          <GreetingText position={textPosition} visible={isTreeForm} />
        </group>
      </Suspense>

      {/* Post Processing for Cinematic Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.5} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  );
};