"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";

export default function Atmosphere() {
    // Creating a simple radial gradient texture for the glow
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; // Reduced resolution for performance
        canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
            const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
            // Since Earth radius is 1.5 and Sprite scale is ~5, the Earth covers ~60% of the sprite (radius 0.6).
            // We need the glow to be strong AROUND 0.6 and fade out.
            gradient.addColorStop(0, 'rgba(0, 255, 157, 1.0)'); // Center (hidden behind Earth)
            gradient.addColorStop(0.5, 'rgba(0, 255, 157, 0.5)'); // Near edge of Earth
            gradient.addColorStop(0.6, 'rgba(0, 184, 255, 0.4)'); // Visible Rim
            gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Fade to transparent

            context.fillStyle = gradient;
            context.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    return (
        <sprite scale={[5.5, 5.5, 1]} position={[0, 0, -0.1]}>
            <spriteMaterial
                map={texture}
                transparent={true}
                opacity={1.0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </sprite>
    );
}
