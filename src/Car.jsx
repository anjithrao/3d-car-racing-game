import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Grid, useGLTF, SpotLight } from "@react-three/drei";

// Car settings
const CAR_HEIGHT = 0.2;  // Reduced height to stay closer to ground
const CAR_START_POSITION = [0, CAR_HEIGHT, 0];
const CAR_SCALE = 0.3;  // Increased from 0.2 to 0.3 for slightly bigger car

// Camera settings
const CAMERA_OFFSET = new THREE.Vector3(0, 0, -2.5);
const CAMERA_TARGET_OFFSET = new THREE.Vector3(0, 0, 2);
const CAMERA_SMOOTHING = 0.15;

// Car physics constants - Tuned for arcade-style handling
const NORMAL_MAX_SPEED = 0.3;    // Reduced normal max speed
const NITRO_MAX_SPEED = 0.4;     // Reduced boosted max speed with nitro
const ACCELERATION = 0.03;       // Reduced normal acceleration
const NITRO_ACCELERATION = 0.06; // Reduced faster acceleration with nitro
const DECELERATION = 0.95;       // Slightly more grip
const TURN_SPEED = 0.05;         // Reduced for more controlled turning
const BASE_DRIFT_FACTOR = 0.90;  // Normal drift
const DRIFT_FACTOR_DRIFT = 0.75; // More drift when drifting
const BASE_TILT_FACTOR = 0.2;    // Normal tilt
const TILT_FACTOR_DRIFT = 0.4;   // More tilt when drifting

export default function Car({ cameraRef }) {
  const carRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef(0);
  const tilt = useRef(0);
  const keys = useRef({});
  const nitroActive = useRef(false);  // Track nitro state

  // Load the car model with error handling
  const { scene: carModel } = useGLTF('/models/car.glb');

  // Debug: Log if model loaded
  useEffect(() => {
    console.log('Car model loaded:', carModel);
    if (carModel) {
      console.log('Model children:', carModel.children);
      console.log('Model position:', carModel.position);
      console.log('Model scale:', carModel.scale);
      console.log('Model bounding box:', new THREE.Box3().setFromObject(carModel));
    }
  }, [carModel]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      keys.current[e.key] = true;
    };
    
    const handleKeyUp = (e) => {
      e.preventDefault();
      keys.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      keys.current = {};
    };
  }, []);

  // Animation frame updates
  useFrame((state, delta) => {
    if (!carRef.current) return;

    const car = carRef.current;

    // Check if nitro is active (Shift key)
    nitroActive.current = keys.current.Shift;
    const currentMaxSpeed = nitroActive.current ? NITRO_MAX_SPEED : NORMAL_MAX_SPEED;
    const currentAcceleration = nitroActive.current ? NITRO_ACCELERATION : ACCELERATION;

    // DRIFT MODE: If spacebar is held, increase drift and tilt
    const drifting = keys.current[' '];
    const DRIFT_FACTOR = drifting ? DRIFT_FACTOR_DRIFT : BASE_DRIFT_FACTOR;
    const TILT_FACTOR = drifting ? TILT_FACTOR_DRIFT : BASE_TILT_FACTOR;

    // Calculate acceleration with more responsive controls
    let targetSpeed = 0;
    if (keys.current.ArrowUp || keys.current.w) targetSpeed = currentMaxSpeed;
    if (keys.current.ArrowDown || keys.current.s) targetSpeed = -currentMaxSpeed * 0.6; // Better reverse speed

    // Apply acceleration with momentum
    velocity.current.z = THREE.MathUtils.lerp(
      velocity.current.z,
      targetSpeed,
      currentAcceleration
    );

    // Natural deceleration with slight drift
    if (!keys.current.ArrowUp && !keys.current.w && !keys.current.ArrowDown && !keys.current.s) {
      velocity.current.z *= DECELERATION;
    }

    // Add visual effects for nitro
    if (nitroActive.current && (keys.current.ArrowUp || keys.current.w)) {
      // Add camera shake effect during nitro
      if (cameraRef.current) {
        cameraRef.current.position.y += Math.sin(state.clock.elapsedTime * 30) * 0.01;
      }
    }

    // Enhanced turning mechanics
    let turnDirection = 0;
    if ((keys.current.ArrowLeft || keys.current.a) && !(keys.current.ArrowRight || keys.current.d)) turnDirection = 1;
    if ((keys.current.ArrowRight || keys.current.d) && !(keys.current.ArrowLeft || keys.current.a)) turnDirection = -1;

    // Speed-based turning with better control at high speeds
    const speedFactor = Math.abs(velocity.current.z) / currentMaxSpeed;
    const turnAmount = TURN_SPEED * turnDirection * (0.5 + speedFactor * 0.5); // Better turning at all speeds
    rotation.current += turnAmount;

    // Enhanced tilt effect
    const targetTilt = -turnDirection * TILT_FACTOR * speedFactor;
    tilt.current = THREE.MathUtils.lerp(tilt.current, targetTilt, 0.1);

    // Update car position and rotation with drift
    car.rotation.y = rotation.current;
    car.rotation.z = tilt.current;

    // Apply movement with slight drift effect
    const moveDirection = new THREE.Vector3(0, 0, velocity.current.z)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current);

    // Add slight sideways movement when turning at speed (drift)
    if (Math.abs(turnDirection) > 0 && Math.abs(velocity.current.z) > currentMaxSpeed * 0.5) {
      moveDirection.x += turnDirection * speedFactor * 0.02 * (drifting ? 2 : 1);
    }

    car.position.x += moveDirection.x;
    car.position.z += moveDirection.z;
    car.position.y = CAR_HEIGHT + Math.abs(velocity.current.z) * 0.05; // Reduced bounce effect

    // Dynamic camera follow
    if (cameraRef.current) {
      const cameraOffset = CAMERA_OFFSET.clone();
      // Add dynamic camera angle based on speed
      const speedTilt = Math.abs(velocity.current.z) * 0.5;
      cameraOffset.y -= speedTilt * 0.2;
      cameraOffset.z -= speedTilt * 0.5;
      
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current);
      const targetPosition = car.position.clone().add(cameraOffset);
      
      cameraRef.current.position.lerp(targetPosition, CAMERA_SMOOTHING);
      
      const lookTarget = car.position.clone().add(
        CAMERA_TARGET_OFFSET.clone().applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          rotation.current
        )
      );
      
      cameraRef.current.lookAt(lookTarget);
    }
  });

  useEffect(() => {
    function logHierarchy(obj, depth = 0) {
      console.log(' '.repeat(depth * 2) + obj.type + ': ' + obj.name, obj.position, obj.scale);
      if (obj.children) {
        obj.children.forEach(child => logHierarchy(child, depth + 1));
      }
    }
    if (carModel) {
      logHierarchy(carModel);
    }
  }, [carModel]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={1} />

      {/* Car Model */}
      <group ref={carRef} position={CAR_START_POSITION}>
        {carModel && (
          <primitive 
            object={carModel} 
            scale={[CAR_SCALE, CAR_SCALE, CAR_SCALE]}
            rotation={[0, 0, 0]}
            position={[2, 2, 0]} // Centered position
          />
        )}
      </group>

      {/* Debug sphere at origin */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </>
  );
}
