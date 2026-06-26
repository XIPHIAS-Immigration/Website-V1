"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Html, Line, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

import { globeLandDots } from "@/data/globe-land-dots";
import { arcCurve, latLngToVector3 } from "./geo";
import type { GlobeArc, GlobeMarker, GlobeTheme } from "./types";

const R = 2; // globe radius (world units)
const ONE = new THREE.Vector3(1, 1, 1);

type Palette = {
  bg: string;
  base: string;
  wire: string;
  wireOpacity: number;
  dots: string;
  dotOpacity: number;
  marker: string;
  arc: string;
  atmo: string;
  atmoOpacity: number;
  bloom: number;
  ambient: number;
  dir: number;
};

function getPalette(theme: GlobeTheme): Palette {
  if (theme === "light") {
    return {
      bg: "#0f2150",
      base: "#1a356f",
      wire: "#6e9ae0",
      wireOpacity: 0.22,
      dots: "#9bbcf0",
      dotOpacity: 0.85,
      marker: "#ffcf3a",
      arc: "#ffd863",
      atmo: "#6f9fe6",
      atmoOpacity: 0.16,
      bloom: 0.5,
      ambient: 1.1,
      dir: 1.5,
    };
  }
  return {
    bg: "#05080f",
    base: "#0c1d3f",
    wire: "#2c548f",
    wireOpacity: 0.18,
    dots: "#4f7ec9",
    dotOpacity: 0.72,
    marker: "#f3c945",
    arc: "#ffd24a",
    atmo: "#2f6fd0",
    atmoOpacity: 0.22,
    bloom: 0.85,
    ambient: 0.65,
    dir: 1.25,
  };
}

function LandDots({ palette }: { palette: Palette }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(globeLandDots.length * 3);
    globeLandDots.forEach(([lat, lng], i) => {
      const v = latLngToVector3(lat, lng, R * 1.004);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.02}
        sizeAttenuation
        color={palette.dots}
        transparent
        opacity={palette.dotOpacity}
        depthWrite={false}
      />
    </points>
  );
}

function Marker({
  marker,
  palette,
  selected,
  hovered,
  interactive,
  onSelect,
  onHover,
}: {
  marker: GlobeMarker;
  palette: Palette;
  selected: boolean;
  hovered: boolean;
  interactive: boolean;
  onSelect: (code: string) => void;
  onHover: (code: string | null) => void;
}) {
  const position = useMemo(
    () => latLngToVector3(marker.lat, marker.lng, R * 1.012),
    [marker.lat, marker.lng],
  );
  const color = marker.color ?? palette.marker;
  const size = 0.02 * (0.85 + (marker.weight ?? 0.5) * 0.6);
  const active = selected || hovered;

  return (
    <group position={position}>
      {interactive && (
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(marker.code);
            if (typeof document !== "undefined") document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
            if (typeof document !== "undefined") document.body.style.cursor = "";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(marker.code);
          }}
        >
          <sphereGeometry args={[0.085, 10, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      <mesh scale={active ? 1.9 : 1}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 2.6 : 1.3}
          toneMapped={false}
        />
      </mesh>

      {active && (
        <Billboard>
          <mesh>
            <ringGeometry args={[size * 2.4, size * 3, 40]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </Billboard>
      )}

      {hovered && (
        <Html center position={[0, size * 5, 0]} distanceFactor={9} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-full border border-white/20 bg-[#04070f]/85 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm">
            {marker.label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Arc({ arc, palette, seed }: { arc: GlobeArc; palette: Palette; seed: number }) {
  const curve = useMemo(() => arcCurve(arc.from, arc.to, R * 1.01), [arc.from, arc.to]);
  const points = useMemo(() => curve.getPoints(64), [curve]);
  const dotRef = useRef<THREE.Mesh>(null);
  const color = arc.color ?? palette.arc;

  useFrame(({ clock }) => {
    if (!dotRef.current) return;
    const t = (clock.getElapsedTime() * 0.16 + seed) % 1;
    curve.getPointAt(t, dotRef.current.position);
    const mat = dotRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.25 + 0.75 * Math.sin(t * Math.PI);
  });

  return (
    <group>
      <Line points={points} color={color} lineWidth={1} transparent opacity={0.22} />
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Scene({
  palette,
  markers,
  arcs,
  selectedCode,
  hoveredCode,
  autoRotate,
  interactive,
  enableZoom,
  focusCode,
  onSelect,
  onHover,
}: {
  palette: Palette;
  markers: GlobeMarker[];
  arcs: GlobeArc[];
  selectedCode: string | null;
  hoveredCode: string | null;
  autoRotate: boolean;
  interactive: boolean;
  enableZoom: boolean;
  focusCode: string | null;
  onSelect: (code: string) => void;
  onHover: (code: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const markerByCode = useMemo(() => new Map(markers.map((m) => [m.code, m])), [markers]);
  const focusRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!focusCode) {
      focusRef.current = null;
      return;
    }
    const m = markerByCode.get(focusCode);
    if (!m) return;
    focusRef.current = {
      x: THREE.MathUtils.degToRad(m.lat),
      y: THREE.MathUtils.degToRad(90 - (m.lng + 180)),
    };
  }, [focusCode, markerByCode]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.scale.lerp(ONE, Math.min(1, delta * 3));
    if (interactive) return;

    if (focusRef.current) {
      let dy = focusRef.current.y - g.rotation.y;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy)); // shortest path
      g.rotation.y += dy * Math.min(1, delta * 2);
      g.rotation.x += (focusRef.current.x - g.rotation.x) * Math.min(1, delta * 2);
    } else {
      g.rotation.y += delta * 0.05;
    }
  });

  return (
    <>
      <color attach="background" args={[palette.bg]} />
      <ambientLight intensity={palette.ambient} />
      <directionalLight position={[5, 3, 5]} intensity={palette.dir} color="#dfe9ff" />
      <pointLight position={[-6, -2, -4]} intensity={0.5} color={palette.atmo} />

      <group ref={groupRef} scale={0.82}>
        <mesh>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial color={palette.base} metalness={0.45} roughness={0.6} />
        </mesh>

        <mesh>
          <sphereGeometry args={[R * 1.002, 40, 26]} />
          <meshBasicMaterial color={palette.wire} wireframe transparent opacity={palette.wireOpacity} />
        </mesh>

        <mesh scale={1.18}>
          <sphereGeometry args={[R, 48, 48]} />
          <meshBasicMaterial
            color={palette.atmo}
            transparent
            opacity={palette.atmoOpacity}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <LandDots palette={palette} />

        {arcs.map((arc, i) => (
          <Arc key={`arc-${i}`} arc={arc} palette={palette} seed={(i % 7) / 7} />
        ))}

        {markers.map((marker) => (
          <Marker
            key={marker.code}
            marker={marker}
            palette={palette}
            selected={marker.code === selectedCode}
            hovered={marker.code === hoveredCode}
            interactive={interactive}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </group>

      {interactive && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={enableZoom}
          enableDamping
          dampingFactor={0.14}
          minDistance={3.0}
          maxDistance={6}
          zoomSpeed={0.5}
          autoRotate={autoRotate && !hoveredCode}
          autoRotateSpeed={0.3}
          rotateSpeed={0.32}
        />
      )}

      <EffectComposer>
        <Bloom intensity={palette.bloom} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export type XiphiasGlobeProps = {
  theme: GlobeTheme;
  markers: GlobeMarker[];
  arcs?: GlobeArc[];
  selectedCode?: string | null;
  hoveredCode?: string | null;
  autoRotate?: boolean;
  /** When false: no OrbitControls; the globe gently rotates / focuses instead. */
  interactive?: boolean;
  /** Allow scroll-wheel/pinch zoom (only when interactive). */
  enableZoom?: boolean;
  /** ISO-2 code the globe should rotate to face (only when not interactive). */
  focusCode?: string | null;
  /** Camera distance — smaller = larger globe. */
  cameraZ?: number;
  onSelect?: (code: string) => void;
  onHover?: (code: string | null) => void;
  className?: string;
  ariaLabel?: string;
};

export default function XiphiasGlobe({
  theme,
  markers,
  arcs = [],
  selectedCode = null,
  hoveredCode = null,
  autoRotate = true,
  interactive = true,
  enableZoom = true,
  focusCode = null,
  cameraZ = 4.3,
  onSelect,
  onHover,
  className,
  ariaLabel = "Interactive globe of destinations",
}: XiphiasGlobeProps) {
  const palette = useMemo(() => getPalette(theme), [theme]);

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <Canvas
        dpr={[1, 1.8]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.25, cameraZ], fov: 38 }}
      >
        <Scene
          palette={palette}
          markers={markers}
          arcs={arcs}
          selectedCode={selectedCode}
          hoveredCode={hoveredCode}
          autoRotate={autoRotate}
          interactive={interactive}
          enableZoom={enableZoom}
          focusCode={focusCode}
          onSelect={onSelect ?? (() => {})}
          onHover={onHover ?? (() => {})}
        />
      </Canvas>
    </div>
  );
}
