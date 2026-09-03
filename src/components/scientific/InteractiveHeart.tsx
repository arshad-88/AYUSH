/**
 * InteractiveHeart — Loads a real GLB heart model from /heart-model.glb.
 * Interactive: hover over any part to see its anatomical name + description.
 * Uses @react-three/fiber + drei's useGLTF.
 */

import { useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* ─── Anatomy Tooltip Map ────────────────────────────────────────────── */

interface AnatomyInfo {
  name: string;
  description: string;
  color: string;
}

const ANATOMY_MAP: Record<string, AnatomyInfo> = {
  // Generic spatial heuristics — real meshes may use different node names.
  // We also provide fallbacks keyed by common anatomical node names.
  left_atrium: { name: "Left Atrium", description: "Receives oxygenated blood from the lungs", color: "#FF6B6B" },
  right_atrium: { name: "Right Atrium", description: "Receives deoxygenated blood from the body", color: "#FF6B6B" },
  left_ventricle: { name: "Left Ventricle", description: "Pumps oxygenated blood to the body — the strongest chamber", color: "#FF4444" },
  right_ventricle: { name: "Right Ventricle", description: "Pumps deoxygenated blood to the lungs", color: "#FF4444" },
  aorta: { name: "Aorta", description: "The body's largest artery — carries blood from the left ventricle", color: "#FF8A8A" },
  pulmonary_artery: { name: "Pulmonary Artery", description: "Carries deoxygenated blood to the lungs", color: "#93C5FD" },
  pulmonary_vein: { name: "Pulmonary Vein", description: "Carries oxygenated blood from the lungs to the heart", color: "#FCA5A5" },
  superior_vena_cava: { name: "Superior Vena Cava", description: "Returns blood from the upper body to the right atrium", color: "#93C5FD" },
  inferior_vena_cava: { name: "Inferior Vena Cava", description: "Returns blood from the lower body to the right atrium", color: "#93C5FD" },
  mitral_valve: { name: "Mitral Valve", description: "Controls blood flow from the left atrium to the left ventricle", color: "#FBBF24" },
  tricuspid_valve: { name: "Tricuspid Valve", description: "Controls blood flow from the right atrium to the right ventricle", color: "#FBBF24" },
  aortic_valve: { name: "Aortic Valve", description: "Prevents backflow from the aorta into the left ventricle", color: "#FBBF24" },
  pulmonary_valve: { name: "Pulmonary Valve", description: "Prevents backflow from the pulmonary artery", color: "#FBBF24" },
  septum: { name: "Interventricular Septum", description: "Wall separating the left and right ventricles", color: "#E5E7EB" },
  // Fallbacks for mesh names that might not match exactly
  heart: { name: "Human Heart", description: "A muscular organ that pumps blood through the circulatory system", color: "#EF4444" },
  mesh: { name: "Heart Tissue", description: "Cardiac muscle tissue (myocardium)", color: "#DC2626" },
};

function lookupAnatomy(meshName: string): AnatomyInfo | null {
  const lower = meshName.toLowerCase().replace(/[\s\-]/g, "_");
  // Exact match
  if (ANATOMY_MAP[lower]) return ANATOMY_MAP[lower];
  // Partial match
  for (const [key, info] of Object.entries(ANATOMY_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return info;
  }
  return null;
}

/* ─── GLB Heart Mesh ────────────────────────────────────────────────── */

function HeartModel() {
  const { scene } = useGLTF("/heart-model.glb");
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{ info: AnatomyInfo; position: [number, number, number] } | null>(null);
  const [hoveredMesh, setHoveredMesh] = useState<THREE.Mesh | null>(null);
  const originalMaterials = useRef(new Map<THREE.Mesh, THREE.Material | THREE.Material[]>());

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    // Realistic heartbeat: double-beat pattern (lub-dub) at ~72 BPM (1.2s cycle)
    const cycle = t % 1.2;
    const lub = Math.exp(-(((cycle - 0.1) * 8) ** 2));
    const dub = Math.exp(-(((cycle - 0.35) * 10) ** 2)) * 0.7;
    const beat = lub + dub;
    groupRef.current.scale.setScalar(1 + beat * 0.06);
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1 + 0.25;
  });

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation?.();
    const mesh = (e.object ?? e.target) as THREE.Mesh;
    if (!mesh?.isMesh) return;

    const name = mesh.name || mesh.parent?.name || "";
    const info = lookupAnatomy(name);

    // Highlight the mesh
    if (!originalMaterials.current.has(mesh)) {
      originalMaterials.current.set(mesh, mesh.material);
    }
    const prevMat = mesh.material as THREE.MeshStandardMaterial;
    const glowMat = new THREE.MeshStandardMaterial({
      color: info?.color ?? "#EF4444",
      emissive: info?.color ?? "#EF4444",
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.15,
      transparent: prevMat.transparent ?? true,
      opacity: 0.92,
    });
    mesh.material = glowMat;
    setHoveredMesh(mesh);

    if (info) {
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      setHoveredInfo({ info, position: [center.x, center.y + 0.15, center.z] });
    }

    document.body.style.cursor = "pointer";
  }, []);

  const handlePointerOut = useCallback(() => {
    setHoveredMesh((prev) => {
      if (prev && originalMaterials.current.has(prev)) {
        prev.material = originalMaterials.current.get(prev)!;
      }
      return null;
    });
    setHoveredInfo(null);
    document.body.style.cursor = "auto";
  }, []);

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handlePointerOver}
      />

      {/* Tooltip */}
      {hoveredInfo && (
        <Html
          position={hoveredInfo.position}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            className="px-3 py-2 rounded-lg text-center whitespace-nowrap"
            style={{
              background: "rgba(15, 27, 46, 0.94)",
              border: `1px solid ${hoveredInfo.info.color}60`,
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 20px ${hoveredInfo.info.color}30, 0 8px 24px rgba(0,0,0,0.5)`,
            }}
          >
            <div
              className="text-[10px] font-bold tracking-wider"
              style={{ color: hoveredInfo.info.color, fontFamily: "JetBrains Mono, monospace" }}
            >
              {hoveredInfo.info.name.toUpperCase()}
            </div>
            <div
              className="text-[9px] mt-0.5 max-w-[200px] leading-tight"
              style={{ color: "#B0BAC9", fontFamily: "Inter, sans-serif" }}
            >
              {hoveredInfo.info.description}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Ambient Particles ─────────────────────────────────────────────── */

function PulseParticles({ count = 14 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particles = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const r = 2.2;
    return {
      baseX: Math.cos(angle) * r,
      baseY: (Math.random() - 0.5) * 1.5,
      baseZ: Math.sin(angle) * r,
      speed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
    };
  });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const offset = Math.sin(t * p.speed + p.phase);
      child.position.set(p.baseX, p.baseY + offset * 0.2, p.baseZ);
      (child as THREE.Mesh).scale.setScalar(0.5 + offset * 0.3);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#FCA5A5" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Scene ──────────────────────────────────────────────────────────── */

function HeartScene() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.8} color="#FFF5F0" />
      <directionalLight position={[-3, 3, -3]} intensity={0.9} color="#3A8DE0" />
      <pointLight position={[0, 0, 4]} intensity={1.0} color="#FCA5A5" />
      <pointLight position={[0, 2, 2]} intensity={0.7} color="#FFAAAA" />
      <spotLight position={[0, 5, 2]} intensity={0.7} angle={0.6} color="#EF4444" />

      <Float speed={0.8} rotationIntensity={0.04} floatIntensity={0.12}>
        <group scale={[1.875, 1.875, 1.875]}>
          <HeartModel />
        </group>
        <PulseParticles count={12} />
      </Float>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={(4 * Math.PI) / 5}
      />
    </>
  );
}

/* ─── Loading Fallback ───────────────────────────────────────────────── */

function HeartFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 24, 24]} />
      <meshStandardMaterial color="#DC2626" emissive="#DC2626" emissiveIntensity={0.3} wireframe />
    </mesh>
  );
}

/* ─── Exported Component ─────────────────────────────────────────────── */

interface InteractiveHeartProps {
  className?: string;
  size?: number;
}

export function InteractiveHeart({ className, size = 520 }: InteractiveHeartProps) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: "100%", height: "100%", minHeight: size }}
    >
      {/* Bright atmospheric backdrop — warm red glow, no dark shadow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(239,68,68,0.35) 0%, rgba(252,165,165,0.20) 40%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 38 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={<HeartFallback />}>
          <HeartScene />
        </Suspense>
      </Canvas>

      {/* Bottom info badge */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div
          className="px-4 py-3 flex items-center gap-3 rounded-xl"
          style={{
            background: "rgba(15, 27, 46, 0.88)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-critical opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-critical" />
          </span>
          <div>
            <div
              className="text-[9px] tracking-widest"
              style={{ color: "#7C92AC", fontFamily: "JetBrains Mono, monospace" }}
            >
              INTERACTIVE · CLICK TO EXPLORE
            </div>
            <div
              className="text-xl font-bold leading-none mt-1"
              style={{ color: "#FCA5A5", fontFamily: "JetBrains Mono, monospace" }}
            >
              72{" "}
              <span className="text-[10px]" style={{ color: "#7C92AC" }}>
                BPM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interaction hint */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div
          className="px-3 py-1.5 rounded-lg flex items-center gap-2"
          style={{
            background: "rgba(15, 27, 46, 0.8)",
            border: "1px solid rgba(58, 141, 224, 0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span className="text-[9px] tracking-widest" style={{ color: "#7C92AC", fontFamily: "JetBrains Mono, monospace" }}>
            HOVER PARTS TO IDENTIFY
          </span>
        </div>
      </div>
    </div>
  );
}
