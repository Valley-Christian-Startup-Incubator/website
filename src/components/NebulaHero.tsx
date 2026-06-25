import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A drifting field of flat dots on the light background — "projects in orbit".
 * Normal blending + solid colors (ink / saffron / sky) so it reads as crisp
 * dust on a light surface, not a glow. No additive blending, no gradients.
 */

const INK = new THREE.Color('#16131C');
const SAFFRON = new THREE.Color('#FF9505');
const SKY = new THREE.Color('#08B2E3');

const COUNT = 900;

/** Solid round sprite (flat disc, soft 1px edge) — not a glowing gradient. */
function makeDot() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function OrbitField({ animate }: { animate: boolean }) {
  const points = useRef<THREE.Points>(null!);
  const dot = useMemo(() => makeDot(), []);

  const { positions, colors, drift } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const drift = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Loose spherical shell with depth, biased wide and flat.
      const r = 7 + Math.pow(Math.random(), 0.6) * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r * 1.3;
      positions[i * 3 + 1] = Math.cos(phi) * r * 0.7;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r - 3;

      // Mostly ink dots, a sprinkle of saffron, fewer sky.
      const roll = Math.random();
      const c = roll > 0.86 ? SAFFRON : roll > 0.78 ? SKY : INK;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      drift[i] = 0.2 + Math.random() * 0.6;
    }
    return { positions, colors, drift };
  }, []);

  const positionsBase = useMemo(() => positions.slice(), [positions]);

  useFrame((state, delta) => {
    if (!points.current || !animate) return;
    const t = state.clock.elapsedTime;

    // Slow rotation of the whole field.
    points.current.rotation.y += delta * 0.03;
    points.current.rotation.x = Math.sin(t * 0.08) * 0.05;

    // Gentle parallax toward the pointer.
    const px = state.pointer.x * 0.6;
    const py = state.pointer.y * 0.4;
    points.current.position.x += (px - points.current.position.x) * 0.025;
    points.current.position.y += (py - points.current.position.y) * 0.025;

    // Subtle individual drift.
    const arr = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const base = positionsBase[i * 3 + 1];
      arr[i * 3 + 1] = base + Math.sin(t * drift[i] + i) * 0.18;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        sizeAttenuation
        map={dot}
        alphaTest={0.5}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

export default function NebulaHero() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Canvas
      className="!absolute inset-0"
      style={{ position: 'absolute' }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 16], fov: 60 }}
      frameloop={prefersReduced ? 'demand' : 'always'}
    >
      <OrbitField animate={!prefersReduced} />
    </Canvas>
  );
}
