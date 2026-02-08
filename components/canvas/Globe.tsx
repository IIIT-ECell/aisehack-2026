"use client";

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import Atmosphere from "./Atmosphere";

interface GlobeProps {
    mousePosition?: { x: number; y: number };
}

export default function Globe({ mousePosition }: GlobeProps) {
    const parentGroupRef = useRef<THREE.Group>(null);
    const rotationGroupRef = useRef<THREE.Group>(null);

    // Independent rotation refs for meshes
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);

    const targetRotation = useRef({ x: 0, y: 0 });

    const [earthMap, earthBump, cloudMap] = useLoader(TextureLoader, [
        '/texture/earthmap.webp',
        '/texture/earthbump.webp',
        '/texture/earthCloud.webp'
    ]);

    useFrame((_, delta) => {
        if (!parentGroupRef.current || !rotationGroupRef.current) return;

        // --- Scroll Scaling Logic ---
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        // Scale down from 1 to 0.7
        const targetScale = 1 - (Math.min(scrollY / (viewportHeight * 0.5), 1) * 0.3);

        // Smoothly interpolate scale
        parentGroupRef.current.scale.setScalar(
            THREE.MathUtils.lerp(parentGroupRef.current.scale.x, targetScale, 0.1)
        );


        // --- Mouse Interaction (Rotates the Rotation Group) ---
        if (mousePosition) {
            targetRotation.current.y = mousePosition.x * 0.2;
            targetRotation.current.x = mousePosition.y * 0.15;
        }

        rotationGroupRef.current.rotation.y += (targetRotation.current.y - rotationGroupRef.current.rotation.y) * 0.02;
        rotationGroupRef.current.rotation.x += (targetRotation.current.x - rotationGroupRef.current.rotation.x) * 0.02;


        // --- Constant Earth Spin (independent of mouse) ---
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.07;
        }
    });

    return (
        <group ref={parentGroupRef}>
            {/* Atmosphere is OUTSIDE the rotation group so it stays static relative to camera, but SCALES with scroll */}
            <Atmosphere />

            {/* Rotating Group for Earth + Clouds */}
            <group ref={rotationGroupRef}>
                <mesh ref={earthRef}>
                    <sphereGeometry args={[1.5, 64, 64]} />
                    <meshPhongMaterial
                        map={earthMap}
                        bumpMap={earthBump}
                        bumpScale={0.05}
                        specular={new THREE.Color(0x333333)}
                        shininess={15}
                        emissive={new THREE.Color(0x222222)}
                        emissiveIntensity={0.4}
                    />
                </mesh>

                <mesh ref={cloudsRef}>
                    <sphereGeometry args={[1.53, 64, 64]} />
                    <meshPhongMaterial
                        map={cloudMap}
                        transparent={true}
                        opacity={0.4}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>

                {/* Backlight for dramatic effect */}
                <pointLight position={[-10, 10, -10]} intensity={2} color="#4f46e5" />
            </group>
        </group>
    );
}
