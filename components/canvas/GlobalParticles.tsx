"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Clouds } from "@react-three/drei";
import * as THREE from "three";

function SparseShapes() {
    const groupRef = useRef<THREE.Group>(null);

    // Create sparse, distributed shapes
    const shapes = useMemo(() => {
        const items = [];
        // Spread shapes across a wider area
        for (let i = 0; i < 25; i++) {
            items.push({
                position: [
                    (Math.random() - 0.5) * 20, // Wider X
                    (Math.random() - 0.5) * 15, // Wider Y
                    (Math.random() - 0.5) * 10 - 5, // Deeper Z
                ] as [number, number, number],
                scale: 0.3 + Math.random() * 0.5, // Larger shapes
                rotationSpeed: (Math.random() - 0.5) * 0.4,
                geometryType: Math.random() > 0.5 ? 'octahedron' : 'tetrahedron',
                floatSpeed: 0.002 + Math.random() * 0.005,
                floatOffset: Math.random() * Math.PI * 2,
            });
        }
        return items;
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();
        const scrollY = window.scrollY; // Get scroll position for parallax

        groupRef.current.children.forEach((child, i) => {
            const shape = shapes[i];

            // Continuous Rotation
            child.rotation.x = time * shape.rotationSpeed;
            child.rotation.y = time * shape.rotationSpeed * 0.5;

            // Floating animation + Scroll Parallax
            // We move them UP as user scrolls DOWN to create depth
            const scrollOffset = scrollY * 0.001;

            child.position.y = shape.position[1] + Math.sin(time * 0.5 + shape.floatOffset) * 0.5 + scrollOffset;
        });
    });

    return (
        <group ref={groupRef}>
            {shapes.map((shape, i) => (
                <mesh key={i} position={shape.position} scale={shape.scale}>
                    {shape.geometryType === 'octahedron' ? (
                        <octahedronGeometry args={[1, 0]} />
                    ) : (
                        <tetrahedronGeometry args={[1, 0]} />
                    )}
                    <meshBasicMaterial
                        color="#00ff9d"
                        wireframe
                        transparent
                        opacity={0.3}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

function GlobalStars({ count = 40 }) {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 25; // Wide spread X
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // Wide spread Y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5; // Depth

            speeds[i] = 0.05 + Math.random() * 0.1; // Slow rising speed
        }

        return { positions, speeds };
    }, [count]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;
        const positionAttr = pointsRef.current.geometry.attributes.position;
        const pos = positionAttr.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            pos[i3 + 1] += speeds[i] * delta; // Rise up

            // Reset if too high
            if (pos[i3 + 1] > 10) {
                pos[i3 + 1] = -10;
                pos[i3] = (Math.random() - 0.5) * 25; // Randomize X on reset
            }
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
                size={0.05} // Larger stars
                color="#00b8ff"
                transparent
                opacity={0.8} // Much brighter
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

function GlobalClouds() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y -= delta * 0.005; // Very slow rotation
        }
    });

    return (
        <group ref={groupRef}>
            <Clouds material={THREE.MeshBasicMaterial} limit={50} range={50}>
                {/* Sparse clouds */}
                <Cloud
                    seed={10}
                    bounds={[20, 4, 4]} // Wide bounds
                    volume={6}
                    color="#e0fff8"
                    position={[0, 0, -8]} // Background
                    opacity={0.08} // Boosted
                    speed={0.02}
                    fade={100}
                    segments={10}
                />
                <Cloud
                    seed={11}
                    bounds={[20, 6, 4]}
                    volume={5}
                    color="#c8f7f0"
                    position={[5, 5, -8]}
                    opacity={0.08}
                    speed={0.02}
                    fade={100}
                    segments={10}
                />
            </Clouds>
        </group>
    )
}

export default function GlobalParticles() {
    return (
        <group>
            <SparseShapes />
            <GlobalStars />
            <GlobalClouds />
        </group>
    );
}
