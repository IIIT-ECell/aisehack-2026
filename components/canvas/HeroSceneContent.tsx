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

        // Calculate fade/scale factor
        // 0 at top, 1 at 100vh scroll
        const scrollProgress = Math.min(scrollY / viewportHeight, 1);

        // Scale down and move up/away slightly as we scroll
        // Maintain the Globe's internal scaling logic, but we can also add a global fade here if materials support it.
        // Since materials are inside children, changing group opacity is tricky without traverse.
        // Instead, let's just use the scale to hide it effectively.

        // Note: Globe.tsx HAS ITS OWN SCROLL LOGIC. We should be careful not to conflict.
        // Globe.tsx logic: scale * (1 - scroll * 0.3)
        // Check if we need to override or just let Globe handle itself.
        // Globe handles itself. particles/clouds do not.

        // Smooth transition logic
        // We want to fade out/scale down the hero content as we scroll down
        // 0 to 1 scroll progress

        // Calculate target scale: 1 at top, 0 at bottom
        // We start fading out earlier, say after 20% scroll
        const fadeStart = 0.1;
        const fadeEnd = 0.8;

        let targetScale = 1;
        if (scrollProgress > fadeStart) {
            targetScale = 1 - ((scrollProgress - fadeStart) / (fadeEnd - fadeStart));
            targetScale = Math.max(0, targetScale); // Clamp to 0
        }

        // Apply smooth interruption-free lerp
        // Note: Using a fixed lerp factor (0.1) provides a smooth delay
        groupRef.current.scale.setScalar(
            THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1)
        );

        // Also move it up slightly as we scroll down
        const targetY = scrollY * 0.002;
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);

        // Only hide if effectively invisible
        groupRef.current.visible = groupRef.current.scale.x > 0.01;
    });

    const scrollScrollParallax = (scrollY: number) => {
        return scrollY * 0.001; // Tiny bit of movement
    }

    return (
        <group ref={groupRef}>
            <Globe mousePosition={mousePosition} />
            <FloatingClouds />
            <Particles />
        </group>
    );
}
