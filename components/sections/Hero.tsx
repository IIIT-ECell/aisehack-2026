"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedText, RevealText } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import Scene from "@/components/canvas/Scene";
import Globe from "@/components/canvas/Globe";
import FloatingClouds from "@/components/canvas/Cloud";
import Particles from "@/components/canvas/Particles";
import { ArrowDown } from "lucide-react";

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Scroll-based animations
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    // Mouse tracking for parallax
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMousePosition({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative h-screen w-full overflow-hidden flex items-center justify-center"
        >
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Scene>
                    <Globe mousePosition={mousePosition} />
                    <FloatingClouds />
                    <Particles />
                </Scene>
            </div>

            {/* Gradient overlays for depth */}
            <div className="absolute inset-0 z-[1] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
            </div>

            {/* Content Overlay */}
            <motion.div
                className="relative z-10 container mx-auto px-4 text-center"
                style={{ opacity, y }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="pointer-events-auto relative"
                    style={{
                        transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`,
                    }}
                >
                    {/* Date badge */}
                    <RevealText delay={0.2}>
                        <span className="inline-block px-6 py-2 rounded-full border border-primary/40 bg-black/60 backdrop-blur-md text-white font-semibold text-sm uppercase tracking-[0.3em] mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.5)] drop-shadow-lg">
                            March 1 - April 5, 2026
                        </span>
                    </RevealText>

                    {/* Main title with character animation */}
                    <div className="filter">
                        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-6">
                            <AnimatedText
                                text="AISEHack"
                                delay={0.5}
                                staggerDelay={0.05}
                                className="bg-gradient-to-b from-white via-white to-gray-300 bg-clip-text text-transparent drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                                shimmer
                            />
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                    >
                        <p className="text-xl md:text-3xl text-white font-semibold max-w-3xl mx-auto mb-6 leading-relaxed drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] antialiased">
                            Are you ready to turn code into climate action?
                        </p>
                        <p className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            India’s premier hackathon at the intersection of <span className="text-emerald-400 font-bold drop-shadow-lg">Artificial Intelligence</span>,{" "}
                            <span className="text-blue-400 font-bold drop-shadow-lg">Science</span> &{" "}
                            <span className="text-purple-400 font-bold drop-shadow-lg">Engineering</span>.
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                    >
                        <MagneticButton
                            size="lg"
                            variant="primary"
                            disabled
                            className="opacity-80 cursor-not-allowed contrast-125"
                        >
                            Coming Soon
                        </MagneticButton>
                        <MagneticButton
                            size="lg"
                            variant="outline"
                            onClick={() => {
                                const tracksSection = document.getElementById('tracks');
                                if (tracksSection) {
                                    tracksSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            Explore Tracks
                        </MagneticButton>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            >
                <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                    <ArrowDown className="w-5 h-5 text-primary" />
                </motion.div>
            </motion.div>

            {/* Corner decorations */}
            <div className="absolute top-8 left-8 w-20 h-20 border-l border-t border-primary/20 z-10" />
            <div className="absolute top-8 right-8 w-20 h-20 border-r border-t border-primary/20 z-10" />
            <div className="absolute bottom-8 left-8 w-20 h-20 border-l border-b border-primary/20 z-10" />
            <div className="absolute bottom-8 right-8 w-20 h-20 border-r border-b border-primary/20 z-10" />
        </section>
    );
}
