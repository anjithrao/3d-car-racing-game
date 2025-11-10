import React, { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Loader, Sky } from "@react-three/drei";
import Car from "./Car";
import CityModel from "./CityModel";

export default function App() {
  const cameraRef = useRef();

  return (
    <>
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          {/* Dynamic camera controlled inside Car.jsx */}
          <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 6]} fov={60} />

          {/* Beautiful realistic sky */}
          <Sky
            distance={450000}
            sunPosition={[0, 1, 0]}
            inclination={0.3}
            azimuth={0.25}
            turbidity={10}
            rayleigh={3}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            exposure={0.5}
          />

          {/* Environment lighting (no background) */}
          <Environment background={false} files="/hdri/night_city_4k.hdr" />

          {/* 3D City Model */}
          <CityModel />

          {/* Your fully functional car with all controls */}
          <Car cameraRef={cameraRef} />
        </Suspense>
      </Canvas>

      <Loader />
    </>
  );
}
