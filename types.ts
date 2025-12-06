import { Vector3, Color } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      mesh: any;
      instancedMesh: any;
      meshStandardMaterial: any;
      coneGeometry: any;
      dodecahedronGeometry: any;
      boxGeometry: any;
      bufferGeometry: any;
      bufferAttribute: any;
      points: any;
      pointsMaterial: any;
      [elemName: string]: any;
    }
  }
}

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  scatterPos: Vector3;
  treePos: Vector3;
  rotation: Vector3;
  scale: number;
  color?: Color;
}

export interface ArixTreeProps {
  treeState: TreeState;
}