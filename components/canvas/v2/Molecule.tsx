"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MoleculeProps {
    mousePosition?: { x: number; y: number };
}

// A stylised molecule: central nucleus, 6 outer atoms tetrahedrally distributed,
// bonds drawn as thin emissive cylinders, plus a soft orbital halo.
export default function Molecule({ mousePosition }: MoleculeProps) {
    const parentGroupRef = useRef<THREE.Group>(null);
    const rotationGroupRef = useRef<THREE.Group>(null);
    const haloRef = useRef<THREE.Group>(null);

    const targetRotation = useRef({ x: 0, y: 0 });

    // Outer atom positions — distorted icosahedron-ish layout.
    const outerAtoms = useMemo(() => {
        const positions: { pos: [number, number, number]; color: string; size: number }[] = [];
        // Richer, more saturated palette — no whites, leaning into purples/magentas + brand cyan/green.
        const palette = ["#7c3aed", "#ec4899", "#00b8ff", "#f97316", "#a855f7", "#00ff9d", "#22d3ee"];
        const count = 7;
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            const r = 1.15; // tighter — atoms stay inside the headline footprint
            positions.push({
                pos: [
                    r * Math.cos(theta) * Math.sin(phi),
                    r * Math.sin(theta) * Math.sin(phi),
                    r * Math.cos(phi),
                ],
                color: palette[i % palette.length],
                size: 0.09 + (i % 3) * 0.02,
            });
        }
        return positions;
    }, []);

    // Orbital electrons travelling around the molecule on tilted rings.
    const electrons = useMemo(() => {
        return [
            { radius: 1.45, tilt: [Math.PI / 3, 0, 0] as [number, number, number], speed: 0.9, color: "#ec4899" },
            { radius: 1.6, tilt: [0, Math.PI / 4, Math.PI / 6] as [number, number, number], speed: 0.6, color: "#00b8ff" },
            { radius: 1.75, tilt: [Math.PI / 6, Math.PI / 3, 0] as [number, number, number], speed: 0.7, color: "#7c3aed" },
        ];
    }, []);

    useFrame((state, delta) => {
        if (!parentGroupRef.current || !rotationGroupRef.current) return;

        const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
        const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1;
        const targetScale = 1 - Math.min(scrollY / (viewportHeight * 0.5), 1) * 0.3;

        parentGroupRef.current.scale.setScalar(
            THREE.MathUtils.lerp(parentGroupRef.current.scale.x, targetScale, 0.1)
        );

        if (mousePosition) {
            targetRotation.current.y = mousePosition.x * 0.35;
            targetRotation.current.x = mousePosition.y * 0.25;
        }

        rotationGroupRef.current.rotation.y += (targetRotation.current.y - rotationGroupRef.current.rotation.y) * 0.02;
        rotationGroupRef.current.rotation.x += (targetRotation.current.x - rotationGroupRef.current.rotation.x) * 0.02;
        rotationGroupRef.current.rotation.y += delta * 0.12;
        rotationGroupRef.current.rotation.z += delta * 0.03;

        if (haloRef.current) {
            haloRef.current.rotation.x += delta * 0.05;
            haloRef.current.rotation.y -= delta * 0.04;
            haloRef.current.children.forEach((child, i) => {
                const t = state.clock.elapsedTime * electrons[i].speed;
                const r = electrons[i].radius;
                child.position.x = Math.cos(t) * r;
                child.position.z = Math.sin(t) * r;
                child.position.y = Math.sin(t * 0.5) * 0.4;
            });
        }
    });

    return (
        <group ref={parentGroupRef}>
            <group ref={rotationGroupRef}>
                {/* Central nucleus — solid purple core. No additive shell (bloom does the glow). */}
                <mesh>
                    <icosahedronGeometry args={[0.32, 1]} />
                    <meshPhongMaterial
                        color="#3b0764"
                        emissive="#a855f7"
                        emissiveIntensity={0.25}
                        shininess={80}
                        specular={new THREE.Color(0x6d28d9)}
                    />
                </mesh>

                {/* Bonds — thin emissive cylinders from nucleus to each outer atom */}
                {outerAtoms.map((atom, i) => {
                    const target = new THREE.Vector3(...atom.pos);
                    const length = target.length();
                    const mid = target.clone().multiplyScalar(0.5);
                    const direction = target.clone().normalize();
                    const quaternion = new THREE.Quaternion().setFromUnitVectors(
                        new THREE.Vector3(0, 1, 0),
                        direction
                    );
                    return (
                        <mesh key={`bond-${i}`} position={mid.toArray()} quaternion={quaternion}>
                            <cylinderGeometry args={[0.012, 0.012, length, 6, 1, true]} />
                            <meshBasicMaterial
                                color={atom.color}
                                transparent
                                opacity={0.25}
                                depthWrite={false}
                            />
                        </mesh>
                    );
                })}

                {/* Outer atoms — no halo meshes; bloom adds glow naturally. */}
                {outerAtoms.map((atom, i) => (
                    <mesh key={`atom-${i}`} position={atom.pos}>
                        <sphereGeometry args={[atom.size, 24, 24]} />
                        <meshPhongMaterial
                            color={atom.color}
                            emissive={atom.color}
                            emissiveIntensity={0.18}
                            shininess={100}
                        />
                    </mesh>
                ))}

                {/* Wireframe orbital cage suggests electron shells */}
                <mesh>
                    <icosahedronGeometry args={[1.3, 1]} />
                    <meshBasicMaterial
                        color="#a855f7"
                        wireframe
                        transparent
                        opacity={0.12}
                        depthWrite={false}
                    />
                </mesh>

                {/* Tilted ring rings (like Bohr orbits) */}
                {electrons.map((el, i) => (
                    <mesh key={`ring-${i}`} rotation={el.tilt}>
                        <torusGeometry args={[el.radius, 0.004, 6, 96]} />
                        <meshBasicMaterial
                            color={el.color}
                            transparent
                            opacity={0.22}
                            depthWrite={false}
                        />
                    </mesh>
                ))}

                {/* Backlight */}
                <pointLight position={[-4, 3, -4]} intensity={1.2} color="#7c3aed" />
                <pointLight position={[4, -3, 2]} intensity={0.9} color="#00ff9d" />
            </group>

            {/* Free-moving electrons (not bound to rotation group, so they orbit the camera-facing axis) */}
            <group ref={haloRef}>
                {electrons.map((el, i) => (
                    <mesh key={`electron-${i}`}>
                        <sphereGeometry args={[0.04, 12, 12]} />
                        <meshBasicMaterial color={el.color} transparent opacity={0.85} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}
