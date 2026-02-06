"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleSystemProps {
    count?: number;
    radius?: number;
}

// Optimized orbiting particles using instanced points
function OrbitingParticles({ count = 60, radius = 2.2 }: ParticleSystemProps) {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius + (Math.random() - 0.5) * 0.3;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            speeds[i] = 0.15 + Math.random() * 0.2;
        }

        return { positions, speeds };
    }, [count, radius]);

    useFrame(() => {
        if (!pointsRef.current) return;
        const positionAttr = pointsRef.current.geometry.attributes.position;
        const pos = positionAttr.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const x = pos[i3];
            const z = pos[i3 + 2];

            const currentRadius = Math.sqrt(x * x + z * z);
            const angle = Math.atan2(z, x) + speeds[i] * 0.008;

            pos[i3] = Math.cos(angle) * currentRadius;
            pos[i3 + 2] = Math.sin(angle) * currentRadius;
        }

        positionAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
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
                size={0.025}
                color="#00ff9d"
                transparent
                opacity={0.7}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// Simplified rising particles
function RisingParticles({ count = 25 }: { count?: number }) {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 1.6 + Math.random() * 0.2;

            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = -2 + Math.random() * 4;
            positions[i * 3 + 2] = Math.sin(angle) * r;

            speeds[i] = 0.3 + Math.random() * 0.5;
        }

        return { positions, speeds };
    }, [count]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;
        const positionAttr = pointsRef.current.geometry.attributes.position;
        const pos = positionAttr.array as Float32Array;

        for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] += speeds[i] * delta;
            if (pos[i * 3 + 1] > 2.5) pos[i * 3 + 1] = -2;
        }

        positionAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
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
                size={0.02}
                color="#00b8ff"
                transparent
                opacity={0.5}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// Simplified floating shapes - reduced count and simplified geometry
function FloatingShapes() {
    const groupRef = useRef<THREE.Group>(null);

    const shapes = useMemo(() => {
        const items = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 3 + Math.random();
            items.push({
                position: [
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * 2,
                    Math.sin(angle) * radius,
                ] as [number, number, number],
                scale: 0.06 + Math.random() * 0.06,
                speed: 0.3 + Math.random() * 0.3,
            });
        }
        return items;
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;

        groupRef.current.children.forEach((child, i) => {
            const shape = shapes[i];
            if (shape) {
                child.rotation.x = time * shape.speed * 0.5;
                child.rotation.y = time * shape.speed * 0.3;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {shapes.map((shape, i) => (
                <mesh key={i} position={shape.position} scale={shape.scale}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial
                        color="#00ff9d"
                        transparent
                        opacity={0.4}
                        wireframe
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function Particles() {
    return (
        <group>
            <OrbitingParticles count={60} radius={2.2} />
            <RisingParticles count={25} />
            <FloatingShapes />
        </group>
    );
}
