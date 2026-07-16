"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyCluster, GalaxyGame } from "./galaxyData";
import { NODE_TONE_COLOR } from "./galaxyData";

/**
 * The 3D studio galaxy. Category constellations arranged radially; each game
 * is a distinct world. Selecting a game eases the camera toward it and its
 * system nodes orbit as a small constellation. Rendering pauses when the tab
 * is hidden, and the whole scene is skipped for reduced motion (2D fallback).
 */

const CLUSTER_RADIUS = 11;

type Vec3 = [number, number, number];

function clusterPosition(index: number, total: number): Vec3 {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(angle) * CLUSTER_RADIUS, Math.sin(angle) * 2.2, Math.sin(angle) * CLUSTER_RADIUS * 0.62];
}

function gamePosition(cluster: Vec3, index: number, total: number): Vec3 {
  if (total === 1) return cluster;
  const spread = 3.4;
  const angle = (index / total) * Math.PI * 2;
  return [
    cluster[0] + Math.cos(angle) * spread,
    cluster[1] + (index % 2 === 0 ? 0.6 : -0.6),
    cluster[2] + Math.sin(angle) * spread,
  ];
}

/* ---------- distinct world meshes ---------- */

function CozyPlanet(props: ThreeElements["group"]) {
  // Starville: cozy green planet with cottages and warm lanterns.
  return (
    <group {...props}>
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshStandardMaterial color="#2d8a66" roughness={0.85} />
      </mesh>
      {[0, 1.3, 2.4, 3.8, 5.1].map((a, i) => (
        <group key={i} rotation={[0, a, i % 2 ? 0.4 : -0.3]}>
          <mesh position={[0, 1.22, 0]}>
            <boxGeometry args={[0.22, 0.16, 0.22]} />
            <meshStandardMaterial color={i % 2 ? "#d9cdb8" : "#c9a84c"} roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.34, 0]}>
            <coneGeometry args={[0.17, 0.14, 4]} />
            <meshStandardMaterial color="#8a5a3a" roughness={0.8} />
          </mesh>
        </group>
      ))}
      <pointLight color="#ffd9a0" intensity={2.2} distance={4} position={[0, 1.6, 0.6]} />
    </group>
  );
}

function CreatureHabitat(props: ThreeElements["group"]) {
  // Pokentara: mysterious collector world with orbiting creature orbs.
  return (
    <group {...props}>
      <mesh>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial color="#3a2f6b" roughness={0.5} metalness={0.2} flatShading />
      </mesh>
      <mesh rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[1.7, 0.03, 8, 48]} />
        <meshStandardMaterial color="#9085e9" emissive="#9085e9" emissiveIntensity={0.4} />
      </mesh>
      {[0, 2.1, 4.2].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 1.7, Math.sin(a) * 0.25, Math.sin(a) * 1.7]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial
            color={["#6ecf9b", "#e0b85c", "#e07a6a"][i]}
            emissive={["#6ecf9b", "#e0b85c", "#e07a6a"][i]}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function PixelTown(props: ThreeElements["group"]) {
  // Mythimon: voxel-flavored town on a floating slab.
  return (
    <group {...props}>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[2.2, 0.4, 2.2]} />
        <meshStandardMaterial color="#1a4a38" roughness={0.9} flatShading />
      </mesh>
      {[
        [-0.6, 0.15, -0.5, "#c76b4a"],
        [0.55, 0.25, -0.35, "#d9cdb8"],
        [0.1, 0.2, 0.55, "#8fb573"],
        [-0.55, 0.3, 0.5, "#b39ddb"],
      ].map(([x, h, z, color], i) => (
        <mesh key={i} position={[x as number, (h as number) / 2 - 0.1, z as number]}>
          <boxGeometry args={[0.42, (h as number) + 0.35, 0.42]} />
          <meshStandardMaterial color={color as string} roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function TropicalIsland(props: ThreeElements["group"]) {
  // Sailana: ocean ring, sandy island, palm cone.
  return (
    <group {...props}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 0.12, 32]} />
        <meshStandardMaterial color="#1b6f8a" roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.75, 0.5, 24]} />
        <meshStandardMaterial color="#e3d2a8" roughness={0.9} />
      </mesh>
      <mesh position={[0.2, 0.75, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#8a5a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0.2, 1.1, 0]}>
        <coneGeometry args={[0.32, 0.28, 6]} />
        <meshStandardMaterial color="#2d8a66" roughness={0.8} />
      </mesh>
    </group>
  );
}

function TowerWorld(props: ThreeElements["group"]) {
  // SolTower: stacked tiers, faint because mostly undefined.
  return (
    <group {...props}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, i * 0.45 - 0.5, 0]}>
          <boxGeometry args={[1.3 - i * 0.22, 0.36, 1.3 - i * 0.22]} />
          <meshStandardMaterial
            color="#0f3138"
            roughness={0.6}
            transparent
            opacity={0.55 + i * 0.1}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.35, 0]}>
        <octahedronGeometry args={[0.22]} />
        <meshStandardMaterial color="#c9a84c" emissive="#c9a84c" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function DraftNebula(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial color="#7a9086" transparent opacity={0.35} wireframe />
      </mesh>
    </group>
  );
}

const WORLDS: Record<GalaxyGame["world"], (p: ThreeElements["group"]) => React.ReactElement> = {
  cozy_planet: CozyPlanet,
  creature_habitat: CreatureHabitat,
  pixel_town: PixelTown,
  tropical_island: TropicalIsland,
  tower: TowerWorld,
  draft_nebula: DraftNebula,
};

/* ---------- orbiting system nodes for selected game ---------- */

function SystemOrbit({ game }: { game: GalaxyGame }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });
  return (
    <group ref={ref}>
      {game.nodes.map((node, i) => {
        const angle = (i / Math.max(1, game.nodes.length)) * Math.PI * 2;
        const r = 2.4;
        return (
          <mesh key={node.name} position={[Math.cos(angle) * r, 0.3, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial
              color={NODE_TONE_COLOR[node.tone]}
              emissive={NODE_TONE_COLOR[node.tone]}
              emissiveIntensity={node.tone === "faint" ? 0.1 : 0.6}
              transparent
              opacity={node.tone === "faint" ? 0.5 : 1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function BlockerPulse() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.12;
    ref.current.scale.setScalar(s);
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.25 + (Math.sin(clock.elapsedTime * 2.2) + 1) * 0.12;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.75, 20, 20]} />
      <meshStandardMaterial color="#e07a6a" transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
}

/* ---------- camera rig ---------- */

function CameraRig({ target }: { target: Vec3 | null }) {
  const goal = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, delta) => {
    if (target) {
      goal.set(target[0] + 4.5, target[1] + 3, target[2] + 5.5);
      look.set(target[0], target[1], target[2]);
    } else {
      goal.set(0, 9, 20);
      look.set(0, 0, 0);
    }
    const t = Math.min(1, delta * 2);
    camera.position.lerp(goal, t);
    camera.lookAt(look);
  });
  return null;
}

/* ---------- stars ---------- */

function Stars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(500 * 3);
    // Deterministic pseudo-random star placement.
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 500; i++) {
      arr[i * 3] = (rand() - 0.5) * 90;
      arr[i * 3 + 1] = (rand() - 0.5) * 60;
      arr[i * 3 + 2] = (rand() - 0.5) * 90;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#c5e6d6" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function GentleSpin({ children, paused }: { children: React.ReactNode; paused: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && !paused) ref.current.rotation.y += delta * 0.02;
  });
  return <group ref={ref}>{children}</group>;
}

/* ---------- scene ---------- */

export default function Galaxy3D({
  clusters,
  selectedSlug,
  onSelect,
  visible,
}: {
  clusters: GalaxyCluster[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const layout = useMemo(() => {
    const items: { game: GalaxyGame; pos: Vec3; clusterName: string }[] = [];
    const clusterCenters: { name: string; pos: Vec3; count: number }[] = [];
    clusters.forEach((cluster, ci) => {
      const center = clusterPosition(ci, clusters.length);
      clusterCenters.push({ name: cluster.name, pos: center, count: cluster.games.length });
      cluster.games.forEach((game, gi) => {
        items.push({
          game,
          pos: gamePosition(center, gi, cluster.games.length),
          clusterName: cluster.name,
        });
      });
    });
    return { items, clusterCenters };
  }, [clusters]);

  const selected = layout.items.find((i) => i.game.slug === selectedSlug) ?? null;

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      camera={{ position: [0, 9, 20], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      aria-hidden="true"
      style={{ cursor: hovered ? "pointer" : "grab", touchAction: "none" }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#06140f"]} />
      <fog attach="fog" args={["#06140f", 24, 55]} />
      <ambientLight intensity={0.55} color="#c5e6d6" />
      <directionalLight position={[8, 12, 6]} intensity={1.1} color="#f7f2e8" />
      <CameraRig target={selected ? selected.pos : null} />
      <Stars />
      <GentleSpin paused={selectedSlug != null}>
        {/* constellation lines between games in a cluster */}
        {clusters.map((cluster, ci) => {
          const center = clusterPosition(ci, clusters.length);
          return cluster.games.map((game, gi) => {
            const pos = gamePosition(center, gi, cluster.games.length);
            const pts = new Float32Array([...center, ...pos]);
            return (
              <line key={`${cluster.key}-${game.slug}`}>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[pts, 3]} />
                </bufferGeometry>
                <lineBasicMaterial color="#2d8a66" transparent opacity={0.35} />
              </line>
            );
          });
        })}
        {/* cluster anchors */}
        {layout.clusterCenters.map((c) => (
          <mesh key={c.name} position={c.pos}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color="#c9a84c" />
          </mesh>
        ))}
        {/* game worlds */}
        {layout.items.map(({ game, pos }) => {
          const World = WORLDS[game.world];
          const isSelected = game.slug === selectedSlug;
          const isHovered = game.slug === hovered;
          return (
            <group
              key={game.slug}
              position={pos}
              scale={isSelected ? 1.15 : isHovered ? 1.08 : 1}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(game.slug);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(game.slug);
              }}
              onPointerOut={() => setHovered(null)}
            >
              <World />
              {game.hasBlocker && <BlockerPulse />}
              {isSelected && <SystemOrbit game={game} />}
            </group>
          );
        })}
      </GentleSpin>
    </Canvas>
  );
}
