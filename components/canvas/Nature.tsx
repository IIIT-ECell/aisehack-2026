"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            // Slight wind sway
            const time = state.clock.getElapsedTime();
            ref.current.rotation.z = Math.sin(time * 1 + position[0]) * 0.05;
            ref.current.rotation.x = Math.cos(time * 0.8 + position[2]) * 0.05;
        }
    })

    return (
        <group position={position} scale={[scale, scale, scale]} ref={ref}>
            <>
                {/* Trunk */}
                <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.05, 0.1, 1, 5]} />
                    <meshStandardMaterial color="#4a3728" />
                </mesh>
                {/* Foliage */}
                <mesh position={[0, 1.2, 0]}>
                    <dodecahedronGeometry args={[0.6, 0]} />
                    <meshStandardMaterial color="#00ff9d" roughness={0.3} metalness={0.1} />
                </mesh>
            </>
        </group>
    );
}

export default function NatureGrove() {
    const [trees, setTrees] = useState<{ position: [number, number, number], scale: number }[]>([]);

    useEffect(() => {
        const items = [];
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 3 + Math.random() * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = -1.5 + Math.random() * 0.5;
            const scale = 0.5 + Math.random() * 0.5;
            items.push({ position: [x, y, z] as [number, number, number], scale });
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTrees(items);
    }, []);

    return (
        <group rotation={[0.2, 0, 0]}>
            {trees.map((tree, i) => (
                <Tree key={i} position={tree.position} scale={tree.scale} />
            ))}
        </group>
    );
}
