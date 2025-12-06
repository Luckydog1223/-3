import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, MathUtils, DynamicDrawUsage, Quaternion } from 'three';
import { TreeState } from '../types';
import { CONFIG, COLORS } from '../constants';

interface ArixTreeProps {
  treeState: TreeState;
}

const tempObject = new Object3D();
const tempPos = new Vector3();

export const ArixTree: React.FC<ArixTreeProps> = ({ treeState }) => {
  const needlesRef = useRef<InstancedMesh>(null);
  const ornamentsRef = useRef<InstancedMesh>(null);
  const giftsRef = useRef<InstancedMesh>(null);
  const ribbonRef = useRef<InstancedMesh>(null);
  
  // 1. Needles Data
  const needlesData = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFIG.NEEDLE_COUNT; i++) {
      const y = MathUtils.randFloat(0, CONFIG.TREE_HEIGHT);
      const radiusAtHeight = (1 - y / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS;
      const angle = y * 5 + MathUtils.randFloat(0, Math.PI * 2);
      const r = MathUtils.randFloat(radiusAtHeight * 0.4, radiusAtHeight);
      
      const treePos = new Vector3(
        Math.cos(angle) * r,
        y - CONFIG.TREE_HEIGHT / 2,
        Math.sin(angle) * r
      );

      const scatterPos = getRandomScatterPos();
      data.push({ treePos, scatterPos, scale: MathUtils.randFloat(0.5, 1.5) });
    }
    return data;
  }, []);

  // 2. Ornaments Data
  const ornamentsData = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const y = MathUtils.randFloat(0.5, CONFIG.TREE_HEIGHT - 1);
      const radiusAtHeight = (1 - y / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS;
      const angle = MathUtils.randFloat(0, Math.PI * 2);
      
      // Place near the surface
      const treePos = new Vector3(
        Math.cos(angle) * radiusAtHeight * 0.9, 
        y - CONFIG.TREE_HEIGHT / 2,
        Math.sin(angle) * radiusAtHeight * 0.9
      );

      const scatterPos = getRandomScatterPos();
      data.push({ treePos, scatterPos, scale: MathUtils.randFloat(0.8, 1.2) });
    }
    return data;
  }, []);

  // 3. Gifts Data (Red Cubes)
  const giftsData = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFIG.GIFT_COUNT; i++) {
      const y = MathUtils.randFloat(0.2, CONFIG.TREE_HEIGHT * 0.7); // Mostly lower half
      const radiusAtHeight = (1 - y / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS;
      const angle = MathUtils.randFloat(0, Math.PI * 2);
      
      // Place slightly embedded or just on surface
      const treePos = new Vector3(
        Math.cos(angle) * radiusAtHeight * 0.85,
        y - CONFIG.TREE_HEIGHT / 2,
        Math.sin(angle) * radiusAtHeight * 0.85
      );

      const scatterPos = getRandomScatterPos();
      data.push({ treePos, scatterPos, scale: MathUtils.randFloat(0.6, 1.0) });
    }
    return data;
  }, []);

  // 4. Ribbon Data (Spiral)
  const ribbonData = useMemo(() => {
    const data = [];
    const turns = 6;
    for (let i = 0; i < CONFIG.RIBBON_COUNT; i++) {
      const t = i / CONFIG.RIBBON_COUNT; // 0 to 1
      const y = t * CONFIG.TREE_HEIGHT;
      const radiusAtHeight = ((1 - t) * CONFIG.TREE_RADIUS) + 0.2; // Slightly outside tree
      const angle = t * Math.PI * 2 * turns; // Spiral angle
      
      const treePos = new Vector3(
        Math.cos(angle) * radiusAtHeight,
        y - CONFIG.TREE_HEIGHT / 2,
        Math.sin(angle) * radiusAtHeight
      );

      const scatterPos = getRandomScatterPos();
      
      // Calculate rotation to align with spiral tangent
      const nextT = (i + 1) / CONFIG.RIBBON_COUNT;
      const nextY = nextT * CONFIG.TREE_HEIGHT;
      const nextRadius = ((1 - nextT) * CONFIG.TREE_RADIUS) + 0.2;
      const nextAngle = nextT * Math.PI * 2 * turns;
      const nextPos = new Vector3(
         Math.cos(nextAngle) * nextRadius,
         nextY - CONFIG.TREE_HEIGHT / 2,
         Math.sin(nextAngle) * nextRadius
      );
      
      const tangent = new Vector3().subVectors(nextPos, treePos).normalize();
      const quaternion = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), tangent);

      data.push({ treePos, scatterPos, scale: 1, rotation: quaternion });
    }
    return data;
  }, []);

  function getRandomScatterPos() {
    const theta = MathUtils.randFloat(0, Math.PI * 2);
    const phi = MathUtils.randFloat(0, Math.PI);
    const scatterR = MathUtils.randFloat(CONFIG.SCATTER_RADIUS * 0.2, CONFIG.SCATTER_RADIUS);
    return new Vector3(
      scatterR * Math.sin(phi) * Math.cos(theta),
      scatterR * Math.sin(phi) * Math.sin(theta),
      scatterR * Math.cos(phi)
    );
  }

  // Animation Loop
  useFrame((state, delta) => {
    const isFormed = treeState === TreeState.TREE_SHAPE;
    const targetLerp = isFormed ? 1 : 0;
    
    updateMesh(needlesRef.current, needlesData, targetLerp, delta, 'needle');
    updateMesh(ornamentsRef.current, ornamentsData, targetLerp, delta, 'ornament');
    updateMesh(giftsRef.current, giftsData, targetLerp, delta, 'gift');
    updateMesh(ribbonRef.current, ribbonData, targetLerp, delta, 'ribbon');
  });

  const animProgress = useRef(0);

  const updateMesh = (
    mesh: InstancedMesh | null, 
    data: any[], 
    target: number, 
    delta: number,
    type: 'needle' | 'ornament' | 'gift' | 'ribbon'
  ) => {
    if (!mesh) return;

    // Shared simple spring/damp logic
    const speed = CONFIG.ANIMATION_SPEED;
    animProgress.current = MathUtils.damp(animProgress.current, target, speed, delta);
    const t = animProgress.current;

    for (let i = 0; i < data.length; i++) {
      const { treePos, scatterPos, scale, rotation } = data[i];

      // Interpolate position
      tempPos.lerpVectors(scatterPos, treePos, t);
      
      // Add floating noise when scattered
      if (t < 0.95) {
        const time = Date.now() * 0.001;
        const noise = Math.sin(time + i * 0.1) * (1 - t) * 0.5;
        tempPos.y += noise;
      }

      tempObject.position.copy(tempPos);
      
      // Orientation
      if (type === 'needle') {
        tempObject.lookAt(0, tempPos.y, 0);
      } else if (type === 'ribbon' && rotation) {
        // Ribbons have pre-calculated tangents for the tree shape
        // In scatter mode, let them rotate randomly or slowly
        if (t > 0.8) {
           tempObject.quaternion.slerp(rotation, (t - 0.8) * 5);
        } else {
           tempObject.rotation.set(i * 0.1, i * 0.1, i * 0.1);
        }
      } else {
        // Gifts and Ornaments spin
        tempObject.rotation.y = i + Date.now() * 0.0005;
        tempObject.rotation.z = type === 'gift' ? 0 : i * 0.1; // Gifts stay upright-ish
      }
      
      // Scale Transition
      // Ribbons: Grow length-wise as they form? Or just uniform scale.
      let currentScale = scale;
      if (type === 'needle') currentScale *= 0.3;
      if (type === 'ornament') currentScale *= 0.6;
      if (type === 'gift') currentScale *= 0.7;
      
      // Ribbon particles are small flat bits
      if (type === 'ribbon') {
         tempObject.scale.set(0.3, 0.05, 0.4).multiplyScalar(t); // Shrink to 0 when scattered? Or just explode
         if (t < 0.1) tempObject.scale.setScalar(0.2); // Keep them visible as debris
      } else {
         tempObject.scale.setScalar(currentScale);
      }

      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  return (
    <group>
      {/* 1. Pine Needles (Emerald Green) */}
      <instancedMesh
        ref={needlesRef}
        args={[undefined, undefined, CONFIG.NEEDLE_COUNT]}
        usage={DynamicDrawUsage}
      >
        <coneGeometry args={[1, 3, 4]} /> 
        <meshStandardMaterial
          color={COLORS.EMERALD}
          roughness={0.4}
          metalness={0.4}
        />
      </instancedMesh>

      {/* 2. Ornaments (Gold) */}
      <instancedMesh
        ref={ornamentsRef}
        args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}
        usage={DynamicDrawUsage}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={COLORS.GOLD}
          emissive={COLORS.GOLD}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={1}
        />
      </instancedMesh>

      {/* 3. Gifts (Red Cubes) */}
      <instancedMesh
        ref={giftsRef}
        args={[undefined, undefined, CONFIG.GIFT_COUNT]}
        usage={DynamicDrawUsage}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={COLORS.RED}
          roughness={0.2}
          metalness={0.3}
          emissive={COLORS.RED}
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* 4. Ribbon (Metallic Red/Gold) */}
      <instancedMesh
        ref={ribbonRef}
        args={[undefined, undefined, CONFIG.RIBBON_COUNT]}
        usage={DynamicDrawUsage}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={COLORS.ROSE_GOLD}
          roughness={0.1}
          metalness={0.9}
          emissive={COLORS.ROSE_GOLD}
          emissiveIntensity={0.5}
        />
      </instancedMesh>
    </group>
  );
};