// src/RoadTrack.jsx
import React, { useRef } from 'react';
import * as THREE from 'three';

// Road dimensions
const ROAD_WIDTH = 25;
const ROAD_LENGTH = 60;
const ROAD_HEIGHT = 0.15;
const ROAD_COLOR = '#1a1a1a';

// Road segments layout
const roadSegments = [
  { position: [0, 0, 0], rotation: [0, 0, 0] },
  { position: [ROAD_LENGTH / 2, 0, ROAD_LENGTH / 2], rotation: [0, Math.PI / 2, 0] },
  { position: [ROAD_LENGTH, 0, ROAD_LENGTH], rotation: [0, 0, 0] },
  { position: [ROAD_LENGTH * 1.5, 0, ROAD_LENGTH * 1.5], rotation: [0, -Math.PI / 2, 0] },
  { position: [ROAD_LENGTH * 2, 0, ROAD_LENGTH * 2], rotation: [0, 0, 0] },
  { position: [ROAD_LENGTH * 2.5, 0, ROAD_LENGTH * 2.5], rotation: [0, Math.PI / 2, 0] },
  { position: [ROAD_LENGTH * 3, 0, ROAD_LENGTH * 3], rotation: [0, 0, 0] },
];

export default function RoadTrack() {
  const roadRef = useRef();

  return (
    <group ref={roadRef}>
      {/* Main road segments */}
      {roadSegments.map((segment, index) => (
        <mesh
          key={`road-${index}`}
          position={segment.position}
          rotation={segment.rotation}
          receiveShadow
        >
          <boxGeometry args={[ROAD_WIDTH, ROAD_HEIGHT, ROAD_LENGTH]} />
          <meshStandardMaterial
            color={ROAD_COLOR}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Center markings */}
      {roadSegments.map((segment, index) => (
        <mesh
          key={`center-mark-${index}`}
          position={[segment.position[0], segment.position[1] + 0.01, segment.position[2]]}
          rotation={segment.rotation}
        >
          <boxGeometry args={[0.5, 0.02, ROAD_LENGTH]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Lane dividers */}
      {roadSegments.map((segment, index) => (
        <group key={`lane-mark-${index}`}>
          {[ -ROAD_WIDTH / 4, ROAD_WIDTH / 4 ].map((xOffset, i) => (
            <mesh
              key={i}
              position={[segment.position[0] + xOffset, segment.position[1] + 0.01, segment.position[2]]}
              rotation={segment.rotation}
            >
              <boxGeometry args={[0.3, 0.02, ROAD_LENGTH]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Road barriers */}
      {roadSegments.map((segment, index) => (
        <group key={`barriers-${index}`}>
          {[ -ROAD_WIDTH / 2, ROAD_WIDTH / 2 ].map((xOffset, i) => (
            <mesh
              key={i}
              position={[segment.position[0] + xOffset, segment.position[1] + 1, segment.position[2]]}
              rotation={segment.rotation}
              castShadow
            >
              <boxGeometry args={[0.5, 2, ROAD_LENGTH]} />
              <meshStandardMaterial
                color="#ff3333"
                emissive="#ff0000"
                emissiveIntensity={0.8}
                metalness={0.5}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Distance markers every 10 units */}
      {roadSegments.map((segment, index) => (
        <group key={`markers-${index}`}>
          {Array.from({ length: Math.floor(ROAD_LENGTH / 10) }).map((_, i) => (
            <mesh
              key={`marker-${index}-${i}`}
              position={[
                segment.position[0],
                segment.position[1] + 0.02,
                segment.position[2] - ROAD_LENGTH / 2 + i * 10
              ]}
              rotation={segment.rotation}
            >
              <boxGeometry args={[ROAD_WIDTH - 2, 0.02, 0.5]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.2}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
