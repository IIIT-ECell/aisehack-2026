"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Globe from "./Globe";
import FloatingClouds from "./Cloud";
import Particles from "./Particles";

interface HeroSceneContentProps {
    mousePosition: { x: number; y: number };
}

export default function HeroSceneContent({ mousePosition }: HeroSceneContentProps) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;

        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;

        const scrollProgress = Math.min(scrollY / viewportHeight, 1);

        const fadeStart = 0.0;
        const fadeEnd = 0.6;

        let targetScale = 1;
        if (scrollProgress > fadeStart) {
            const progress = Math.min((scrollProgress - fadeStart) / (fadeEnd - fadeStart), 1);
            targetScale = 1 - (progress * 0.3);
        }

        const targetZ = -scrollProgress * 3;

        groupRef.current.scale.setScalar(
            THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08)
        );

        const targetY = scrollY * 0.001;
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08);

        groupRef.current.visible = true;
    });

    const scrollScrollParallax = (scrollY: number) => {
        return scrollY * 0.001;
    }

    return (
        <group ref={groupRef}>
            <Globe mousePosition={mousePosition} />
            <FloatingClouds />
            <Particles />
        </group>
    );
}
