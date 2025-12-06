import React from 'react';
import { Html } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';
import { Vector3 } from 'three';

interface GreetingTextProps {
  position: Vector3;
  visible: boolean;
}

export const GreetingText: React.FC<GreetingTextProps> = ({ position, visible }) => {
  return (
    <group position={position}>
      <Html
        center
        distanceFactor={15}
        transform
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          pointerEvents: 'none',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-amber-300 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] whitespace-nowrap font-serif tracking-wider">
            Ethan 祝你
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] mt-2 whitespace-nowrap">
            早日康复 ❥(^_-)
          </h2>
        </div>
      </Html>
    </group>
  );
};