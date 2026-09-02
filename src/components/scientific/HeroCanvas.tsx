import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function DNAStrand() {
  const groupRef = useRef<THREE.Group>(null);
  const points = 28;
  const radius = 0.7;
  const height = 2.6;

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.35;
    }
  });

  const strandA = Array.from({ length: points }).map((_, i) => {
    const t = (i / (points - 1) - 0.5) * height;
    const a = i * 0.45;
    return new THREE.Vector3(Math.cos(a) * radius, t, Math.sin(a) * radius);
  });
  const strandB = strandA.map((p) => {
    const v = p.clone();
    v.x = -v.x;
    v.z = -v.z;
    return v;
  });

  const tubes: JSX.Element[] = [];
  for (let i = 0; i < points - 1; i++) {
    const a1 = strandA[i];
    const a2 = strandA[i + 1];
    const b1 = strandB[i];
    const b2 = strandB[i + 1];

    tubes.push(
      <line key={`pa-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([a1.x, a1.y, a1.z, a2.x, a2.y, a2.z]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3A8DE0" linewidth={1.5} />
      </line>,
    );
    tubes.push(
      <line key={`pb-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([b1.x, b1.y, b1.z, b2.x, b2.y, b2.z]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#14B8A6" linewidth={1.5} />
      </line>,
    );

    if (i % 3 === 0) {
      const mid = a1.clone().lerp(b1, 0.5);
      tubes.push(
        <line key={`r-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([a1.x, a1.y, a1.z, b1.x, b1.y, b1.z]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#7C92AC" transparent opacity={0.5} />
        </line>,
      );
    }
  }

  return (
    <group ref={groupRef} rotation={[0.2, 0, 0.1]}>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        {tubes}
        {strandA.map((p, i) => (
          <mesh key={`s-${i}`} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#3A8DE0" : "#93C5FD"} />
          </mesh>
        ))}
        {strandB.map((p, i) => (
          <mesh key={`b-${i}`} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#14B8A6" : "#5EEAD4"} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

function CoreOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = clock.elapsedTime * 0.3;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.06}
          anisotropy={0.5}
          distortion={0.3}
          distortionScale={0.4}
          temporalDistortion={0.1}
          color="#3A8DE0"
          attenuationColor="#14B8A6"
        />
      </mesh>
    </Float>
  );
}

interface Props {
  className?: string;
  variant?: "dna" | "orb";
}

export function HeroCanvas({ className, variant = "dna" }: Props) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 2, 3]} intensity={1.2} color="#3A8DE0" />
        <pointLight position={[-3, -1, 2]} intensity={1.0} color="#14B8A6" />
        <pointLight position={[0, -3, -2]} intensity={0.8} color="#A78BFA" />
        {variant === "dna" ? <DNAStrand /> : <CoreOrb />}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}