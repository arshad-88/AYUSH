import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshTransmissionMaterial, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ======================================================================
   DNA Double Helix
   ====================================================================== */
function DNAStrand() {
  const groupRef = useRef<THREE.Group>(null);
  const points = 36;
  const radius = 0.75;
  const height = 3.2;

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.4;
  });

  const strandA = Array.from({ length: points }).map((_, i) => {
    const t = (i / (points - 1) - 0.5) * height;
    const a = i * 0.4;
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
      <line>
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
      <line>
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
      tubes.push(
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([a1.x, a1.y, a1.z, b1.x, b1.y, b1.z]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#7C92AC" transparent opacity={0.4} />
        </line>,
      );
    }
  }

  return (
    <group ref={groupRef} rotation={[0.2, 0, 0.1]}>
      <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.5}>
        {tubes}
        {strandA.map((p, i) => (
          <mesh key={`s-${i}`} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.06, 14, 14]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#3A8DE0" : "#93C5FD"} />
          </mesh>
        ))}
        {strandB.map((p, i) => (
          <mesh key={`b-${i}`} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.06, 14, 14]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#14B8A6" : "#5EEAD4"} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

/* ======================================================================
   Molecular Cluster (drug-like structure)
   ====================================================================== */
function Molecule({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.elapsedTime * 0.5;
      ref.current.rotation.y = clock.elapsedTime * 0.7;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.4}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </Float>
  );
}

function MolecularStructure() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.18;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.15;
    }
  });

  // Central atom + 6 satellites connected by bonds
  const satellites = [
    { pos: [1.1, 0.2, 0.3] as [number, number, number], color: "#3A8DE0" },
    { pos: [-1.0, 0.4, 0.4] as [number, number, number], color: "#14B8A6" },
    { pos: [0.2, 1.1, -0.3] as [number, number, number], color: "#22C55E" },
    { pos: [0.3, -1.0, -0.4] as [number, number, number], color: "#F59E0B" },
    { pos: [0.5, 0.3, 1.1] as [number, number, number], color: "#A78BFA" },
    { pos: [-0.5, -0.3, -1.1] as [number, number, number], color: "#FCA5A5" },
  ];

  const bonds: JSX.Element[] = [];
  satellites.forEach((sat, i) => {
    const start = new THREE.Vector3(0, 0, 0);
    const end = new THREE.Vector3(...sat.pos);
    bonds.push(
      <line key={`bond-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="rgba(124,146,172,0.55)" linewidth={1} />
      </line>,
    );
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.4}>
        {/* Central atom */}
        <mesh>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial
            color="#93C5FD"
            emissive="#3A8DE0"
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Glowing core */}
        <mesh>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        {bonds}
        {satellites.map((s, i) => (
          <Molecule key={i} position={s.pos} color={s.color} />
        ))}
      </Float>
    </group>
  );
}

/* ======================================================================
   Anatomical Heart Model
   ====================================================================== */
function Heart() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      // Beating motion: scale Y in a double-tick pattern
      const t = clock.elapsedTime;
      const beat = Math.pow(Math.sin(t * 2.4), 6);
      ref.current.scale.set(1 + beat * 0.04, 1 + beat * 0.08, 1 + beat * 0.04);
      ref.current.rotation.y = t * 0.25;
    }
  });

  // Approximate heart using a sphere with a slight elongation
  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref as any}>
        <mesh>
          <sphereGeometry args={[1.0, 48, 48]} />
          <meshStandardMaterial
            color="#DC2626"
            emissive="#DC2626"
            emissiveIntensity={0.45}
            roughness={0.4}
            metalness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Wireframe overlay */}
        <mesh>
          <sphereGeometry args={[1.02, 16, 16]} />
          <meshBasicMaterial color="#FCA5A5" wireframe transparent opacity={0.35} />
        </mesh>
        {/* Highlight vessel */}
        <mesh position={[0, 0.4, 0.7]}>
          <torusGeometry args={[0.25, 0.05, 12, 32]} />
          <meshStandardMaterial color="#FCA5A5" emissive="#DC2626" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function HeartPulseParticles({ count = 12 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particles = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 1.6;
    return {
      baseX: Math.cos(angle) * radius,
      baseY: (Math.random() - 0.5) * 0.6,
      baseZ: Math.sin(angle) * radius,
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    };
  });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const offset = Math.sin(t * p.speed + p.phase);
      child.position.set(p.baseX, p.baseY + offset * 0.3, p.baseZ);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#FCA5A5" />
        </mesh>
      ))}
    </group>
  );
}

/* ======================================================================
   Cellular Process (organelle cluster)
   ====================================================================== */
function CellularProcess() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.3;
    }
  });

  const organelles = [
    { pos: [0, 0, 0], size: 0.6, color: "#3A8DE0", emissive: "#1E5FA0" },
    { pos: [0.7, 0.5, 0.3], size: 0.25, color: "#14B8A6", emissive: "#0D9488" },
    { pos: [-0.6, 0.4, -0.3], size: 0.18, color: "#A78BFA", emissive: "#7C3AED" },
    { pos: [0.5, -0.5, 0.5], size: 0.22, color: "#22C55E", emissive: "#15803D" },
    { pos: [-0.7, -0.3, 0.4], size: 0.2, color: "#F59E0B", emissive: "#B45309" },
  ];

  return (
    <group ref={groupRef}>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.3}>
        {organelles.map((org, i) => (
          <Float
            key={i}
            speed={2 + i * 0.3}
            rotationIntensity={0.5}
            floatIntensity={0.6}
          >
            <mesh position={org.pos}>
              <icosahedronGeometry args={[org.size, 1]} />
              <meshStandardMaterial
                color={org.color}
                emissive={org.emissive}
                emissiveIntensity={0.5}
                roughness={0.4}
                metalness={0.3}
                transparent
                opacity={0.85}
              />
            </mesh>
          </Float>
        ))}
      </Float>
    </group>
  );
}

/* ======================================================================
   Liquid Glass Orb (default fallback)
   ====================================================================== */
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
        <MeshDistortMaterial
          color="#3A8DE0"
          emissive="#1E5FA0"
          emissiveIntensity={0.35}
          roughness={0.2}
          metalness={0.4}
          distort={0.4}
          speed={1.2}
        />
      </mesh>
    </Float>
  );
}

interface Props {
  className?: string;
  variant?: "dna" | "molecule" | "heart" | "cellular" | "orb";
  cameraDistance?: number;
}

export function HeroCanvas({ className, variant = "dna", cameraDistance = 5 }: Props) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#07101C"]} />
        <fog attach="fog" args={["#07101C", 6, 14]} />
        <ambientLight intensity={0.45} />
        <pointLight position={[3, 2, 3]} intensity={1.4} color="#3A8DE0" />
        <pointLight position={[-3, -1, 2]} intensity={1.1} color="#14B8A6" />
        <pointLight position={[0, -3, -2]} intensity={0.9} color="#A78BFA" />
        <pointLight position={[0, 4, -1]} intensity={0.8} color="#FFFFFF" />

        {variant === "dna" && <DNAStrand />}
        {variant === "molecule" && <MolecularStructure />}
        {variant === "heart" && (
          <>
            <Heart />
            <HeartPulseParticles />
          </>
        )}
        {variant === "cellular" && <CellularProcess />}
        {variant === "orb" && <CoreOrb />}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}