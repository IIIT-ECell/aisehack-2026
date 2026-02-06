"use client";

import { Cloud, Clouds } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function FloatingClouds() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y -= delta * 0.015;
        }
    });

    return (
        <group ref={groupRef}>
            <Clouds material={THREE.MeshBasicMaterial} limit={100} range={100}>
                <Cloud
                    seed={1}
                    bounds={[12, 2, 2]}
                    volume={5}
                    color="#e0fff8"
                    position={[3, 1, -2]}
                    opacity={0.1}
                    speed={0.05}
                    fade={80}
                    segments={20}
                />
                <Cloud
                    seed={2}
                    bounds={[12, 2, 2]}
                    volume={4}
                    color="#d4ffed"
                    position={[-3, -0.5, 1]}
                    opacity={0.08}
                    speed={0.04}
                    fade={80}
                    segments={15}
                />
                <Cloud
                    seed={3}
                    bounds={[10, 2, 2]}
                    volume={3}
                    color="#c8f7f0"
                    position={[0, 2, -3]}
                    opacity={0.06}
                    speed={0.03}
                    fade={80}
                    segments={12}
                />
            </Clouds>
        </group>
    );
}
