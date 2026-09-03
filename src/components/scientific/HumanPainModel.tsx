/**
 * HumanPainModel — Loads a real 3D human GLB model from /human-model.glb.
 * Overlays pain hotspot markers based on clinical assessment data.
 *
 * Pain mapping:
 *  - Keyword-matches clinical state fields (site, chiefComplaint, symptoms, radiation)
 *    to anatomical regions on the model
 *  - Severity 0-3 → blue markers, 4-6 → amber, 7-10 → red
 *  - Pulsing 3D markers with labels at pain locations
 */

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";
import type { ClinicalState } from "@/types";

/* ─── Pain Region Definitions ──────────────────────────────────────── */

interface PainRegion {
  id: string;
  name: string;
  position: [number, number, number];
  keywords: string[];
}

const PAIN_REGIONS: PainRegion[] = [
  { id: "head", name: "Head", position: [0, 1.7, 0], keywords: ["head", "forehead", "temple", "skull", "migraine", "headache"] },
  { id: "neck", name: "Neck", position: [0, 1.42, 0], keywords: ["neck", "throat", "cervical"] },
  { id: "chest", name: "Chest", position: [0, 0.9, 0.15], keywords: ["chest", "breast", "sternum", "seena", "cardiac", "heart"] },
  { id: "left-shoulder", name: "Left Shoulder", position: [-0.5, 1.2, 0], keywords: ["left shoulder", "left arm", "left upper"] },
  { id: "right-shoulder", name: "Right Shoulder", position: [0.5, 1.2, 0], keywords: ["right shoulder", "right arm", "right upper"] },
  { id: "abdomen", name: "Abdomen", position: [0, 0.42, 0.12], keywords: ["abdomen", "stomach", "belly", "gut", "pet", "navel", "abdominal"] },
  { id: "left-arm", name: "Left Arm", position: [-0.75, 0.7, 0], keywords: ["left hand", "left wrist", "left finger"] },
  { id: "right-arm", name: "Right Arm", position: [0.75, 0.7, 0], keywords: ["right hand", "right wrist", "right finger"] },
  { id: "lower-back", name: "Lower Back", position: [0, 0.45, -0.2], keywords: ["lower back", "lumbar", "back pain", "peeth", "waist"] },
  { id: "upper-back", name: "Upper Back", position: [0, 0.95, -0.18], keywords: ["upper back", "between shoulder blades"] },
  { id: "left-knee", name: "Left Knee", position: [-0.2, -0.5, 0.1], keywords: ["left knee", "left leg"] },
  { id: "right-knee", name: "Right Knee", position: [0.2, -0.5, 0.1], keywords: ["right knee", "right leg"] },
  { id: "pelvis", name: "Pelvis", position: [0, 0.08, 0.05], keywords: ["pelvis", "hip", "groin", "lower abdomen"] },
];

/* ─── Pain Detection ────────────────────────────────────────────────── */

interface DetectedPain {
  regionId: string;
  severity: number;
  label: string;
}

function detectPainRegions(state: ClinicalState): DetectedPain[] {
  const results: DetectedPain[] = [];
  const severity = state.severity ?? 0;

  const searchText = [
    state.site ?? "",
    state.chiefComplaint ?? "",
    state.character ?? "",
    state.radiation ?? "",
    ...(state.associatedSymptoms ?? []),
  ]
    .join(" ")
    .toLowerCase();

  for (const region of PAIN_REGIONS) {
    const matchCount = region.keywords.filter((kw) => searchText.includes(kw)).length;
    if (matchCount > 0) {
      const regionSeverity = Math.min(10, severity + (matchCount > 2 ? 1 : 0));
      results.push({ regionId: region.id, severity: regionSeverity, label: region.name });
    }
  }

  // Fallback: generic body pain if severity > 0 but no region matched
  if (results.length === 0 && severity > 0 && searchText.length > 3) {
    const bodyParts = ["arm", "leg", "back", "joint", "bone", "muscle", "body", "whole", "everywhere"];
    for (const part of bodyParts) {
      if (searchText.includes(part)) {
        results.push({ regionId: "chest", severity, label: "General pain" });
        break;
      }
    }
  }

  return results;
}

/* ─── Human GLB Mesh ────────────────────────────────────────────────── */

function HumanModel({ activeRegions }: { activeRegions: Map<string, number> }) {
  const { scene } = useGLTF("/human-model.glb");
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.06 + 0.2;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

/* ─── Pain Marker (pulsing dot + label) ─────────────────────────────── */

function PainMarker({
  position,
  severity,
  label,
}: {
  position: [number, number, number];
  severity: number;
  label: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const color = severity >= 7 ? "#EF4444" : severity >= 4 ? "#F59E0B" : "#3A8DE0";

  useFrame(({ clock }) => {
    if (!meshRef.current || !ringRef.current || !glowRef.current) return;
    const t = clock.elapsedTime;
    const pulse = Math.sin(t * 3.5) * 0.5 + 0.5;

    meshRef.current.scale.setScalar(1 + pulse * 0.25);
    ringRef.current.scale.setScalar(1 + pulse * 0.6);
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.45 - pulse * 0.4;
    glowRef.current.scale.setScalar(1.2 + pulse * 0.4);
    (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 - pulse * 0.12;
  });

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>

      {/* Core dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.05, 14, 14]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.07, 0.1, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Label */}
      <Html center distanceFactor={7} style={{ pointerEvents: "none" }}>
        <div
          className="px-2.5 py-1.5 rounded-lg whitespace-nowrap"
          style={{
            background: "rgba(10, 20, 34, 0.94)",
            border: `1px solid ${color}50`,
            backdropFilter: "blur(10px)",
            boxShadow: `0 0 14px ${color}25`,
          }}
        >
          <div
            className="text-[9px] font-bold tracking-wider"
            style={{ color, fontFamily: "JetBrains Mono, monospace" }}
          >
            {label.toUpperCase()}
          </div>
          <div
            className="text-[8px] mt-0.5"
            style={{ color: "#8896A8", fontFamily: "JetBrains Mono, monospace" }}
          >
            SEVERITY {severity}/10 · {severity >= 7 ? "SEVERE" : severity >= 4 ? "MODERATE" : "MILD"}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ─── Scene ──────────────────────────────────────────────────────────── */

function PainScene({ clinicalState }: { clinicalState: ClinicalState }) {
  const detectedPains = useMemo(() => detectPainRegions(clinicalState), [clinicalState]);
  const regionPositions = useMemo(() => {
    const m = new Map<string, [number, number, number]>();
    PAIN_REGIONS.forEach((r) => m.set(r.id, r.position));
    return m;
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={0.75} color="#E6EEF8" />
      <directionalLight position={[-2, 2, -3]} intensity={0.25} color="#3A8DE0" />
      <pointLight position={[0, 1, 3]} intensity={0.25} color="#14B8A6" />

      <Float speed={0.7} rotationIntensity={0.02} floatIntensity={0.08}>
        <HumanModel activeRegions={new Map(detectedPains.map((p) => [p.regionId, p.severity]))} />

        {detectedPains.map((pain) => {
          const pos = regionPositions.get(pain.regionId) ?? [0, 0, 0];
          return <PainMarker key={pain.regionId} position={pos} severity={pain.severity} label={pain.label} />;
        })}
      </Float>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.25}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={(4 * Math.PI) / 5}
      />
    </>
  );
}

/* ─── Loading Fallback ───────────────────────────────────────────────── */

function HumanFallback() {
  return (
    <mesh>
      <capsuleGeometry args={[0.2, 1.2, 8, 16]} />
      <meshStandardMaterial color="#1E3554" wireframe transparent opacity={0.4} />
    </mesh>
  );
}

/* ─── Exported Component ─────────────────────────────────────────────── */

interface HumanPainModelProps {
  clinicalState: ClinicalState;
  className?: string;
}

export function HumanPainModel({ clinicalState, className }: HumanPainModelProps) {
  return (
    <div className={`relative ${className ?? ""}`} style={{ width: "100%", minHeight: 400 }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0.06) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0.4, 5], fov: 36 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={<HumanFallback />}>
          <PainScene clinicalState={clinicalState} />
        </Suspense>
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none">
        <div
          className="px-3 py-2 rounded-lg space-y-1"
          style={{
            background: "rgba(10, 20, 34, 0.88)",
            border: "1px solid rgba(58, 141, 224, 0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="text-[8px] tracking-wider mb-1.5" style={{ color: "#7C92AC", fontFamily: "JetBrains Mono, monospace" }}>
            PAIN SEVERITY
          </div>
          {[
            { color: "#EF4444", label: "Severe (7-10)" },
            { color: "#F59E0B", label: "Moderate (4-6)" },
            { color: "#3A8DE0", label: "Mild (0-3)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}80` }} />
              <span className="text-[8px]" style={{ color: "#8896A8", fontFamily: "JetBrains Mono, monospace" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
