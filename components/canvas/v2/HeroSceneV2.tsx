"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Molecule from "./Molecule";

interface HeroSceneV2Props {
    mousePosition: { x: number; y: number };
}

export default function HeroSceneV2({ mousePosition }: HeroSceneV2Props) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;

        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const scrollProgress = Math.min(scrollY / viewportHeight, 1);

        const targetScale = 1 - scrollProgress * 0.3;
        const targetZ = -scrollProgress * 3;
        const targetY = scrollY * 0.001;

        groupRef.current.scale.setScalar(
            THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08)
        );
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08);
    });

    return (
        // Compact molecule sits behind the headline — like the planet did in v1.
        <group ref={groupRef} position={[0, 0, -2]} scale={1}>
            <Molecule mousePosition={mousePosition} />
        </group>
    );
}
