"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Deep field of dim distant stars covering the whole viewport.
function DeepStars({ count = 600 }: { count?: number }) {
    const ref = useRef<THREE.Points>(null);
    const twinkle = useRef<Float32Array | null>(null);

    const { positions, sizes, basePhase } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const basePhase = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 2] = -8 - Math.random() * 8;
            sizes[i] = 0.03 + Math.random() * 0.06;
            basePhase[i] = Math.random() * Math.PI * 2;
        }
        return { positions, sizes, basePhase };
    }, [count]);

    useFrame((state) => {
        if (!ref.current) return;
        const mat = ref.current.material as THREE.PointsMaterial;
        // Subtle global twinkle by oscillating opacity.
        const t = state.clock.elapsedTime;
        mat.opacity = 0.55 + Math.sin(t * 0.6) * 0.08;

        // First call init twinkle
        if (!twinkle.current) {
            twinkle.current = basePhase;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    array={sizes}
                    itemSize={1}
                    args={[sizes, 1]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color="#dbeafe"
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// Brighter, closer accent stars in cyan / teal.
function AccentStars({ count = 80 }: { count?: number }) {
    const ref = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 25;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
            arr[i * 3 + 2] = -2 - Math.random() * 8;
        }
        return arr;
    }, [count]);

    useFrame((_, delta) => {
        if (!ref.current) return;
        ref.current.rotation.z += delta * 0.005;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.07}
                color="#00b8ff"
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// Far away galaxy / nebula disc — a faint tilted ring of dust suggesting a galactic plane.
function DistantGalaxy() {
    const groupRef = useRef<THREE.Group>(null);
    const dustRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const count = 1200;
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Logarithmic spiral arms
            const arm = Math.floor(Math.random() * 2);
            const t = Math.random();
            const angle = t * Math.PI * 6 + (arm * Math.PI);
            const r = 0.5 + t * 6;
            const jitter = (Math.random() - 0.5) * 0.6;
            arr[i * 3] = Math.cos(angle) * r + jitter;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 0.4 * (1 - t);
            arr[i * 3 + 2] = Math.sin(angle) * r + jitter;
        }
        return arr;
    }, []);

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y -= delta * 0.02;
    });

    return (
        <group ref={groupRef} position={[6, 3, -14]} rotation={[Math.PI / 3.5, 0, Math.PI / 6]} scale={0.7}>
            <points ref={dustRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.045}
                    color="#a78bfa"
                    transparent
                    opacity={0.55}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
            {/* Bright core */}
            <mesh>
                <sphereGeometry args={[0.35, 24, 24]} />
                <meshBasicMaterial
                    color="#fef9c3"
                    transparent
                    opacity={0.45}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

// A slow drift of bonus floating molecules / shapes in the periphery (subtle).
function FloatingMolecules() {
    const groupRef = useRef<THREE.Group>(null);

    const items = useMemo(() => {
        const out = [];
        for (let i = 0; i < 6; i++) {
            out.push({
                pos: [
                    (Math.random() - 0.5) * 18,
                    (Math.random() - 0.5) * 14,
                    -4 - Math.random() * 6,
                ] as [number, number, number],
                scale: 0.18 + Math.random() * 0.18,
                speed: 0.1 + Math.random() * 0.2,
                offset: Math.random() * Math.PI * 2,
            });
        }
        return out;
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        groupRef.current.children.forEach((child, i) => {
            const it = items[i];
            child.rotation.x = t * it.speed;
            child.rotation.y = t * it.speed * 0.7;
            child.position.y = it.pos[1] + Math.sin(t * 0.3 + it.offset) * 0.4;
        });
    });

    return (
        <group ref={groupRef}>
            {items.map((it, i) => (
                <mesh key={i} position={it.pos} scale={it.scale}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? "#00ff9d" : "#00b8ff"}
                        wireframe
                        transparent
                        opacity={0.18}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function SpaceField() {
    return (
        <group>
            <DeepStars count={550} />
            <AccentStars count={70} />
            <DistantGalaxy />
            <FloatingMolecules />
        </group>
    );
}
