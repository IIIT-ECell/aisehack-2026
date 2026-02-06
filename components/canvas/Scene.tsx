"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Suspense } from "react";
import PostProcessing from "./PostProcessing";

interface SceneProps {
    children: React.ReactNode;
    className?: string;
}

export default function Scene({ children, className }: SceneProps) {
    return (
        <div className={className} style={{ width: "100%", height: "100%" }}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{
                    antialias: false, // Disable for performance
                    alpha: true,
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: true,
                }}
                dpr={[1, 1.5]} // Cap DPR for performance
                performance={{ min: 0.5 }}
            >
                <Suspense fallback={null}>
                    {/* Brighter lighting setup */}
                    <ambientLight intensity={1.5} /> {/* Increased ambient */}

                    <spotLight
                        position={[10, 10, 10]}
                        angle={0.5}
                        penumbra={1}
                        intensity={3.5}
                        color="#ffffff"
                    />

                    {/* Front fill light to ensure face is bright */}
                    <directionalLight position={[0, 0, 5]} intensity={2.0} color="#ffffff" />

                    <pointLight
                        position={[-3, 2, 2]}
                        intensity={1.5}
                        color="#00b8ff"
                    />

                    <pointLight
                        position={[0, 0, -4]}
                        intensity={2}
                        color="#00ff9d"
                    />

                    {children}

                    <PostProcessing />
                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    );
}
