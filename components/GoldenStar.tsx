import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Mesh, Vector3, Shape, ExtrudeGeometry } from 'three';
import { COLORS } from '../constants';

interface GoldenStarProps {
  position: Vector3;
  visible: boolean;
}

export const GoldenStar: React.FC<GoldenStarProps> = ({ position, visible }) => {
  const meshRef = useRef<Mesh>(null);

  const starGeometry = useMemo(() => {
    const shape = new Shape();
    const points = 5;
    const outerRadius = 1;
    const innerRadius = 0.4;

    for (let i = 0; i < points * 2; i++) {
      // Offset angle by -Math.PI/2 to make the star point straight up
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.4, // Thickness
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2,
    };

    const geom = new ExtrudeGeometry(shape, extrudeSettings);
    geom.center(); // Center the geometry so it rotates around its center
    return geom;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle rotation
    meshRef.current.rotation.y += 0.01;
    // Slight bobbing
    meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;

    // Pulse scale effect
    const scale = visible ? 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 : 0;
    
    meshRef.current.scale.lerp(new Vector3(scale, scale, scale), 0.1);
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={starGeometry}>
        <meshStandardMaterial
          color={COLORS.GOLD}
          emissive={COLORS.GOLD}
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={1}
        />
      </mesh>
      {/* Inner light source for bloom */}
      <pointLight color={COLORS.GOLD} intensity={3} distance={6} decay={2} />
    </group>
  );
};