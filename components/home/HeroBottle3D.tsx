"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

interface HeroBottle3DProps {
  productName?: string;
  brand?: string | null;
  vintage?: string | null;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  paused: boolean;
  reducedMotion: boolean;
}

const BOTTLE_POINTS: [number, number][] = [
  [0, 0],
  [0.58, 0],
  [0.6, 0.04],
  [0.62, 0.08],
  [0.62, 0.1],
  [0.62, 1.45],
  [0.6, 1.65],
  [0.4, 1.88],
  [0.36, 2.05],
  [0.36, 2.55],
  [0.38, 2.6],
  [0.38, 2.72],
  [0.34, 2.78],
  [0.34, 2.95],
  [0.36, 3.0],
  [0.22, 3.05],
  [0.2, 3.08],
  [0.2, 3.25],
  [0.24, 3.3],
  [0.22, 3.35],
  [0, 3.35],
];

function createFrontLabel(productName: string, brand?: string | null, vintage?: string | null) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#f7f0e4";
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = "#692031";
  ctx.fillRect(0, 0, 1024, 32);
  ctx.fillRect(0, 480, 1024, 32);

  if (brand) {
    ctx.font = "bold 44px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#151411";
    ctx.fillText(brand, 512, 130);
  }

  ctx.font = "bold 64px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#151411";
  const name = productName.length > 20 ? productName.slice(0, 20) + "…" : productName;
  ctx.fillText(name, 512, 250);

  if (vintage) {
    ctx.font = "italic 42px Georgia, serif";
    ctx.fillStyle = "#9b3444";
    ctx.fillText(vintage, 512, 330);
  }

  ctx.font = "24px Georgia, serif";
  ctx.fillStyle = "#71695f";
  ctx.fillText("Jérusalem · Terminal 3", 512, 405);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createBackLabel(brand?: string | null) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#f0e6d6";
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = "#151411";
  ctx.font = "bold 24px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(brand?.trim() ? brand : "Cave Terminal 3", 256, 220);
  ctx.font = "italic 20px Georgia, serif";
  ctx.fillText("Jérusalem", 256, 260);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(128, 64, 6, 128, 64, 120);
  gradient.addColorStop(0, "rgba(0,0,0,0.5)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function BottleMesh({
  productName,
  brand,
  vintage,
  mouseX,
  mouseY,
  paused,
  reducedMotion,
}: HeroBottle3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const scale = useMemo(() => {
    const base = Math.min(viewport.width, 3.4) * 0.58;
    return Math.max(0.9, base);
  }, [viewport.width]);

  const points = useMemo(
    () => BOTTLE_POINTS.map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );

  const frontTexture = useMemo(
    () => createFrontLabel(productName ?? "Bouteille", brand, vintage),
    [productName, brand, vintage],
  );

  const backTexture = useMemo(
    () => createBackLabel(brand),
    [brand],
  );

  const shadowTexture = useMemo(() => createShadowTexture(), []);

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x0a120c),
        emissive: new THREE.Color(0x050a08),
        metalness: 0.05,
        roughness: 0.16,
        transmission: 0.15,
        thickness: 0.5,
        ior: 1.52,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.97,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const frontMaterial = useMemo(
    () =>
      frontTexture
        ? new THREE.MeshStandardMaterial({
            map: frontTexture,
            roughness: 0.7,
            metalness: 0.0,
            side: THREE.DoubleSide,
            transparent: true,
          })
        : null,
    [frontTexture],
  );

  const backMaterial = useMemo(
    () =>
      backTexture
        ? new THREE.MeshStandardMaterial({
            map: backTexture,
            roughness: 0.75,
            metalness: 0.0,
            side: THREE.DoubleSide,
            transparent: true,
          })
        : null,
    [backTexture],
  );

  const shadowMaterial = useMemo(
    () =>
      shadowTexture
        ? new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.65,
            depthWrite: false,
          })
        : null,
    [shadowTexture],
  );

  const foilMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3d2b1f),
        roughness: 0.45,
        metalness: 0.25,
      }),
    [],
  );

  const capsuleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x9b3444),
        roughness: 0.35,
        metalness: 0.2,
      }),
    [],
  );

  useFrame(() => {
    if (!groupRef.current) return;

    if (!paused && !reducedMotion) {
      groupRef.current.rotation.y += 0.003;
    }

    const targetTiltX = -mouseY.get() * 0.15;
    const targetTiltY = mouseX.get() * 0.15;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTiltX, 0.04);
    groupRef.current.rotation.y += THREE.MathUtils.lerp(0, targetTiltY, 0.04) * 0.012;
  });

  if (!frontMaterial || !backMaterial || !shadowMaterial) return null;

  return (
    <group scale={scale} position={[0, -1.7, 0]}>
      <group ref={groupRef}>
        <mesh geometry={new THREE.LatheGeometry(points, 72)} material={glassMaterial} castShadow />

        {/* Front label */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.635, 0.635, 0.9, 64, 1, true, -Math.PI * 0.22, Math.PI * 0.44]} />
          <primitive object={frontMaterial} attach="material" />
        </mesh>

        {/* Back label */}
        <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI, 0]} castShadow>
          <cylinderGeometry args={[0.635, 0.635, 0.9, 64, 1, true, -Math.PI * 0.22, Math.PI * 0.44]} />
          <primitive object={backMaterial} attach="material" />
        </mesh>

        {/* Foil */}
        <mesh position={[0, 3.22, 0]} castShadow>
          <cylinderGeometry args={[0.205, 0.205, 0.22, 48]} />
          <primitive object={foilMaterial} attach="material" />
        </mesh>

        {/* Capsule */}
        <mesh position={[0, 3.38, 0]} castShadow>
          <cylinderGeometry args={[0.21, 0.21, 0.1, 48]} />
          <primitive object={capsuleMaterial} attach="material" />
        </mesh>
      </group>

      {/* Elliptical shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[2.8, 1.3]} />
        <primitive object={shadowMaterial} attach="material" />
      </mesh>
    </group>
  );
}

function Scene(props: HeroBottle3DProps) {
  return (
    <>
      <ambientLight intensity={0.5} color="#fff3e0" />
      <spotLight position={[3.5, 5.5, 4]} angle={0.35} penumbra={0.55} intensity={1.8} color="#C6A15B" castShadow />
      <spotLight position={[-3.5, 4, 3.5]} angle={0.5} penumbra={0.8} intensity={0.9} color="#9B3444" />
      <pointLight position={[1.5, -2, 2.5]} intensity={0.4} color="#C6A15B" />
      <pointLight position={[-1.5, -2, 2.5]} intensity={0.2} color="#ffffff" />
      <pointLight position={[0, 4.5, 2]} intensity={0.25} color="#ffffff" />
      <BottleMesh {...props} />
    </>
  );
}

export function HeroBottle3D(props: HeroBottle3DProps) {
  return (
    <div className="h-full w-full" role="img" aria-label="Bouteille de vin présentée en vue interactive 3D">
      <Canvas
        dpr={1.5}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0, 6.2], fov: 34 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
