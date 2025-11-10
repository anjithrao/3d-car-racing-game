import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function CityModel(props) {
  const { scene } = useGLTF('/models/city.glb');

  // Debug: Log city model details when loaded
  useEffect(() => {
    if (scene) {
      console.log('City model loaded:', scene);
      
      // Calculate bounding box to understand the model size
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      console.log('City model bounding box:', {
        size: size.toArray(),
        center: center.toArray(),
        min: box.min.toArray(),
        max: box.max.toArray()
      });
      
      // Optimize the model for performance
      scene.traverse((child) => {
        if (child.isMesh) {
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Optimize geometry if possible
          if (child.geometry) {
            child.geometry.computeBoundingBox();
            child.geometry.computeBoundingSphere();
          }
        }
      });
    }
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={[0.3, 0.3, 0.3]} // Start with smaller scale, adjust based on model size
      position={[0, -1, 0]} // Position slightly below ground level
      rotation={[0, 0, 0]} // No rotation initially
      {...props}
    />
  );
} 