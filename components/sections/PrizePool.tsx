"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Trophy } from "lucide-react";

function AnimatedNumber({
    target,
    prefix = "",
    suffix = "",
    duration = 2000,
    startAnimation,
}: {
    target: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    startAnimation: boolean;
}) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!startAnimation) return;

        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(eased * target);

            setCurrent(value);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCurrent(target);
            }
        };

        requestAnimationFrame(animate);
    }, [startAnimation, target, duration]);

    return (
        <span>
            {prefix}
            {current.toLocaleString("en-IN")}
            {suffix}
        </span>
    );
}

export default function PrizePool() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="relative py-24 md:py-32 px-4 z-10 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-yellow-500/8 rounded-full blur-[150px]" />
            </div>

            <div className="relative max-w-3xl mx-auto text-center">
                {/* Icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
                    className="mb-8"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto text-yellow-400">
                        <Trophy className="w-7 h-7 md:w-9 md:h-9" />
                    </div>
                </motion.div>

                {/* Label */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-xs md:text-sm uppercase tracking-[0.25em] text-yellow-400/80 font-medium mb-4"
                >
                    Total Prize Pool
                </motion.p>

                {/* Big number */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
                    className="text-7xl sm:text-8xl md:text-9xl font-bold text-yellow-400 tracking-tight mb-4 drop-shadow-[0_0_40px_rgba(250,204,21,0.25)]"
                >
                    <AnimatedNumber
                        target={700000}
                        prefix="₹"
                        suffix=""
                        duration={2000}
                        startAnimation={isInView}
                    />
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-gray-400 text-base md:text-lg"
                >
                    Up for grabs for the winning teams
                </motion.p>
            </div>
        </section>
    );
}