"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedText, RevealText } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ArrowDown } from "lucide-react";
import { REGISTRATION_URL } from "./config";

export default function HeroV2() {
    const sectionRef = useRef<HTMLElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

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
            <div className="absolute inset-0 z-[1] pointer-events-none">
                {/* Top/bottom darkening for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25" />
                {/* Soft centered spotlight — gently mutes molecule glow behind the headline */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 600px 420px at 50% 48%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 45%, transparent 75%)",
                    }}
                />
            </div>

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
                    <RevealText delay={0.2}>
                        <span className="inline-block px-6 py-2.5 rounded-full border border-primary/40 bg-black/60 backdrop-blur-md text-white font-semibold text-sm md:text-base uppercase tracking-[0.3em] mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.5)] drop-shadow-lg">
                            2nd Edition · Grand Finale: Sept 2–3, 2026 · Goa
                        </span>
                    </RevealText>

                    <div className="filter">
                        <h1 className="text-8xl md:text-[11rem] lg:text-[13rem] font-bold tracking-tighter mb-8 leading-[0.95]">
                            <AnimatedText
                                text="AISEHack"
                                delay={0.5}
                                staggerDelay={0.05}
                                className="bg-gradient-to-b from-white via-white to-gray-200 bg-clip-text text-transparent drop-shadow-[0_6px_10px_rgba(0,0,0,0.95)]"
                                shimmer
                            />
                        </h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                    >
                        <p className="text-2xl md:text-4xl text-white font-semibold max-w-4xl mx-auto mb-8 leading-tight drop-shadow-[0_4px_6px_rgba(0,0,0,0.95)] antialiased">
                            Are you ready to turn code into an explorer of the macro and micro?
                        </p>
                        <p className="text-lg md:text-2xl text-gray-200 font-medium max-w-3xl mx-auto mb-5 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                            The Anusandhan National Research Foundation (ANRF) invites you to AISEHack <span className="text-primary font-bold">2.0</span>, India&apos;s premier research hackathon at the intersection of Artificial Intelligence, Science, and Engineering.
                        </p>
                        <p className="text-base md:text-xl text-gray-300 font-medium max-w-2xl mx-auto mb-14 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            In coordination with <span className="text-primary font-bold">Galaxeye</span> and <span className="text-secondary font-bold">IIT Madras</span>
                        </p>
                    </motion.div>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                    >
                        <MagneticButton
                            size="lg"
                            variant="primary"
                            className="contrast-125"
                            onClick={() => {
                                if (REGISTRATION_URL && REGISTRATION_URL !== "#") {
                                    window.open(REGISTRATION_URL, "_blank");
                                } else {
                                    const aboutSection = document.getElementById('about');
                                    if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            Register Now
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
                            Explore Themes
                        </MagneticButton>
                    </motion.div>
                </motion.div>
            </motion.div>

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

            <div className="absolute top-8 left-8 w-20 h-20 border-l border-t border-primary/20 z-10" />
            <div className="absolute top-8 right-8 w-20 h-20 border-r border-t border-primary/20 z-10" />
            <div className="absolute bottom-8 left-8 w-20 h-20 border-l border-b border-primary/20 z-10" />
            <div className="absolute bottom-8 right-8 w-20 h-20 border-r border-b border-primary/20 z-10" />
        </section>
    );
}
