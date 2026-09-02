import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshTransmissionMaterial } from "@react-three/drei";
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
      <line key={`sa-${i}`}>
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
      <line key={`sb-${i}`}>
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
        <line key={`sc-${i}`}>
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
   Anatomical Heart Model (3D low-poly + glow shell)
   ====================================================================== */
function Heart() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime;
      const beat = Math.pow(Math.sin(t * 2.4), 6);
      ref.current.scale.set(1 + beat * 0.04, 1 + beat * 0.08, 1 + beat * 0.04);
      ref.current.rotation.y = t * 0.25;
    }
  });

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
        <mesh>
          <sphereGeometry args={[1.02, 16, 16]} />
          <meshBasicMaterial color="#FCA5A5" wireframe transparent opacity={0.35} />
        </mesh>
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
   Protein Fold — helical ribbon of spheres
   ====================================================================== */
function ProteinFold() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 80;
  const radius = 1.1;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.32;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.12;
    }
  });

  const points = Array.from({ length: count }).map((_, i) => {
    const t = (i / (count - 1) - 0.5) * 4.5;
    const angle = i * 0.22 + Math.sin(i * 0.05) * 0.6;
    const wobble = Math.sin(i * 0.18) * 0.18;
    return new THREE.Vector3(
      Math.cos(angle) * (radius + wobble),
      t,
      Math.sin(angle) * (radius + wobble),
    );
  });

  const tubeSegments: JSX.Element[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    tubeSegments.push(
      <line key={`proto-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={i % 4 === 0 ? "#3A8DE0" : "#14B8A6"}
          transparent
          opacity={0.8}
          linewidth={2}
        />
      </line>,
    );
  }

  const palette = ["#3A8DE0", "#14B8A6", "#22C55E", "#A78BFA", "#F59E0B"];
  const spheres = points.map((p, i) => {
    const color = palette[i % palette.length];
    return (
      <Float key={`prot-s-${i}`} speed={2 + (i % 3) * 0.4} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh position={p}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
      </Float>
    );
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        {tubeSegments}
        {spheres}
      </Float>
    </group>
  );
}

/* ======================================================================
   Neural Pathway — branching synaptic tree
   ====================================================================== */
function NeuralPathway() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.22;
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.08;
    }
  });

  type Branch = { points: THREE.Vector3[]; depth: number; color: string };
  const branches: Branch[] = [];
  const colors = ["#3A8DE0", "#14B8A6", "#A78BFA"];

  const grow = (start: THREE.Vector3, dir: THREE.Vector3, depth: number, color: string) => {
    const steps = 8;
    const points: THREE.Vector3[] = [start.clone()];
    let current = start.clone();
    let currentDir = dir.clone();
    for (let i = 0; i < steps; i++) {
      currentDir.x += (Math.random() - 0.5) * 0.15;
      currentDir.y += (Math.random() - 0.5) * 0.15;
      currentDir.z += (Math.random() - 0.5) * 0.15;
      currentDir.normalize().multiplyScalar(0.32);
      current = current.clone().add(currentDir);
      points.push(current.clone());
    }
    branches.push({ points, depth, color });
    if (depth > 0) {
      const mid = points[Math.floor(points.length / 2)];
      const forkDir = currentDir.clone();
      forkDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.9);
      const forkDir2 = currentDir.clone();
      forkDir2.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.9);
      grow(mid, forkDir, depth - 1, colors[depth % colors.length]);
      grow(mid, forkDir2, depth - 1, colors[(depth + 1) % colors.length]);
    }
  };

  grow(new THREE.Vector3(0, -1.4, 0), new THREE.Vector3(0, 1, 0), 2, colors[0]);

  const lines: JSX.Element[] = [];
  branches.forEach((branch, i) => {
    for (let j = 0; j < branch.points.length - 1; j++) {
      const a = branch.points[j];
      const b = branch.points[j + 1];
      lines.push(
        <line key={`np-${i}-${j}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={branch.color} transparent opacity={0.85 - branch.depth * 0.18} />
        </line>,
      );
    }
  });

  const nodes: JSX.Element[] = [];
  branches.forEach((branch, i) => {
    branch.points.forEach((p, j) => {
      if (j === 0 || j === branch.points.length - 1) {
        nodes.push(
          <Float key={`npn-${i}-${j}`} speed={1.6} rotationIntensity={0.6} floatIntensity={0.6}>
            <mesh position={p}>
              <sphereGeometry args={[0.08, 14, 14]} />
              <meshStandardMaterial
                color={branch.color}
                emissive={branch.color}
                emissiveIntensity={0.6}
                roughness={0.3}
                metalness={0.3}
              />
            </mesh>
          </Float>,
        );
      }
    });
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.4}>
        {lines}
        {nodes}
        {/* Central soma */}
        <mesh>
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial
            color="#93C5FD"
            emissive="#3A8DE0"
            emissiveIntensity={0.55}
            roughness={0.25}
            metalness={0.4}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </Float>
    </group>
  );
}

/* ======================================================================
   Drug-Target Binding — two molecules docking with energy field
   ====================================================================== */
function DrugTarget() {
  const drugRef = useRef<THREE.Group>(null);
  const energyRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (drugRef.current) {
      const t = clock.elapsedTime;
      drugRef.current.position.x = Math.sin(t * 0.8) * 0.5 + 1.4;
      drugRef.current.rotation.y = t * 0.6;
      drugRef.current.rotation.x = t * 0.4;
    }
    if (energyRef.current) {
      const t = clock.elapsedTime;
      const scale = 1 + Math.sin(t * 2.5) * 0.15;
      energyRef.current.scale.set(scale, scale, scale);
      energyRef.current.material.opacity = 0.25 + Math.sin(t * 2.5) * 0.1;
    }
  });

  const drugShape = (
    <group ref={drugRef}>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial
            color="#14B8A6"
            emissive="#14B8A6"
            emissiveIntensity={0.5}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.28, 0.18, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#5EEAD4" emissive="#14B8A6" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-0.22, -0.18, 0.1]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#5EEAD4" emissive="#14B8A6" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.32, -0.12]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#5EEAD4" emissive="#14B8A6" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );

  return (
    <group>
      {/* Target protein (left, larger, clefted) */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <group position={[-1.2, 0, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.95, 2]} />
            <meshStandardMaterial
              color="#3A8DE0"
              emissive="#1E5FA0"
              emissiveIntensity={0.4}
              roughness={0.45}
              metalness={0.4}
              transparent
              opacity={0.92}
            />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.0, 2]} />
            <meshBasicMaterial color="#93C5FD" wireframe transparent opacity={0.25} />
          </mesh>
          {/* Binding pocket highlight */}
          <mesh position={[0.6, 0.1, 0]}>
            <sphereGeometry args={[0.22, 18, 18]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#3A8DE0"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      </Float>

      {/* Drug (right, oscillating in) */}
      {drugShape}

      {/* Energy field at midpoint */}
      <mesh ref={energyRef} position={[0, 0, 0]}>
        <torusGeometry args={[0.5, 0.04, 12, 64]} />
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.02, 12, 64]} />
        <meshBasicMaterial color="#14B8A6" transparent opacity={0.3} />
      </mesh>
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

/* ======================================================================
   Plasma Cell — refractive transmission orb
   ====================================================================== */
function PlasmaCell() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 0.18;
      meshRef.current.rotation.y = clock.elapsedTime * 0.26;
    }
  });
  return (
    <Float speed={1.3} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.1, 4]} />
        <MeshTransmissionMaterial
          color="#14B8A6"
          thickness={0.6}
          roughness={0.15}
          transmission={0.9}
          ior={1.4}
          chromaticAberration={0.06}
          backside
          anisotropy={0.3}
        />
      </mesh>
    </Float>
  );
}

interface Props {
  className?: string;
  variant?:
    | "dna"
    | "molecule"
    | "heart"
    | "cellular"
    | "orb"
    | "protein"
    | "neural"
    | "drugtarget"
    | "plasma";
  cameraDistance?: number;
  interactive?: boolean;
}

export function HeroCanvas({
  className,
  variant = "dna",
  cameraDistance = 5,
  interactive = true,
}: Props) {
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
        {variant === "protein" && <ProteinFold />}
        {variant === "neural" && <NeuralPathway />}
        {variant === "drugtarget" && <DrugTarget />}
        {variant === "plasma" && <PlasmaCell />}
        {variant === "orb" && <CoreOrb />}
      </Canvas>
    </div>
  );
}